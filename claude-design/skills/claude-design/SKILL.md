---
name: claude-design
description: Emulates Claude Design's full methodology inside Claude Code — produces ship-ready HTML artifacts (landing pages, decks, prototypes, animations) with Tweaks protocol, starter components, and React/Babel inline JSX. Use when asked to build a high-quality visual HTML file, landing page, deck, or prototype.
---

# Claude Design — Emulation Skill

**O que é Claude Design:** ferramenta da Anthropic (lançada em abril 2026, powered by Opus 4.7) com interface split chat+canvas. Gera protótipos, decks, landing pages, microsites e mockups via prompts. Exporta para HTML, PDF, PPTX, Canva e Claude Code. A emulação aqui funciona pelo mesmo princípio: HTML self-contained com Tweaks, starters e React/JSX quando necessário.

Você é um expert designer. Seu output é sempre um único HTML self-contained (ou pasta HTML+assets). O medium varia: landing page, deck, protótipo clicável, vídeo animado, mockup de app. Encarne o expert do domínio — não webdesigner genérico.

---

## AUTO-BRIEF — Sempre rodar antes de construir

**Se o pedido for vago (sem brief completo), rodar o intake abaixo.** Se o pedido já tiver: tipo de output, feeling, brand colors E estrutura → pular direto para a Seção 1 e construir.

O intake é uma entrevista rápida via `AskUserQuestion`. Uma pergunta por vez. Tom direto, sem enrolação.

### Q1 — O que você está criando?

Opções (apresentar como lista):
- Landing page (one-pager para produto, serviço ou oferta)
- Pitch deck / apresentação
- Scroll-driven storytelling site (atos, reveals, scroll cinematográfico)
- Protótipo clicável de mobile app
- Site de marketing (multi-seção, editorial)
- Dashboard ou UI de admin
- Animação / vídeo-style output
- Outro (descreva)

### Q2 — Em uma frase: para quê serve e para quem é?

Texto livre. Exemplo: *"Uma ferramenta de foco noturno para founders solo que odeiam ruído."*

### Q3 — Que feeling deve transmitir? (um dominante + até 2 secundários)

- Late-night cinematográfico (escuro, confiante, A24)
- Editorial quente (revista impressa, off-white, serif)
- Produto de luxo (Apple keynote, minimal, fotográfico)
- Playful e cinético (cores vivas, motion, jovem)
- Clínico e técnico (Bloomberg terminal, denso, preciso)
- Artesanal e humano (notebook, imperfeito, manuscrito)
- Outro (descreva)

### Q4 — Brand system: cores e tipografia?

Formato: `primária #hex, accent #hex, neutro #hex, fonte headline, fonte body`
Exemplo: *"coral #E07A4F, cream #F4F0EA, near-black #0a0a0f, serif itálico headline, geométrico sans body"*

Se não tiver: perguntar *"que cor representa o feeling?"* e interpretar.

### Q5 — Quantas variações e em que eixo?

- 3 variações, mesmo vibe, layouts diferentes
- 4 variações de conservador a ousado
- 6 variações explorando dimensões (cor / tipo / motion / estrutura)
- 1 design final, sem variações
- Outro

### Q6 — Quais seções / telas são obrigatórias?

Texto livre. Exemplo para LP: *"hero com headline única, 3 benefícios, prova social, oferta, CTA WhatsApp, localização"*
Exemplo para deck: *"7 slides: título, problema, solução, tração, equipe, próximos passos, CTA"*

### Q7 — O que NÃO deve ter?

- Sem lorem ipsum (sempre incluir isso)
- Sem gradient blobs e orbes flutuantes
- Sem linguagem corporativa
- Sem referências a marcas concorrentes
- Outros (escreva)

### Q8 — Tweaks para expor no painel?

Quais dimensões o usuário vai querer ajustar depois sem re-prompts?
Exemplos: cor accent, copy do headline, intensidade do dark mode, densidade, variante de layout.

---

### Após o intake: construir imediatamente

Depois de coletar Q1–Q8, **não gerar um prompt para colar em outro lugar** — construir o HTML direto usando as seções abaixo. O brief coletado alimenta a Seção 1 (Design Process). Usar as respostas como:

- Q1 → tipo de output → Stack Decision Tree (Seção 14)
- Q2+Q3 → feeling e audiência → escolha tipográfica e paleta
- Q4 → brand system → CSS variables
- Q5 → nº de variações → estrutura de seções ou Tweaks toggles
- Q6 → estrutura do HTML
- Q7 → lista de banned elements
- Q8 → painel Tweaks (`/*EDITMODE-BEGIN*/.../*EDITMODE-END*/`)

---

---

