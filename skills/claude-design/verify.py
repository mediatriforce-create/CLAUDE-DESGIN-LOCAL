#!/usr/bin/env python3
"""
verify.py — fork_verifier_agent equivalente para claude-design.

Checa um arquivo HTML para erros comuns de layout, CSS, e JS.
Tira screenshot via Playwright se disponível.

Uso:
  python verify.py "C:/caminho/para/design.html"
  python verify.py "C:/caminho/para/design.html" --screenshot
  python verify.py "C:/caminho/para/design.html" --url http://localhost:8765
"""

import sys
import re
import json
from pathlib import Path

ERRORS   = []
WARNINGS = []

def error(msg):   ERRORS.append(f'  ✗ ERRO:    {msg}')
def warn(msg):    WARNINGS.append(f'  ⚠ AVISO:   {msg}')
def ok(msg):      print(f'  ✓ {msg}')

def check_html(path: Path):
    content = path.read_text(encoding='utf-8')

    # 1. CSS classes definidas vs usadas
    defined_classes = set(re.findall(r'\.([a-zA-Z][\w-]*)\s*\{', content))
    used_classes    = set(re.findall(r'class=["\']([^"\']+)["\']', content))
    used_flat       = set()
    for cls_str in used_classes:
        for c in cls_str.split():
            used_flat.add(c)

    unused = defined_classes - used_flat - {'on', 'active', 'hover', 'focus', 'disabled', 'open', 'visible', 'hidden'}
    if unused:
        warn(f'Classes CSS definidas mas nunca usadas no HTML: {", ".join(sorted(unused)[:8])}')
    else:
        ok('Todas as classes CSS estão sendo usadas no HTML')

    missing = used_flat - defined_classes - set()
    # Filtrar classes de bibliotecas externas (tailwind, etc.)
    missing_local = {c for c in missing if not any(c.startswith(p) for p in ['text-', 'bg-', 'flex', 'grid', 'p-', 'm-', 'w-', 'h-', 'rounded', 'border', 'font-', 'items-', 'justify-', 'gap-', 'space-', 'overflow-', 'absolute', 'relative', 'fixed', 'sticky', 'block', 'inline', 'hidden', 'sr-only'])}
    if missing_local:
        warn(f'Classes usadas no HTML sem definição CSS: {", ".join(sorted(missing_local)[:8])}')

    # 2. flex-column sem align-items ou align-self nos botões
    flex_col_sections = re.findall(r'flex-direction:\s*column[^}]*}', content)
    if flex_col_sections and 'align-items' not in ' '.join(flex_col_sections) and 'align-self' not in content:
        warn('flex-direction:column detectado — verifique se botões têm align-self:flex-start')
    else:
        ok('flex-direction:column tem controle de alinhamento')

    # 3. max-width sem margin auto
    mw_rules = re.findall(r'max-width[^}]+}', content)
    for rule in mw_rules:
        if 'margin' not in rule and 'margin-left' not in rule:
            warn('max-width detectado sem margin:auto — container pode não estar centralizado')
            break
    else:
        ok('max-width com margin:auto encontrado')

    # 4. html/body width
    if 'html' in content and 'width: 100%' in content:
        ok('html/body tem width:100%')
    else:
        warn('html ou body pode estar sem width:100% — pode causar layout quebrado')

    # 5. No lorem ipsum
    if re.search(r'lorem ipsum', content, re.IGNORECASE):
        error('Lorem ipsum encontrado no conteúdo — substituir por copy real')
    else:
        ok('Nenhum lorem ipsum')

    # 6. EDITMODE block
    if '/*EDITMODE-BEGIN*/' in content:
        try:
            m = re.search(r'/\*EDITMODE-BEGIN\*/(.*?)/\*EDITMODE-END\*/', content, re.DOTALL)
            json.loads(m.group(1))
            ok('Bloco EDITMODE com JSON válido')
        except:
            error('Bloco EDITMODE com JSON inválido — Tweaks não vão persistir')
    else:
        warn('Sem bloco EDITMODE — Tweaks não persistem no disco')

    # 7. React integrity hashes
    if 'react' in content.lower() and 'integrity' not in content:
        warn('React sendo usado sem integrity hashes — usar versões pinadas')
    elif 'react@18.3.1' in content:
        ok('React 18.3.1 com integrity hashes')

    # 8. Travessões proibidos em títulos
    if re.search(r'<h[1-6][^>]*>.*?—.*?</h[1-6]>', content):
        error('Travessão (—) encontrado dentro de heading — remover')
    else:
        ok('Nenhum travessão em headings')

    # 9. Tags não fechadas (básico)
    open_tags  = re.findall(r'<(div|section|article|main|header|footer|nav|span|p|ul|ol|li)\b', content)
    close_tags = re.findall(r'</(div|section|article|main|header|footer|nav|span|p|ul|ol|li)>', content)
    from collections import Counter
    open_c  = Counter(open_tags)
    close_c = Counter(close_tags)
    for tag, count in open_c.items():
        if close_c.get(tag, 0) < count:
            error(f'<{tag}> aberto {count}x mas fechado {close_c.get(tag,0)}x — tag não fechada')
    ok('Contagem de tags OK') if not ERRORS else None

    # 10. Overflow horizontal (elementos com width fixo maior que viewport)
    wide_elements = re.findall(r'width:\s*(\d+)px', content)
    for w in wide_elements:
        if int(w) > 1440:
            warn(f'Elemento com width:{w}px — pode causar overflow horizontal em mobile')
            break

