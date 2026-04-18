/**
 * design_canvas.jsx — Grid layout for presenting 2+ static design variations side-by-side.
 * Use when exploring purely visual options: color, type, layout variants.
 *
 * Usage (inline Babel):
 *   Object.assign(window, { DesignCanvas, DesignCell });
 *
 *   <DesignCanvas columns={2} gap={32} bg="#111">
 *     <DesignCell label="Option A — Safe" accent="#FF6B00">
 *       <YourComponent />
 *     </DesignCell>
 *     <DesignCell label="Option B — Bold">
 *       <YourComponent />
 *     </DesignCell>
 *   </DesignCanvas>
 */

const canvasStyles = {
  wrapper: {
    width: '100vw', minHeight: '100vh',
    background: 'var(--canvas-bg, #0d0d0d)',
    padding: '48px 32px',
    boxSizing: 'border-box',
  },
  header: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.2)',
    marginBottom: 32,
  },
  grid: (cols, gap) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gap}px`,
  }),
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: (accent) => ({
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: accent || 'rgba(255,255,255,0.4)',
    letterSpacing: '0.06em',
    paddingBottom: 12,
    borderBottom: `1px solid ${accent || 'rgba(255,255,255,0.08)'}`,
  }),
  content: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
};

function DesignCanvas({ columns = 2, gap = 24, bg = '#0d0d0d', title, children }) {
  return (
    <div style={{ ...canvasStyles.wrapper, background: bg }}>
      {title && <div style={canvasStyles.header}>{title}</div>}
      <div style={canvasStyles.grid(columns, gap)}>
        {children}
      </div>
    </div>
  );
}

function DesignCell({ label, accent, children }) {
  return (
    <div style={canvasStyles.cell}>
      {label && <div style={canvasStyles.label(accent)}>{label}</div>}
      <div style={canvasStyles.content}>{children}</div>
    </div>
  );
}

Object.assign(window, { DesignCanvas, DesignCell });