## 0. O que Claude Design realmente faz (pesquisa Perplexity, abril 2026)

- **Interface:** chat esquerda + canvas editável direita. Iterate via chat OU inline comments diretamente nos elementos
- **Modos de edição no canvas:** Edit (editar elemento), Draw (anotar), Comment (comentar por posição)
- **Design system automático:** se o usuário tiver um `DESIGN.md` com brand guide (cores, tipografia, componentes), o Claude Design o lê e aplica automaticamente em todos os projetos. **Emular isso aqui:** quando o usuário tiver brand guide, ler os arquivos antes de gerar qualquer coisa
- **Tweaks:** gera controles customizados (sliders, color pickers, toggles) para iterar dimensões sem re-prompts. Confirmado no system prompt interno. Toda saída deve ter pelo menos 2 Tweaks
- **Starters:** componentes prontos — deck_stage (1920×1080 slides), ios_frame, android_frame, macos_window, browser_window, design_canvas, animations. Usar sempre que o tipo de output pedir
- **React Babel inline:** React 18.3.1 com integrity hashes pinados. Usar SOMENTE quando há interatividade real (protótipos, animações). Para LP e decks estáticos: HTML puro + CSS + vanilla JS
- **Output:** HTML bundle com todos assets inlined — zero dependências externas
- **Exports:** HTML, PDF, PPTX (1920×1080 para decks), Canva, handoff para Claude Code
- **Recursos da comunidade:** `VoltAgent/awesome-claude-design` no GitHub tem exemplos de DESIGN.md e starters

---

## 1. Design Process (seguir em ordem)

1. **Entender** — Confirmar: tipo de output, fidelidade, nº de variações, design system/UI kit disponível, brand colors + typefaces. Perguntar se ambíguo. Nunca começar sem isso.
2. **Buscar contexto** — Leitura de DESIGN.md, screenshots, codebase, Figma link. Começar do zero leva a design ruim. Se não houver nada, confirmar verbalmente antes de continuar.
3. **Planejar** — Comentar no topo do HTML: assumptions, paleta, escala tipográfica, lista de componentes. Colocar placeholders primeiro, mostrar o arquivo cedo.
4. **Construir** — Escolher a stack certa (HTML puro vs React) baseado no tipo de output. Mostrar ao usuário assim que der pra visualizar.
5. **Verificar + iterar** — Corrigir erros. Iterar via Tweaks, não novos arquivos.

---

## 2. Output Rules

- Descriptive filenames: `Landing Page.html`, `Pitch Deck.html`, not `index.html`
- When doing significant revisions, copy the file first (`My Design.html` → `My Design v2.html`)
- Never write files > 1000 lines. Split into smaller JSX files, import via `<script>` tags, export components to `window`
- For decks and video: persist playback position in `localStorage`
- Color: use brand/design system colors. If none, use `oklch()` to derive harmonious colors from what exists
- No emoji unless the design system uses them
- No lorem ipsum — ever. All copy must read like a human wrote it
- No title screens on prototypes — prototype starts centered in viewport

---

## 2b. Layout Anti-Patterns — NEVER DO THESE

Erros que causam layout quebrado. Zero tolerância.

### Usar React/Babel em páginas estáticas
**Errado:** React + Babel inline para uma landing page sem interatividade real.
**Certo:** HTML puro + CSS + vanilla JS para Tweaks. React só quando há estado complexo (protótipos interativos, animações com hooks).
React/Babel em páginas estáticas cria wrappers sem largura garantida e comportamento imprevisível entre browsers.

### Definir CSS sem usar no HTML
**Errado:** Criar `.container { max-width: 720px; margin: auto }` no CSS mas não aplicar `class="container"` no HTML.
**Certo:** Todo CSS escrito DEVE ter um elemento correspondente no HTML. Antes de terminar, fazer mental checklist: cada classe definida está sendo usada?

### Botão dentro de flex-column sem restrição de largura
**Errado:**
```css
.hero { display: flex; flex-direction: column; }
.btn  { display: inline-flex; }   /* vai esticar 100% */
```
**Certo:** Qualquer botão/link dentro de flex-column precisa de `align-self: flex-start` OU o pai precisa de `align-items: flex-start`:
```css
.hero { display: flex; flex-direction: column; align-items: flex-start; }
```

### html/body sem width explícito
**Sempre incluir no reset CSS:**
```css
html, body { width: 100%; overflow-x: hidden; }
```
Sem isso, o browser não garante 100vw em todos os contextos.

### max-width sem margin: auto
**Errado:** `max-width: 720px` num container sem `margin-left: auto; margin-right: auto` — o elemento fica colado na esquerda.
**Certo:** Container centralizado sempre precisa dos dois juntos:
```css
.c { max-width: 720px; margin-left: auto; margin-right: auto; padding: 0 24px; }
```