def screenshot_playwright(url: str, output: Path):
    try:
        from playwright.sync_api import sync_playwright
        print(f'\n  📸 Tirando screenshot de {url}...')
        with sync_playwright() as p:
            browser = p.chromium.launch()
            # Desktop
            page = browser.new_page(viewport={'width': 1440, 'height': 900})
            page.goto(url, wait_until='networkidle')
            page.wait_for_timeout(800)
            desktop_path = output.parent / (output.stem + '-desktop.png')
            page.screenshot(path=str(desktop_path), full_page=True)
            print(f'  ✓ Desktop: {desktop_path}')

            # Mobile
            page.set_viewport_size({'width': 390, 'height': 844})
            page.reload(wait_until='networkidle')
            page.wait_for_timeout(500)
            mobile_path = output.parent / (output.stem + '-mobile.png')
            page.screenshot(path=str(mobile_path), full_page=True)
            print(f'  ✓ Mobile:  {mobile_path}')

            # Check console errors
            errors_js = []
            page.on('console', lambda msg: errors_js.append(msg.text) if msg.type == 'error' else None)
            page.reload(wait_until='networkidle')
            if errors_js:
                for e in errors_js[:5]:
                    error(f'Console error: {e}')
            else:
                ok('Nenhum erro de console JS')

            browser.close()
    except ImportError:
        warn('Playwright não instalado. Screenshot indisponível.\n  Execute: pip install playwright && playwright install chromium')
    except Exception as e:
        warn(f'Screenshot falhou: {e}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: python verify.py <arquivo.html> [--screenshot] [--url http://...]')
        sys.exit(1)

    html_path = Path(sys.argv[1]).resolve()
    do_screenshot = '--screenshot' in sys.argv
    url = 'file:///' + str(html_path).replace('\\', '/')
    for i, a in enumerate(sys.argv):
        if a == '--url' and i+1 < len(sys.argv):
            url = sys.argv[i+1]

    print(f'\n  ══ claude-design verifier ══════════════════════')
    print(f'  arquivo: {html_path.name}')
    print(f'  ────────────────────────────────────────────────\n')

    check_html(html_path)

    if do_screenshot:
        screenshot_playwright(url, html_path)

    print()
    print('  ────────────────────────────────────────────────')
    if ERRORS:
        print(f'\n  {len(ERRORS)} ERRO(S) encontrado(s):')
        for e in ERRORS:
            print(e)
    if WARNINGS:
        print(f'\n  {len(WARNINGS)} aviso(s):')
        for w in WARNINGS:
            print(w)
    if not ERRORS and not WARNINGS:
        print('  ✓ Tudo limpo — nenhum problema encontrado')
    elif not ERRORS:
        print('\n  ✓ Nenhum erro crítico — avisos acima são opcionais')

    print()
    sys.exit(1 if ERRORS else 0)
