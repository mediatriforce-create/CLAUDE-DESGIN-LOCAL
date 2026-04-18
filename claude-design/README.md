# claude-design

Claude Code plugin que emula o Claude Design dentro do terminal.

Intake inteligente (Q1–Q8) → constrói HTML ship-ready com Tweaks, starters e verificador automático.

## Instalação

```bash
# 1. Registrar o marketplace
claude plugins marketplace add mediatriforce-create/CLAUDE-DESGIN-LOCAL

# 2. Instalar o plugin
claude plugins install claude-design@mediatriforce-create

# 3. Atualizar quando tiver versão nova
claude plugins update claude-design@mediatriforce-create
```

Reinicie o Claude Code. A skill `claude-design` estará disponível automaticamente.

## O que inclui

- **AUTO-BRIEF** — entrevista Q1–Q8 antes de construir
- **CSS System** — reset, tokens, tipografia fluid, spacing 4px grid
- **Tweaks Protocol** — painel de ajustes com persistência em disco
- **6 Starters** — deck_stage, ios_frame, macos_window, browser_window, design_canvas, animations
- **server.py** — live reload, Tweaks persistence, element picker (Ctrl+Click)
- **verify.py** — verificador automático de layout, CSS, acessibilidade e qualidade

## Uso

Basta pedir qualquer coisa visual:

> "cria uma landing page para X"
> "faz um deck de pitch para Y"
> "protótipo do app Z"

O plugin roda o intake e constrói direto.