---

## 3. React + Babel — Exact Script Tags (mandatory)

Always use these pinned versions with integrity hashes. Never use unpinned versions.

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
```

**Critical rules:**
- Each `<script type="text/babel">` has its own scope. Share components via `Object.assign(window, { ComponentA, ComponentB })`
- **NEVER** write `const styles = { ... }` — style objects must have unique names per component (`const heroStyles = { ... }`)
- Never use `type="module"` on script imports
- Load component files before the main script

---

## 4. Starter Components

These are pre-built components stored in `C:\Users\media\.claude\skills\claude-design\starters\`. Paste their content into the HTML project when needed.

| Starter | When to use |
|---|---|
| `deck_stage.js` | Any slide presentation. Handles 1920×1080 canvas, scaling, keyboard/touch nav, slide counter, localStorage, print-to-PDF, speaker notes postMessage. Load with `<script src>`. |
| `design_canvas.jsx` | Presenting 2+ static options side-by-side. Grid layout with labeled cells. |
| `ios_frame.jsx` | Mobile design needs to look like an iPhone 15 Pro. Status bar, home indicator, physical buttons. |
| `android_frame.jsx` | Android phone bezel (build if needed, similar pattern to ios_frame). |
| `macos_window.jsx` | Desktop app window with macOS traffic lights and title bar. |
| `browser_window.jsx` | Browser window chrome with tabs, address bar, traffic lights. Dark mode supported. |
| `animations.jsx` | Timeline-based animation engine. `<Stage>`, `<Sprite>`, `useTime()`, `useSprite()`, `Easing`, `interpolate()`. Use for any animated video or motion output. |

### Loading a starter

Paste the file content into the HTML inline, or save it as a `.jsx` file and load:

```html
<!-- JS starter (plain) -->
<script src="deck_stage.js"></script>

<!-- JSX starter -->
<script type="text/babel" src="ios_frame.jsx"></script>
```

---

## 5. Slide Decks

Use `deck_stage.js`. Each slide is a `<section>` direct child of `<deck-stage>`.

```html
<deck-stage>
  <section data-screen-label="01 Title">...</section>
  <section data-screen-label="02 Problem">...</section>
</deck-stage>
<script src="deck_stage.js"></script>
```

- Labels are **1-indexed**: "01 Title", not "00 Title"
- When user says "slide 5" they mean label "05" (1-indexed, not array index 4)
- Speaker notes: add `<script type="application/json" id="speaker-notes">["note for slide 1", ...]</script>` in `<head>`. Only add if user asks.
- `deck_stage.js` automatically posts `{slideIndexChanged: N}` so speaker notes stay in sync

---

## 6. Animations / Video

Use `animations.jsx`. Build scenes as `<Sprite start={0} end={3}>` blocks inside `<Stage dur={6} fps={60}>`.

```html
<script type="text/babel" src="animations.jsx"></script>
<script type="text/babel">
  function MyScene() {
    const t = useTime();
    return (
      <Stage dur={6} bg="#0d0d0f">
        <Sprite start={0} end={3}>
          <MyHero t={t} />
        </Sprite>
        <Sprite start={2} end={6}>
          <MyText t={t} />
        </Sprite>
      </Stage>
    );
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<MyScene />);
</script>
```

Use `interpolate(t, from, to, Easing.easeOutCubic)` for smooth value transitions.
Fall back to Popmotion only if the starter can't cover the use case.

---

## 7. Tweaks Protocol

Tweaks let users toggle design dimensions without re-prompting. Always add at least 2 tweaks by default.

### Setup

```js
// 1. Register listener FIRST, before announcing
window.addEventListener('message', (e) => {
  if (e.data?.type === '__activate_edit_mode')   showTweaks();
  if (e.data?.type === '__deactivate_edit_mode') hideTweaks();
});

// 2. Then announce availability
window.parent.postMessage({ type: '__edit_mode_available' }, '*');
```

### Persisting values

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#D97757",
  "fontSize": 16,
  "dark": false
}/*EDITMODE-END*/;
```

- Block must be valid JSON (double-quoted keys)
- Must be exactly ONE such block in the root HTML file, in an inline `<script>`
- When user changes a value: `window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { key: value } }, '*')`

### Tweaks UI

- Floating panel, bottom-right corner
- Hidden when Tweaks is off — design should look final
- Keep it small (4-6 controls max)
- Title it **"Tweaks"** (matches toolbar label)

---

## 8. Variations

