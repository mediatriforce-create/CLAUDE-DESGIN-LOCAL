/**
 * macos_window.jsx — macOS window chrome with traffic lights and title bar.
 * Use whenever the design needs to look like a desktop app window.
 *
 * Usage:
 *   <MacosWindow title="My App" width={960} height={600}>
 *     <YourContent />
 *   </MacosWindow>
 *
 * Object.assign(window, { MacosWindow });
 */

function MacosWindow({
  children,
  title = '',
  width = 960,
  height = 600,
  bg = '#1e1e1e',
  titlebarBg = '#2c2c2c',
  sidebar = false,
  sidebarBg = '#252525',
  sidebarWidth = 220,
}) {
  const macosWindowStyles = {
    outer: {
      width,
      height,
      borderRadius: 12,
      background: bg,
      boxShadow: '0 22px 70px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },
    titlebar: {
      height: 40,
      background: titlebarBg,
      borderBottom: '1px solid rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 14,
      paddingRight: 14,
      flexShrink: 0,
      position: 'relative',
      userSelect: 'none',
    },
    trafficLights: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
    },
    dot: (color) => ({
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }),
    titleText: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: 13,
      fontWeight: 500,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui',
      color: 'rgba(255,255,255,0.65)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      maxWidth: '60%',
      textOverflow: 'ellipsis',
    },
    body: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
    },
    sidebar: {
      width: sidebarWidth,
      background: sidebarBg,
      borderRight: '1px solid rgba(0,0,0,0.25)',
      flexShrink: 0,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
    },
  };

  return (
    <div style={macosWindowStyles.outer}>
      <div style={macosWindowStyles.titlebar}>
        <div style={macosWindowStyles.trafficLights}>
          <div style={macosWindowStyles.dot('#FF5F57')} />
          <div style={macosWindowStyles.dot('#FEBC2E')} />
          <div style={macosWindowStyles.dot('#28C840')} />
        </div>
        {title && <span style={macosWindowStyles.titleText}>{title}</span>}
      </div>
      <div style={macosWindowStyles.body}>
        {sidebar && (
          <div style={macosWindowStyles.sidebar}>
            {typeof sidebar === 'function' ? sidebar() : sidebar}
          </div>
        )}
        <div style={macosWindowStyles.content}>{children}</div>
      </div>
    </div>
  );
}

Object.assign(window, { MacosWindow });
