# claude-design — Regras globais

Plugin que emula o ambiente Claude Design dentro do Claude Code.

## Quando usar

Quando o usuário pedir para criar um design, landing page, componente visual, deck, app prototype ou qualquer artefato HTML/React de natureza visual, priorizar a skill `claude-design`.

## Servidor local (dev mode)

```bash
python skills/claude-design/server.py "caminho/para/design.html"
```

Live reload + Tweaks persistence + Element picker (Ctrl+Click).

## Verificador

```bash
python skills/claude-design/verify.py "caminho/para/design.html" --screenshot
```

## Starter components

Disponíveis em `skills/claude-design/starters/`:
- `design_canvas.jsx` — canvas 1920×1080 com auto-scale
- `deck_stage.js` — slides de apresentação
- `ios_frame.jsx` — bezel iPhone 16 Pro
- `macos_window.jsx` — janela macOS com traffic lights
- `browser_window.jsx` — janela de browser Chrome-style
- `animations.jsx` — timeline animation engine
