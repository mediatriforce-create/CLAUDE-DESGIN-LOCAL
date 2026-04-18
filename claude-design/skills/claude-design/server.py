#!/usr/bin/env python3
"""
claude-design-server.py — Local dev server que emula a plataforma Claude Design.

Funcionalidades:
  ✓ Serve HTML com live reload automático (file watcher → SSE)
  ✓ Tweaks persistence — reescreve /*EDITMODE-BEGIN*/.../*EDITMODE-END*/ no disco
  ✓ Element picker — Ctrl+Click num elemento → captura DOM info para o Claude
  ✓ window.claude.complete() polyfill — proxy para Anthropic API (Haiku 4.5)
  ✓ Screenshot via Playwright (se instalado)
  ✓ Export PDF via Playwright
  ✓ Auto-abre browser

Uso:
  python server.py "caminho/para/design.html"
  python server.py "caminho/para/design.html" --port 8765

Requisitos opcionais (para screenshot/PDF):
  pip install playwright
  playwright install chromium
"""

import http.server
import socketserver
import json
import re
import os
import sys
import threading
import time
import webbrowser
from pathlib import Path
from urllib.parse import urlparse
from typing import Optional

# ── Config ────────────────────────────────────────────────────────────────────
PORT = 8765
DESIGN_FILE: Optional[Path] = None
LAST_MODIFIED: float = 0
SSE_CLIENTS: list = []
LAST_ELEMENT: Optional[dict] = None
SSE_LOCK = threading.Lock()

# ── Script injetado em todo HTML servido ──────────────────────────────────────
INJECT_SCRIPT = """
<script id="__cds__">
(function() {
  'use strict';

  // 1. Live reload via SSE
  var _src = new EventSource('/api/reload');
  _src.onmessage = function() { location.reload(); };
  _src.onerror   = function() { setTimeout(function(){ location.reload(); }, 1000); };

  // 2. Tweaks persistence
  function interceptPostMessage(obj) {
    if (!obj || typeof obj.postMessage !== 'function') return;
    var orig = obj.postMessage.bind(obj);
    obj.postMessage = function(msg, origin, transfer) {
      if (msg && msg.type === '__edit_mode_set_keys' && msg.edits) {
        fetch('/api/tweaks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msg.edits)
        }).catch(function(){});
      }
      return orig(msg, origin, transfer);
    };
  }
  interceptPostMessage(window);
  if (window.parent && window.parent !== window) interceptPostMessage(window.parent);

  // 3. Element picker (Ctrl+Click)
  document.addEventListener('click', function(e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    var path = [];
    var node = el;
    while (node && node.tagName && node !== document.body) {
      var sel = node.tagName.toLowerCase();
      if (node.id) {
        sel += '#' + node.id;
      } else if (node.className && typeof node.className === 'string') {
        var cls = node.className.trim().split(/\s+/).slice(0, 3).join('.');
        if (cls) sel += '.' + cls;
      }
      path.unshift(sel);
      node = node.parentElement;
    }
    var dataAttrs = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-') === 0) dataAttrs[a.name] = a.value;
    }
    // React Fiber traversal com limite de profundidade
    var reactChain = [];
    try {
      var fiberKey = Object.keys(el).find(function(k){ return k.startsWith('__reactFiber'); });
      if (fiberKey) {
        var fiber = el[fiberKey];
        var depth = 0;
        var maxDepth = 20;
        while (fiber && depth < maxDepth) {
          if (fiber.type && typeof fiber.type === 'function' && fiber.type.name) {
            reactChain.push(fiber.type.name);
          }
          fiber = fiber.return;
          depth++;
        }
      }
    } catch(e) {}

    var info = {
      tag:       el.tagName.toLowerCase(),
      id:        el.id || null,
      classes:   Array.from(el.classList),
      text:      el.textContent.trim().slice(0, 140),
      dom:       path.join(' > '),
      react:     reactChain.slice(0, 5),
      dataAttrs: dataAttrs,
      screenLabel: (function() {
        var p = el;
        while (p) {
          if (p.dataset && p.dataset.screenLabel) return p.dataset.screenLabel;
          p = p.parentElement;
        }
        return null;
      })()
    };

    fetch('/api/element', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    }).catch(function(){});

    var prev = el.style.outline;
    el.style.outline = '2px solid #FF6B00';
    el.style.outlineOffset = '2px';
    setTimeout(function() {
      el.style.outline = prev;
      el.style.outlineOffset = '';
    }, 2200);

    console.log('%c[claude-design] element captured', 'color:#FF6B00;font-weight:bold', info);
  }, true);

  // 4. window.claude.complete() polyfill
  window.claude = {
    complete: async function(prompt) {
      var body = typeof prompt === 'string'
        ? { messages: [{ role: 'user', content: prompt }] }
        : prompt;
      try {
        var r = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        var d = await r.json();
        return d.text || d.error || '';
      } catch(err) {
        return '[claude.complete error: ' + err.message + ']';
      }
    }
  };

  // 5. Anunciar Tweaks disponível
  setTimeout(function() {
    window.postMessage({ type: '__edit_mode_available' }, '*');
  }, 200);

  console.log(
    '%c[claude-design server] conectado',
    'background:#FF6B00;color:#fff;padding:2px 6px;border-radius:3px',
    '— Ctrl+Click num elemento para capturá-lo'
  );
})();
</script>
"""

