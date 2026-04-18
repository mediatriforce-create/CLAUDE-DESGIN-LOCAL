/**
 * animations.jsx — Timeline-based animation engine for video-style HTML artifacts.
 *
 * Provides:
 *   <Stage fps dur bg>   — auto-scale canvas, scrubber, play/pause
 *   <Sprite start end>   — mounts/unmounts children on timeline range
 *   useTime()            — current time (seconds) from Stage context
 *   useSprite(start,end) — { t, progress, active } for a sprite window
 *   Easing               — named easing functions
 *   interpolate(t, from, to, ease?) — lerp with optional easing
 *
 * Usage:
 *   <Stage dur={6} fps={60} bg="#0d0d0f">
 *     <Sprite start={0} end={3}>
 *       <YourScene t={t} />
 *     </Sprite>
 *   </Stage>
 *
 * Object.assign(window, { Stage, Sprite, useTime, useSprite, Easing, interpolate });
 */

const { useState, useEffect, useRef, useContext, createContext, useCallback } = React;

// ─── Easing library ───────────────────────────────────────────────────────────

const Easing = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => 1 - (1 - t) * (1 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: t => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: t => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  },
  easeOutBounce: t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  spring: (t, tension = 0.4, friction = 0.7) => {
    const beta = Math.sqrt(1 - friction * friction);
    return 1 - Math.exp(-friction * t * Math.PI * 2) *
      Math.cos(beta * t * Math.PI * 2);
  },
};

// ─── interpolate ──────────────────────────────────────────────────────────────

function interpolate(t, from, to, ease = Easing.linear) {
  const clamped = Math.max(0, Math.min(1, t));
  const eased = ease(clamped);
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * eased;
  }
  // Color interpolation (hex strings)
  if (typeof from === 'string' && from.startsWith('#')) {
    const fR = parseInt(from.slice(1,3),16), fG = parseInt(from.slice(3,5),16), fB = parseInt(from.slice(5,7),16);
    const tR = parseInt(to.slice(1,3),16),   tG = parseInt(to.slice(3,5),16),   tB = parseInt(to.slice(5,7),16);
    const r = Math.round(fR + (tR - fR) * eased);
    const g = Math.round(fG + (tG - fG) * eased);
    const b = Math.round(fB + (tB - fB) * eased);
    return `rgb(${r},${g},${b})`;
  }
  return eased >= 0.5 ? to : from;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TimeContext = createContext({ time: 0, dur: 5 });
const useTime = () => useContext(TimeContext).time;

function useSprite(start, end) {
  const { time } = useContext(TimeContext);
  const active = time >= start && time < end;
  const raw = end > start ? (time - start) / (end - start) : 0;
  const progress = Math.max(0, Math.min(1, raw));
  const t = progress;
  return { t, progress, active };
}

// ─── Stage ────────────────────────────────────────────────────────────────────

const STAGE_W = 1920;
const STAGE_H = 1080;

const stageStyles = {
  wrapper: {
    width: '100vw',
    height: '100vh',
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
  },
  canvasWrap: {
    position: 'relative',
    transformOrigin: 'top left',
    overflow: 'hidden',
    flexShrink: 0,
  },
  controls: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 20px',
    zIndex: 9999,
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  btn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    width: 36,
    height: 36,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scrubber: {
    flex: 1,
    height: 4,
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    outline: 'none',
    cursor: 'pointer',
  },
  timeLabel: {
    fontFamily: "'Inter', system-ui",
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    minWidth: 72,
    textAlign: 'right',
    letterSpacing: '0.05em',
  },
};

function Stage({ children, dur = 5, fps = 60, bg = '#0d0d0f', width = STAGE_W, height = STAGE_H }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState(false);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const wrapperRef = useRef(null);

  // Scaling
  useEffect(() => {
    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight - 56;
      setScale(Math.min(vw / width, vh / height));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [width, height]);

  // RAF loop
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
      return;
    }
    const tick = (now) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setTime(t => {
        const next = t + dt;
        if (next >= dur) { setPlaying(false); return dur; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, dur]);

  const togglePlay = useCallback(() => {
    setPlaying(p => {
      if (!p && time >= dur) setTime(0);
      return !p;
    });
  }, [time, dur]);

  const fmt = s => {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(1).padStart(4, '0');
    return `${m}:${sec}`;
  };

  const left = (window.innerWidth - width * scale) / 2;
  const top = (window.innerHeight - 56 - height * scale) / 2;

  return (
    <TimeContext.Provider value={{ time, dur }}>
      <div
        style={stageStyles.wrapper}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={togglePlay}
      >
        <div
          ref={wrapperRef}
          style={{
            ...stageStyles.canvasWrap,
            width: width * scale,
            height: height * scale,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            marginLeft: left < 0 ? 0 : 'auto',
            marginRight: left < 0 ? 0 : 'auto',
            background: bg,
          }}
        >
          {children}
        </div>

        <div style={{ ...stageStyles.controls, opacity: hover ? 1 : 0 }}
          onClick={e => e.stopPropagation()}>
          <button style={stageStyles.btn} onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <input
            type="range"
            min={0}
            max={dur}
            step={1 / fps}
            value={time}
            style={stageStyles.scrubber}
            onChange={e => { setTime(parseFloat(e.target.value)); setPlaying(false); }}
          />
          <span style={stageStyles.timeLabel}>{fmt(time)} / {fmt(dur)}</span>
        </div>
      </div>
    </TimeContext.Provider>
  );
}

// ─── Sprite ───────────────────────────────────────────────────────────────────

function Sprite({ children, start = 0, end = 5 }) {
  const { time } = useContext(TimeContext);
  if (time < start || time >= end) return null;
  return React.createElement(React.Fragment, null, children);
}

// ─── Export ───────────────────────────────────────────────────────────────────

Object.assign(window, { Stage, Sprite, useTime, useSprite, Easing, interpolate });
