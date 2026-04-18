/**
 * browser_window.jsx — Browser window chrome with tab bar and address bar.
 * Use whenever the design needs to look like a web browser screen.
 *
 * Usage:
 *   <BrowserWindow url="https://myapp.com" width={1280} height={800}>
 *     <YourWebpage />
 *   </BrowserWindow>
 *
 * Object.assign(window, { BrowserWindow });
 */

function BrowserWindow({
  children,
  url = 'https://example.com',
  title = '',
  width = 1280,
  height = 800,
  bg = '#ffffff',
  tabsBg = '#dee1e6',
  toolbarBg = '#f1f3f4',
  dark = false,
}) {
  const isDark = dark;
  const tabBg = isDark ? '#35363a' : tabsBg;
  const tbBg = isDark ? '#292a2d' : toolbarBg;
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
  const activeTabBg = isDark ? '#292a2d' : '#ffffff';
  const urlBarBg = isDark ? '#1e1e1e' : '#ffffff';

  const browserWindowStyles = {
    outer: {
      width,
      height,
      borderRadius: 10,
      background: bg,
      boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },
    tabBar: {
      height: 36,
      background: tabBg,
      display: 'flex',
      alignItems: 'flex-end',
      paddingLeft: 72,
      paddingRight: 12,
      borderBottom: `1px solid ${borderColor}`,
      flexShrink: 0,
      userSelect: 'none',
      gap: 0,
    },
    tab: {
      height: 28,
      background: activeTabBg,
      borderRadius: '6px 6px 0 0',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 12,
      paddingRight: 12,
      gap: 8,
      minWidth: 160,
      maxWidth: 240,
      position: 'relative',
    },
    tabTitle: {
      fontSize: 12,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Google Sans", system-ui',
      color: textColor,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
    },
    tabClose: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
      flexShrink: 0,
    },
    favicon: {
      width: 14,
      height: 14,
      borderRadius: 2,
      background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
      flexShrink: 0,
    },
    toolbar: {
      height: 42,
      background: tbBg,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 12px',
      flexShrink: 0,
    },
    navBtn: {
      width: 28,
      height: 28,
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
      fontSize: 14,
      cursor: 'default',
      userSelect: 'none',
    },
    trafficLights: {
      display: 'flex',
      gap: 7,
      alignItems: 'center',
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
    },
    dot: (color) => ({
      width: 11,
      height: 11,
      borderRadius: '50%',
      background: color,
    }),
    urlBar: {
      flex: 1,
      height: 28,
      background: urlBarBg,
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 6,
      border: `1px solid ${borderColor}`,
    },
    urlText: {
      fontSize: 13,
      fontFamily: '-apple-system, BlinkMacSystemFont, system-ui',
      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      flex: 1,
    },
    lockIcon: {
      fontSize: 11,
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
      flexShrink: 0,
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      background: bg,
      position: 'relative',
    },
  };

  const displayUrl = url.replace(/^https?:\/\//, '');
  const displayTitle = title || displayUrl.split('/')[0];

  return (
    <div style={browserWindowStyles.outer}>
      {/* Tab bar */}
      <div style={{ ...browserWindowStyles.tabBar, position: 'relative' }}>
        <div style={browserWindowStyles.trafficLights}>
          <div style={browserWindowStyles.dot('#FF5F57')} />
          <div style={browserWindowStyles.dot('#FEBC2E')} />
          <div style={browserWindowStyles.dot('#28C840')} />
        </div>
        <div style={browserWindowStyles.tab}>
          <div style={browserWindowStyles.favicon} />
          <span style={browserWindowStyles.tabTitle}>{displayTitle}</span>
          <span style={browserWindowStyles.tabClose}>✕</span>
        </div>
      </div>

      {/* Toolbar / address bar */}
      <div style={browserWindowStyles.toolbar}>
        <div style={browserWindowStyles.navBtn}>←</div>
        <div style={browserWindowStyles.navBtn}>→</div>
        <div style={browserWindowStyles.navBtn}>↻</div>
        <div style={browserWindowStyles.urlBar}>
          <span style={browserWindowStyles.lockIcon}>🔒</span>
          <span style={browserWindowStyles.urlText}>{displayUrl}</span>
        </div>
      </div>

      {/* Content */}
      <div style={browserWindowStyles.content}>{children}</div>
    </div>
  );
}

Object.assign(window, { BrowserWindow });