# ── Watcher de arquivo ────────────────────────────────────────────────────────
def watch_file():
    global LAST_MODIFIED
    while True:
        try:
            if DESIGN_FILE and DESIGN_FILE.exists():
                mtime = DESIGN_FILE.stat().st_mtime
                if LAST_MODIFIED and mtime != LAST_MODIFIED:
                    with SSE_LOCK:
                        dead = []
                        for client in list(SSE_CLIENTS):
                            try:
                                client.wfile.write(b"data: reload\n\n")
                                client.wfile.flush()
                            except:
                                dead.append(client)
                        for d in dead:
                            if d in SSE_CLIENTS:
                                SSE_CLIENTS.remove(d)
                LAST_MODIFIED = mtime
        except:
            pass
        time.sleep(0.4)

# ── Tweaks persistence ────────────────────────────────────────────────────────
def apply_tweaks(edits: dict) -> bool:
    try:
        content = DESIGN_FILE.read_text(encoding='utf-8')
        match = re.search(r'(/\*EDITMODE-BEGIN\*/)(.*?)(/\*EDITMODE-END\*/)', content, re.DOTALL)
        if not match:
            print('[tweaks] EDITMODE block not found in file')
            return False
        current = json.loads(match.group(2))
        current.update(edits)
        new_json = json.dumps(current, ensure_ascii=False, separators=(', ', ': '))
        # Validar JSON antes de escrever no disco
        json.loads(new_json)
        new_content = content[:match.start(2)] + new_json + content[match.end(2):]
        DESIGN_FILE.write_text(new_content, encoding='utf-8')
        return True
    except Exception as e:
        print(f'[tweaks error] {e}')
        return False

# ── Screenshot / PDF via Playwright ──────────────────────────────────────────
def playwright_action(action: str) -> Optional[bytes]:
    """action: 'screenshot' | 'pdf'"""
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch()
            try:
                page = browser.new_page(viewport={'width': 1440, 'height': 900})
                page.goto(f'http://localhost:{PORT}/', wait_until='networkidle')
                page.wait_for_timeout(600)
                if action == 'pdf':
                    data = page.pdf(format='A4', print_background=True)
                else:
                    data = page.screenshot(full_page=True)
                return data
            finally:
                browser.close()
    except ImportError:
        return None
    except Exception as e:
        print(f'[playwright error] {e}')
        return None