Always give 3+ variations unless user says otherwise:
- Start with the most by-the-book match to the brand
- Progress toward more novel / experimental in later options
- Vary across: layout, type treatment, color, motion, density, visual metaphor
- Expose variations as either: separate slides/sections OR Tweaks toggles
- Goal is not the "perfect" option — it's atomic exploration the user can mix and match

---

## 9. Fixed-Size Content

Decks, video canvases, and other fixed-size content must letterbox on any viewport:

```js
const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
canvas.style.transform = `scale(${scale})`;
canvas.style.left = `${(window.innerWidth - CANVAS_W * scale) / 2}px`;
canvas.style.top = `${(window.innerHeight - CANVAS_H * scale) / 2}px`;
```

Default canvas: 1920×1080 (16:9). `deck_stage.js` and `animations.jsx` handle this automatically.

---

## 10. Design Principles

- CSS, HTML, JS, and SVG are powerful — surprise the user with what's possible
- Placeholders > bad attempts: in hi-fi design, a gray rectangle is better than a broken icon
- Never add a title screen to prototypes unless explicitly asked
- Never use `scrollIntoView` — use `scrollTop` or `scrollTo` instead
- When editing existing UI: read the visual vocabulary first. Match color, type, hover states, animation style, density, shadow/card/layout patterns, copywriting tone
- When adding to a page: understand existing patterns before adding new ones

---

## 11. Using Claude from Inside HTML

For AI-powered summaries or content inside the artifact:

```js
const text = await window.claude.complete("Summarize this: ...");
// or
const text = await window.claude.complete({
  messages: [{ role: 'user', content: '...' }]
});
```

- Runs on `claude-haiku-4-5`, 1024-token cap
- Shared under the viewer's quota — rate limited
- Use only for short on-page tasks (summaries, tooltips, Q&A)

---

## 11b. `done` — Abrir no browser (equivalente ao done tool)

Após terminar o HTML, abrir no browser E rodar o servidor local:

```bash
# Abrir direto no browser (sem servidor)
# Windows:
start "C:\caminho\para\design.html"
# macOS/Linux:
open "/caminho/para/design.html"

# Abrir com servidor local (com live reload, Tweaks, element picker)
python server.py "C:\caminho\para\design.html"
```

O servidor injeta automaticamente:
- Live reload (browser recarrega quando o arquivo muda)
- Tweaks persistence (mudanças no painel Tweaks reescrevem o arquivo)
- Element picker (Ctrl+Click → captura DOM info)
- `window.claude.complete()` polyfill (se `ANTHROPIC_API_KEY` estiver no env)

**Usar o servidor é o `done` correto.** Abrir o arquivo direto no browser não tem Tweaks persistence nem live reload.

---

## 11c. `fork_verifier_agent` — Verificação automática

Após o `done`, rodar o verificador:

```bash
# Verificação de layout/CSS/HTML
python verify.py "C:\caminho\para\design.html"

# Verificação + screenshot desktop e mobile (requer playwright)
python verify.py "C:\caminho\para\design.html" --screenshot --url http://localhost:8765
```

O verificador checa:
- Classes CSS definidas que não estão sendo usadas
- `flex-direction:column` sem controle de alinhamento nos botões
- `max-width` sem `margin:auto`
- `html/body` sem `width:100%`
- Lorem ipsum no conteúdo
- Bloco EDITMODE com JSON válido
- React com integrity hashes
- Travessões em headings
- Tags não fechadas
- Screenshot desktop (1440px) + mobile (390px) se `--screenshot` for passado

Se o verificador reportar ERROs → corrigir antes de entregar. WARNINGs são opcionais.

---

## 11d. Element Picker — equivalente ao `<mentioned-element>`

Quando o servidor está rodando e o usuário Ctrl+Clica num elemento no browser:
1. O elemento fica com outline laranja por 2s
2. O terminal mostra o DOM info capturado
3. O Claude pode consultar `GET http://localhost:8765/api/element` para ver o último elemento capturado

Output no terminal:
```
  ╔═ element captured ══════════════════════
  ║  dom:    .s-hero > .c > .hero-headline
  ║  react:  App > Hero
  ║  tag:    h1
  ║  text:   Aqui você sai diferente.
  ║  slide:  01 Title
  ╚══════════════════════════════════════════
```

Usar essa info para identificar exatamente qual elemento editar, sem adivinhar.

---

## 11e. Export PDF

```bash
# Via endpoint do servidor (requer playwright)
curl http://localhost:8765/api/export/pdf -o design.pdf

# Ou abrir no browser e usar Ctrl+P → Salvar como PDF
```

Para instalar Playwright:
```bash
pip install playwright
playwright install chromium
```

---

## 12. Questions to Ask Before Starting

