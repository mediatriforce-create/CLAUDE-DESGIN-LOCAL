/**
 * deck_stage.js — Slide deck shell web component
 * Drop-in for any HTML slide presentation.
 * Handles: scaling, keyboard/touch nav, slide-count overlay,
 * localStorage persistence, print-to-PDF, speaker-notes postMessage.
 *
 * Usage:
 *   <script src="deck_stage.js"></script>
 *   <deck-stage>
 *     <section data-screen-label="01 Title">...</section>
 *     <section data-screen-label="02 Problem">...</section>
 *   </deck-stage>
 */
(function () {
  const CANVAS_W = 1920;
  const CANVAS_H = 1080;

  const css = `
    :root { margin: 0; padding: 0; background: #000; overflow: hidden; }
    body  { margin: 0; padding: 0; background: #000; overflow: hidden; }

    deck-stage {
      display: block;
      position: fixed; inset: 0;
      background: #000;
      user-select: none;
    }

    deck-stage .ds-canvas {
      position: absolute;
      width:  ${CANVAS_W}px;
      height: ${CANVAS_H}px;
      transform-origin: top left;
      overflow: hidden;
    }

    deck-stage .ds-canvas > section {
      position: absolute; inset: 0;
      display: none;
      width: ${CANVAS_W}px;
      height: ${CANVAS_H}px;
      overflow: hidden;
    }
    deck-stage .ds-canvas > section.active { display: block; }

    deck-stage .ds-counter {
      position: fixed;
      bottom: 18px; right: 24px;
      font: 600 13px/1 'Inter', system-ui, sans-serif;
      color: rgba(255,255,255,0.35);
      z-index: 9999;
      pointer-events: none;
      letter-spacing: 0.04em;
    }

    deck-stage .ds-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 9998;
      opacity: 0;
      transition: opacity 0.2s;
    }
    deck-stage:hover .ds-nav { opacity: 1; }

    deck-stage .ds-btn {
      background: rgba(255,255,255,0.12);
      border: none;
      color: #fff;
      font-size: 18px;
      width: 40px; height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    deck-stage .ds-btn:hover { background: rgba(255,255,255,0.25); }

    @media print {
      deck-stage .ds-counter,
      deck-stage .ds-nav { display: none !important; }
      deck-stage .ds-canvas > section { display: block !important; page-break-after: always; }
      deck-stage .ds-canvas { transform: none !important; position: static !important; }
      :root, body { overflow: visible !important; }
    }
  `;

  class DeckStage extends HTMLElement {
    constructor() {
      super();
      this._idx = 0;
      this._slides = [];
    }

    connectedCallback() {
      // Inject global CSS
      if (!document.getElementById('ds-styles')) {
        const s = document.createElement('style');
        s.id = 'ds-styles';
        s.textContent = css;
        document.head.appendChild(s);
      }

      // Wrap children in canvas div
      const canvas = document.createElement('div');
      canvas.className = 'ds-canvas';
      while (this.firstChild) canvas.appendChild(this.firstChild);
      this.appendChild(canvas);
      this._canvas = canvas;

      // Build controls
      const counter = document.createElement('div');
      counter.className = 'ds-counter';
      this.appendChild(counter);
      this._counter = counter;

      const nav = document.createElement('div');
      nav.className = 'ds-nav';
      nav.innerHTML = `
        <button class="ds-btn ds-prev" title="Previous (←)">&#8592;</button>
        <button class="ds-btn ds-next" title="Next (→)">&#8594;</button>
      `;
      this.appendChild(nav);
      nav.querySelector('.ds-prev').addEventListener('click', () => this.prev());
      nav.querySelector('.ds-next').addEventListener('click', () => this.next());

      this._slides = Array.from(canvas.querySelectorAll(':scope > section'));
      this._slides.forEach((s, i) => {
        if (!s.dataset.screenLabel) s.dataset.screenLabel = String(i + 1).padStart(2, '0');
      });

      // Restore from localStorage
      try {
        const saved = parseInt(localStorage.getItem('ds_slide_idx'), 10);
        if (!isNaN(saved) && saved < this._slides.length) this._idx = saved;
      } catch {}

      this._render();
      this._scale();

      window.addEventListener('resize', () => this._scale());
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); this.next(); }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')                   { e.preventDefault(); this.prev(); }
      });

      // Touch swipe
      let tx = 0;
      this.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
      this.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - tx;
        if (dx < -40) this.next();
        if (dx >  40) this.prev();
      });
    }

    _render() {
      const total = this._slides.length;
      this._slides.forEach((s, i) => s.classList.toggle('active', i === this._idx));
      this._counter.textContent = `${this._idx + 1} / ${total}`;
      try { localStorage.setItem('ds_slide_idx', this._idx); } catch {}
      window.parent.postMessage({ slideIndexChanged: this._idx }, '*');
    }

    _scale() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
      const left  = (vw - CANVAS_W * scale) / 2;
      const top   = (vh - CANVAS_H * scale) / 2;
      this._canvas.style.transform = `scale(${scale})`;
      this._canvas.style.left = `${left}px`;
      this._canvas.style.top  = `${top}px`;
    }

    next() { if (this._idx < this._slides.length - 1) { this._idx++; this._render(); } }
    prev() { if (this._idx > 0) { this._idx--; this._render(); } }
    goTo(n) { this._idx = Math.max(0, Math.min(n, this._slides.length - 1)); this._render(); }
  }

  customElements.define('deck-stage', DeckStage);
})();