# ── Proxy Claude API ──────────────────────────────────────────────────────────
def call_claude_api(body: dict) -> dict:
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        return {'error': 'ANTHROPIC_API_KEY não encontrado. Defina a variável de ambiente.'}
    try:
        import urllib.request
        payload = json.dumps({
            'model':      'claude-haiku-4-5-20251001',
            'max_tokens': 1024,
            'messages':   body.get('messages', [])
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.anthropic.com/v1/messages',
            data=payload,
            headers={
                'x-api-key':          api_key,
                'anthropic-version':  '2023-06-01',
                'content-type':       'application/json'
            }
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return {'text': data['content'][0]['text']}
    except Exception as e:
        return {'error': str(e)}

# ── Extensões permitidas para arquivos estáticos ──────────────────────────────
ALLOWED_EXTENSIONS = {
    '.js', '.jsx', '.css', '.png', '.jpg', '.jpeg', '.gif',
    '.svg', '.woff2', '.woff', '.ttf', '.otf', '.json', '.html'
}

MIME_MAP = {
    '.js':   'text/javascript',
    '.jsx':  'text/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.json': 'application/json',
    '.html': 'text/html; charset=utf-8',
}

# ── Request handler ───────────────────────────────────────────────────────────
class DesignHandler(http.server.BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        if args and '/api/' in str(args[0]):
            print(f'  [api] {args[0]}')

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path

        # SSE live reload
        if path == '/api/reload':
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self._cors()
            self.end_headers()
            with SSE_LOCK:
                SSE_CLIENTS.append(self)
            try:
                while True:
                    time.sleep(2)
                    self.wfile.write(b': ping\n\n')
                    self.wfile.flush()
            except:
                with SSE_LOCK:
                    if self in SSE_CLIENTS:
                        SSE_CLIENTS.remove(self)
            return

        # Último elemento capturado
        if path == '/api/element':
            data = json.dumps(LAST_ELEMENT or {}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._cors()
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # Screenshot PNG
        if path == '/api/screenshot':
            img = playwright_action('screenshot')
            if img:
                self.send_response(200)
                self.send_header('Content-Type', 'image/png')
                self.send_header('Content-Length', str(len(img)))
                self.end_headers()
                self.wfile.write(img)
            else:
                err = b'{"error":"playwright nao instalado. Execute: pip install playwright && playwright install chromium"}'
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err)))
                self.end_headers()
                self.wfile.write(err)
            return

        # Export PDF
        if path == '/api/export/pdf':
            pdf = playwright_action('pdf')
            if pdf:
                filename = DESIGN_FILE.stem + '.pdf'
                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf')
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Length', str(len(pdf)))
                self.end_headers()
                self.wfile.write(pdf)
            else:
                err = b'{"error":"playwright nao instalado. Execute: pip install playwright && playwright install chromium"}'
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err)))
                self.end_headers()
                self.wfile.write(err)
            return

        # Serve HTML principal (com injeção)
        if path in ('/', '/index.html'):
            try:
                content = DESIGN_FILE.read_text(encoding='utf-8')
                if '</body>' in content:
                    content = content.replace('</body>', INJECT_SCRIPT + '</body>', 1)
                else:
                    content += INJECT_SCRIPT
                data = content.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                self.send_error(500, str(e))
            return

        # Outros arquivos do mesmo diretório — com proteção contra path traversal
        raw_path = path.lstrip('/')
        allowed_root = DESIGN_FILE.parent.resolve()
        fp = (allowed_root / raw_path).resolve()

        # Garantir que o arquivo está dentro do diretório permitido
        try:
            fp.relative_to(allowed_root)
        except ValueError:
            self.send_error(403, 'Acesso negado')
            return

        if fp.exists() and fp.is_file() and fp.suffix in ALLOWED_EXTENSIONS:
            data = fp.read_bytes()
            mime = MIME_MAP.get(fp.suffix, 'application/octet-stream')
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        self.send_error(404)

    def do_POST(self):
        global LAST_ELEMENT
        path   = urlparse(self.path).path
        length = int(self.headers.get('Content-Length', 0))
        body   = json.loads(self.rfile.read(length)) if length else {}

        # Tweaks
        if path == '/api/tweaks':
            ok   = apply_tweaks(body)
            resp = json.dumps({'ok': ok}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._cors()
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            if ok:
                print(f'  [tweaks] {json.dumps(body, ensure_ascii=False)}')
            return

        # Element capture
        if path == '/api/element':
            LAST_ELEMENT = body
            print(f'\n  \u2554\u2550 element captured \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550')
            print(f'  \u2551  dom:    {body.get("dom", "")[:60]}')
            if body.get('react'):
                print(f'  \u2551  react:  {" > ".join(body["react"][:4])}')
            print(f'  \u2551  tag:    {body.get("tag", "")}')
            print(f'  \u2551  text:   {body.get("text", "")[:60]}')
            if body.get('screenLabel'):
                print(f'  \u2551  slide:  {body.get("screenLabel")}')
            print(f'  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return

        # Claude API proxy
        if path == '/api/claude':
            result = call_claude_api(body)
            resp   = json.dumps(result).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._cors()
            self.send_header('Content-Length', str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        self.send_error(404)


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: python server.py <arquivo.html> [--port 8765]')
        sys.exit(1)

    DESIGN_FILE = Path(sys.argv[1]).resolve()
    if not DESIGN_FILE.exists():
        print(f'Arquivo não encontrado: {DESIGN_FILE}')
        sys.exit(1)

    if '--port' in sys.argv:
        idx = sys.argv.index('--port')
        if idx + 1 >= len(sys.argv):
            print('[erro] --port requer um valor. Ex: --port 3000')
            sys.exit(1)
        try:
            PORT = int(sys.argv[idx + 1])
        except ValueError:
            print(f'[erro] --port deve ser um número inteiro, recebido: {sys.argv[idx+1]}')
            sys.exit(1)

    LAST_MODIFIED = DESIGN_FILE.stat().st_mtime
    threading.Thread(target=watch_file, daemon=True).start()

    url = f'http://localhost:{PORT}/'

    class ReusableTCPServer(socketserver.ThreadingTCPServer):
        allow_reuse_address = True

    with ReusableTCPServer(('localhost', PORT), DesignHandler) as httpd:
        print()
        print('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557')
        print('  \u2551        claude-design server                          \u2551')
        print('  \u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563')
        print(f'  \u2551  arquivo : {str(DESIGN_FILE.name):<42} \u2551')
        print(f'  \u2551  url     : {url:<42} \u2551')
        print('  \u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563')
        print('  \u2551  Ctrl+Click elemento \u2192 captura DOM para o Claude     \u2551')
        print('  \u2551  Tweaks \u2192 reescrevem o arquivo em disco              \u2551')
        print('  \u2551  Edite o HTML \u2192 browser recarrega automaticamente    \u2551')
        print('  \u2551  /api/screenshot \u2192 PNG da página completa            \u2551')
        print('  \u2551  /api/export/pdf \u2192 PDF (requer playwright)           \u2551')
        print('  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d')
        print()
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n[server] encerrado.')
