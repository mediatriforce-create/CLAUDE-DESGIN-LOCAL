# claude-design

Claude Code plugin que emula o Claude Design dentro do terminal.

Intake inteligente (Q1–Q8) → constrói HTML ship-ready com Tweaks, starters e verificador automático.

## Instalação

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "claude-design@mediatriforce": true
  },
  "extraKnownMarketplaces": {
    "mediatriforce": {
      "source": {
        "source": "github",
        "repo": "mediatriforce-create/CLAUDE-DESGIN-LOCAL"
      }
    }
  }
}
```

Reinicie o Claude Code. A skill `claude-design` estará disponível.

## O que inclui

- **AUTO-BRIEF** — entrevista Q1–Q8 antes de construir qualquer coisa
- **CSS System** — reset, custom properties, tipografia fluid, spacing 4px grid
- **Tweaks Protocol** — painel de ajustes com persistência em disco
- **6 Starters** — deck_stage, ios_frame, macos_window, browser_window, design_canvas, animations
- **server.py** — servidor local com live reload, Tweaks persistence, element picker
- **verify.py** — verificador automático de layout, CSS, acessibilidade e qualidade

## Uso

Basta pedir: *"cria uma landing page para X"* e o plugin roda o intake e constrói direto.