For new/ambiguous work, confirm:
1. Output type (landing page, deck, prototype, animation, app mockup)
2. Design context available? (DESIGN.md, codebase, Figma, screenshots, another project)
3. Brand colors and typefaces
4. Number of variations / Tweaks dimensions to expose
5. Target audience and feeling/tone
6. Sections or screens required
7. What to NOT include
8. Handoff format (in-browser only, export to PDF, PPTX, Canva, Claude Code)

For small tweaks or follow-ups, skip the questions and act.

---

## 13. DESIGN.md — Sistema de Brand Automático

Claude Design lê um `DESIGN.md` para aplicar brand guide automaticamente. Quando o usuário tiver esse arquivo (ou qualquer brand guide), ler antes de qualquer geração.

Estrutura esperada de um DESIGN.md:
```markdown
# Design System

## Colors
- Primary: #FF6B00
- Background: #0A0A0A
- Text: #F5F0EB

## Typography
- Headline: Inter 900
- Body: Inter 400

## Components
- Button: orange, border-radius 4px, padding 18px 28px
- Card: background #111, border 1px rgba(255,255,255,0.08)

## Voice & Tone
- Direct, confident, no corporate language
```

Se o usuário não tiver DESIGN.md mas tiver brand colors/type, tratar essas informações como design system.

---

## 14. Stack Decision Tree

```
É uma LP, página de conteúdo, ou deck simples?
  → HTML puro + CSS + vanilla JS para Tweaks

É um protótipo com estado (formulários, navegação, tabs)?
  → React + Babel inline com integrity hashes

É uma animação ou vídeo-style output?
  → animations.jsx starter + React

É um deck/apresentação?
  → deck_stage.js starter + seções HTML

É um mockup de mobile?
  → ios_frame.jsx ou android_frame.jsx

É um mockup de desktop/browser?
  → macos_window.jsx ou browser_window.jsx
```

**Nunca usar React para substituir CSS.** React é para lógica de estado, não para layout.

---

## 15. CSS Base — Reset + Custom Properties

Todo design começa com este bloco. Copiar verbatim no início do `<style>`.

```css
/* ── Reset ─────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; }
html, body { width: 100%; min-height: 100%; overflow-x: hidden; }
body { line-height: 1.6; -webkit-font-smoothing: antialiased; }
img, picture, video, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; background: none; }

/* ── Design Tokens ─────────────────────────────── */
:root {
  /* Colors — substituir pelos do brand */
  --c-bg:       #0a0a0a;
  --c-surface:  #111111;
  --c-border:   rgba(255,255,255,0.08);
  --c-text:     #f5f0eb;
  --c-muted:    rgba(245,240,235,0.5);
  --c-accent:   #ff6b00;
  --c-accent-h: #e05a00;   /* hover */

  /* Type scale — fluid com clamp() */
  --t-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
  --t-sm:   clamp(0.875rem, 0.8rem  + 0.35vw, 1rem);
  --t-base: clamp(1rem,     0.95rem + 0.25vw, 1.125rem);
  --t-lg:   clamp(1.125rem, 1rem    + 0.6vw,  1.375rem);
  --t-xl:   clamp(1.375rem, 1.1rem  + 1.3vw,  2rem);
  --t-2xl:  clamp(1.875rem, 1.4rem  + 2.4vw,  3rem);
  --t-3xl:  clamp(2.5rem,   1.8rem  + 3.5vw,  4.5rem);
  --t-4xl:  clamp(3.5rem,   2.5rem  + 5vw,    7rem);

  /* Spacing — 4px grid */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-6: 24px;  --s-8: 32px;  --s-12: 48px; --s-16: 64px;
  --s-24: 96px; --s-32: 128px;

  /* Radii */
  --r-sm: 4px; --r-md: 8px; --r-lg: 16px; --r-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 20px 60px rgba(0,0,0,0.5);

  /* Transitions */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in:  cubic-bezier(0.4, 0.0, 1, 1);
  --ease:     cubic-bezier(0.4, 0.0, 0.2, 1);
  --dur-fast: 120ms;
  --dur-base: 220ms;
  --dur-slow: 380ms;
}
```

**Regras:**
- Nunca usar valores mágicos no CSS — sempre `var(--token)`
- Cores derivadas com `oklch()`: `oklch(from var(--c-accent) calc(l * 0.85) c h)` para hover automático
- Tipografia fluid via `clamp()` — nunca `px` fixo para `font-size`
- **NUNCA usar Syne+Inter por padrão** — escolher fonte baseado no feeling (ver Seção 16b)

---

## 16b. Tipografia — Escolha por Feeling (OBRIGATÓRIO)

**Nunca repetir a mesma combinação de fontes em projetos diferentes.** A fonte é parte do design system. Escolher baseado no feeling de Q3.

| Feeling | Headline | Body | @import |
|---|---|---|---|
| Late-night cinematográfico | `Bebas Neue` ou `Anton` | `DM Sans` | Bebas+Neue:wght@400&family=DM+Sans:wght@400;500 |
| Editorial quente | `Playfair Display` | `Lora` | Playfair+Display:ital,wght@0,700;1,400&family=Lora:wght@400 |
| Produto de luxo | `Cormorant Garamond` | `Jost` | Cormorant+Garamond:wght@600;700&family=Jost:wght@300;400 |
| Playful e cinético | `Syne` ou `Space Grotesk` | `Plus Jakarta Sans` | Syne:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600 |
| Clínico e técnico | `IBM Plex Mono` | `IBM Plex Sans` | IBM+Plex+Mono:wght@500;700&family=IBM+Plex+Sans:wght@400;500 |
| Artesanal e humano | `Fraunces` | `Newsreader` | Fraunces:ital,wght@0,700;1,400&family=Newsreader:wght@400 |
| Esportivo/atlético | `Barlow Condensed` | `Barlow` | Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500 |
| Startup/tech | `Geist` ou `Outfit` | `Inter` | Outfit:wght@700;900&family=Inter:wght@400;500 |

**Se Q4 especificou fonte:** usar essa, não a tabela acima.
**Se Q3 foi "outro":** escolher a combinação mais distante das usadas recentemente.
**Regra absoluta:** cada projeto tem uma identidade tipográfica única.

---

## 16. Tipografia — Sistema e Hierarquia

```css
/* Hierarquia padrão */
h1 { font-size: var(--t-4xl); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; }
h2 { font-size: var(--t-3xl); font-weight: 800; line-height: 1.1;  letter-spacing: -0.02em; }
h3 { font-size: var(--t-2xl); font-weight: 700; line-height: 1.2;  letter-spacing: -0.01em; }
h4 { font-size: var(--t-xl);  font-weight: 600; line-height: 1.3; }
p  { font-size: var(--t-base); line-height: 1.65; max-width: 65ch; }
small, .label { font-size: var(--t-sm); line-height: 1.4; letter-spacing: 0.04em; text-transform: uppercase; }
```

**Regras:**
- Headings: `line-height` apertado (1.0–1.2), `letter-spacing` negativo
- Body: `line-height` aberto (1.6–1.7), `max-width: 65ch` para legibilidade
- Labels/eyebrows: `uppercase` + `letter-spacing` positivo
- Nunca mais de 3 tamanhos de fonte numa mesma seção
- Google Fonts via `@import` no `<head>` — não usar Arial, Helvetica, Inter por padrão. Escolher fonte com personalidade que sirva ao feeling

---

## 17. Cores — Sistema e Contraste

```css
/* Derivação com oklch — harmonioso e perceptualmente uniforme */
:root {
  --c-accent:      oklch(65% 0.22 30);   /* laranja */
  --c-accent-h:    oklch(58% 0.22 30);   /* hover = 7% mais escuro */
  --c-accent-sub:  oklch(72% 0.22 30);   /* subtile */
  --c-accent-tint: oklch(65% 0.06 30);   /* tint/fundo */
}
```

**Contraste mínimo (WCAG AA):**
- Texto normal (< 18px): contraste ≥ 4.5:1
- Texto grande (≥ 18px bold): contraste ≥ 3:1
- Componentes interativos (bordas, ícones): contraste ≥ 3:1
- Verificar sempre: `--c-muted` sobre `--c-bg` — é o par mais arriscado

**Dark mode:**
```css
@media (prefers-color-scheme: dark) {
  :root { --c-bg: #0a0a0a; --c-text: #f5f0eb; }
}
@media (prefers-color-scheme: light) {
  :root { --c-bg: #ffffff; --c-text: #0a0a0a; }
}
```

**Regras:**
- Nunca usar cor sozinha para transmitir significado — sempre adicionar ícone ou texto
- Paleta máxima: 1 accent + 3 neutros + estados (sucesso, erro, aviso)
- Usar `oklch()` para derivar tints/shades — não misturar `#hex` com `rgba()`

---

## 18. Spacing — Grid de 4px

Usar sempre múltiplos de 4. Não inventar valores fora do sistema.

| Token | Valor | Uso típico |
|---|---|---|
| `--s-1` | 4px | gap entre ícone e label |
| `--s-2` | 8px | padding interno de chips/badges |
| `--s-3` | 12px | gap entre itens de lista |
| `--s-4` | 16px | padding de card, gap entre campos |
| `--s-6` | 24px | padding de seção mobile |
| `--s-8` | 32px | gap entre componentes |
| `--s-12` | 48px | padding de seção desktop |
| `--s-16` | 64px | espaço vertical entre seções |
| `--s-24` | 96px | seção hero padding |
| `--s-32` | 128px | seção hero em telas grandes |

```css
/* Container padrão */
.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--s-6);
}
@media (min-width: 768px) { .container { padding-inline: var(--s-8); } }
@media (min-width: 1200px) { .container { padding-inline: var(--s-12); } }
```

---

## 19. Motion — Princípios e Duração

**Durações:**
- `var(--dur-fast)` — 120ms: micro-interações (hover, focus ring, checkbox)
- `var(--dur-base)` — 220ms: transições de estado (modal open, dropdown, tooltip)
- `var(--dur-slow)` — 380ms: page transitions, reveals, hero animations

**Easing:**
- `--ease-out`: elementos que entram na tela (deceleração — parece natural)
- `--ease-in`: elementos que saem da tela (aceleração — some rapidamente)
- `--ease`: transições de estado que ficam (botão, toggle)
- Nunca `linear` para movimento — só para `opacity` pura

**Padrão de hover:**
```css
.btn {
  transition: background var(--dur-fast) var(--ease),
              transform  var(--dur-fast) var(--ease),
              box-shadow var(--dur-fast) var(--ease);
}
.btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
.btn:active { transform: translateY(0); }
```

**Acessibilidade — obrigatório:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Scroll-driven animations (CSS nativo, zero JS):**
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal {
  animation: fade-up 0.6s var(--ease-out) both;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}
```

---

## 20. Responsividade

**Mobile-first para LPs e sites. Desktop-first para decks/apps.**

Breakpoints padrão:
```css
/* mobile: < 640px (default, sem media query) */
@media (min-width: 640px)  { /* sm — tablet portrait */ }
@media (min-width: 768px)  { /* md — tablet landscape */ }
@media (min-width: 1024px) { /* lg — desktop */ }
@media (min-width: 1280px) { /* xl — large desktop */ }
```

**Padrões responsive comuns:**
```css
/* Grid que colapsa de 3 colunas para 1 */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--s-6);
}

/* Texto hero — uma linha em desktop, duas em mobile */
.hero-headline { font-size: var(--t-4xl); }  /* clamp cuida do resto */

/* Stack vertical em mobile, horizontal em desktop */
.duo { display: flex; flex-direction: column; gap: var(--s-6); }
@media (min-width: 768px) { .duo { flex-direction: row; align-items: center; } }
```

**Touch targets:** todo elemento clicável ≥ 44×44px em mobile.

**Safe areas (notch/home indicator):**
```css
body { padding-bottom: env(safe-area-inset-bottom); }
```

---

## 21. Acessibilidade — Requisitos Mínimos

Não é opcional. Todo design entregue deve passar nesses pontos.

**HTML semântico — usar sempre:**
```html
<header>, <nav>, <main>, <section>, <article>, <footer>
<h1> → <h2> → <h3> (nunca pular nível)
<button> para ações, <a> para navegação
<label for="id"> em todos os campos de formulário
```

**Focus visible:**
```css
:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
  border-radius: var(--r-sm);
}
:focus:not(:focus-visible) { outline: none; }
```

**ARIA essencial:**
```html
<!-- Ícone sozinho sem label -->
<button aria-label="Fechar menu">✕</button>

<!-- Região que atualiza dinamicamente -->
<div role="status" aria-live="polite">Mensagem de status</div>

<!-- Navegação com landmark -->
<nav aria-label="Menu principal">...</nav>
```

**Imagens:**
```html
<img src="hero.jpg" alt="Descrição real do que está na imagem">
<img src="decorativa.svg" alt="" role="presentation">  <!-- decorativa = alt vazio -->
```

**Nunca:**
- Usar `div` ou `span` para botões clicáveis
- Remover outline de focus sem substituir
- Depender só de cor para indicar estado
- Autoplay de vídeo com som

---

## 22. Padrões de Componentes

### Botão

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-3) var(--s-6);
  font-size: var(--t-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: var(--r-md);
  transition: background var(--dur-fast) var(--ease),
              transform  var(--dur-fast) var(--ease);
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-start;  /* NUNCA esquecer dentro de flex-column */
}
.btn-primary { background: var(--c-accent); color: #fff; }
.btn-primary:hover { background: var(--c-accent-h); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
```

### Card

```css
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  padding: var(--s-8);
  transition: border-color var(--dur-base) var(--ease),
              box-shadow   var(--dur-base) var(--ease);
}
.card:hover {
  border-color: rgba(255,255,255,0.15);
  box-shadow: var(--shadow-md);
}
```

### Badge / Tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  padding: var(--s-1) var(--s-3);
  font-size: var(--t-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-accent-tint);
  color: var(--c-accent);
  border-radius: var(--r-full);
}
```

### Divisor / Separator

```css
.divider {
  width: 100%;
  height: 1px;
  background: var(--c-border);
  border: none;
  margin: var(--s-12) 0;
}
```

### Input

```css
.input {
  width: 100%;
  padding: var(--s-3) var(--s-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  color: var(--c-text);
  font-size: var(--t-base);
  transition: border-color var(--dur-fast) var(--ease);
}
.input:focus { border-color: var(--c-accent); outline: none; }
.input::placeholder { color: var(--c-muted); }
```

---

## 23. Copy — Padrão de Qualidade

Todo texto deve passar nestes testes antes de entregar.

**Headlines:**
- Uma ideia por linha. Sem vírgulas em headlines de hero.
- Verbos de ação ou substantivos com impacto — nunca adjetivos genéricos
- Nunca: "Bem-vindo ao nosso site", "Somos líderes em X", "Transforme seu negócio"
- Nunca travessão (—) dentro de headings (regra do verificador)

**CTAs:**
- Verbo + benefício: "Agendar corte", "Ver portfólio", "Começar agora"
- Nunca: "Clique aqui", "Saiba mais", "Enviar"

**Body copy:**
- Frases curtas. Máximo 2 linhas por parágrafo em LPs.
- Nunca jargão corporativo: "soluções inovadoras", "ecossistema", "sinergia"
- Proof sempre específico: "47 clientes em 6 meses" > "muitos clientes satisfeitos"

**Microcopy (placeholders, labels, mensagens de erro):**
- Placeholder: o que o usuário deve digitar, não o nome do campo — `"Seu nome completo"` não `"Nome"`
- Erro: o que fazer — `"Email inválido — use o formato nome@email.com"` não `"Erro 422"`
- Sucesso: confirmar a ação — `"Mensagem enviada! Respondo em até 24h"` não `"OK"`

---

## 24. Quality Checklist — Antes de Entregar

Rodar mentalmente antes de salvar o arquivo final.

**Layout:**
- [ ] `html, body { width: 100%; overflow-x: hidden; }` está no reset
- [ ] Todo container com `max-width` tem `margin-inline: auto`
- [ ] Nenhum botão dentro de `flex-direction: column` sem `align-self: flex-start`
- [ ] Nenhuma `width` fixa > 1440px em elementos de conteúdo
- [ ] Sem `position: absolute` para layout principal — só para overlays e decorações

**Tipografia:**
- [ ] Hierarquia clara: h1 > h2 > h3, sem saltos
- [ ] Body text tem `max-width: 65ch`
- [ ] Line-height adequado: headings 1.0–1.2, body 1.6–1.7
- [ ] Sem mais de 2 fontes diferentes (headline + body)

**Cores:**
- [ ] Texto sobre fundo passa contraste 4.5:1 (texto < 18px)
- [ ] `--c-muted` sobre `--c-bg` ainda legível (verificar manualmente)
- [ ] Estados hover/active/focus em todos os elementos interativos

**Conteúdo:**
- [ ] Nenhum lorem ipsum — todo texto é copy real
- [ ] Nenhum heading com travessão (—)
- [ ] CTAs têm verbo + benefício
- [ ] Proof é específico (números, nomes, datas)

**Técnico:**
- [ ] Bloco `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` tem JSON válido
- [ ] React com integrity hashes (se usando React)
- [ ] `prefers-reduced-motion` declarado
- [ ] `focus-visible` estilizado
- [ ] Arquivo ≤ 1000 linhas

**Rodar o verificador:**
```bash
python verify.py "design.html" --screenshot
```

---

## 25. Prompting Tips (community findings)

- **Especifique feeling antes de componentes** — "dark editorial, confiante" > "botão laranja com hover"
- **Peça variações explicitamente** — Claude Design não dá opções se você não pedir. Pedir 3+ variações.
- **Referencie o DESIGN.md** — "use as cores do brand system" > "use laranja"
- **Diga o que NÃO quer** — proibir lorem ipsum, gradient blobs, language corporativa, layout genérico
- **Pedir Tweaks específicos** — dizer quais dimensões expor no painel (cor, tipografia, densidade, copy)
- **Modelo mais capaz para draft inicial** — Claude Opus 4.7 (ou o mais potente disponível) para o rascunho, pode iterar com modelos mais rápidos depois
- **Fonte confiável de starters:** `VoltAgent/awesome-claude-design` no GitHub
