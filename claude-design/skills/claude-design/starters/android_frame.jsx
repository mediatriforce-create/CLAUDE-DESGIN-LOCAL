/**
 * android_frame.jsx — Android phone bezel (Pixel-style) with status bar and navigation bar.
 * Use whenever the design needs to look like a real Android device.
 *
 * Usage:
 *   <AndroidFrame width={390} bg="#000">
 *     <YourScreen />
 *   </AndroidFrame>
 *
 * Object.assign(window, { AndroidFrame });
 */

function AndroidFrame({ children, width = 390, bg = '#fff', statusBarStyle = 'dark', accentColor = '#1a73e8' }) {
  const scale = width / 390;
  const height = width * (2400 / 1080); // Pixel 8 ratio
  const textColor = statusBarStyle === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.87)';
  const iconColor = statusBarStyle === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.87)';

  const androidStyles = {
    outer: {
      width,
      height,
      borderRadius: 44 * scale,
      background: '#1c1c1e',
      boxShadow: `0 0 0 ${1.5 * scale}px #333, 0 0 0 ${8 * scale}px #111, 0 ${40 * scale}px ${80 * scale}px rgba(0,0,0,0.5)`,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    },
    screen: {
      position: 'absolute',
      inset: `${3 * scale}px`,
      borderRadius: 42 * scale,
      background: bg,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    statusBar: {
      height: 40 * scale,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${20 * scale}px`,
      position: 'relative',
      zIndex: 10,
    },
    time: {
      fontSize: 13 * scale,
      fontWeight: 500,
      fontFamily: "'Inter', 'Roboto', system-ui",
      color: textColor,
      letterSpacing: '0.01em',
    },
    icons: {
      display: 'flex',
      alignItems: 'center',
      gap: 5 * scale,
    },
    punchHole: {
      position: 'absolute',
      top: 10 * scale,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 12 * scale,
      height: 12 * scale,
      background: '#000',
      borderRadius: '50%',
      zIndex: 20,
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
    },
    navBar: {
      height: 36 * scale,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 42 * scale,
      paddingBottom: 4 * scale,
      background: bg,
    },
    navBtn: (shape) => {
      if (shape === 'back') return {
        width: 20 * scale,
        height: 20 * scale,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
      };
      if (shape === 'home') return {
        width: 18 * scale,
        height: 18 * scale,
        borderRadius: 9 * scale,
        border: `${2 * scale}px solid ${iconColor}`,
        opacity: 0.5,
      };
      if (shape === 'recents') return {
        width: 16 * scale,
        height: 16 * scale,
        borderRadius: 3 * scale,
        border: `${2 * scale}px solid ${iconColor}`,
        opacity: 0.5,
      };
    },
    powerBtn: {
      position: 'absolute',
      right: -5 * scale,
      top: 140 * scale,
      width: 5 * scale,
      height: 60 * scale,
      background: '#2a2a2a',
      borderRadius: `0 ${3 * scale}px ${3 * scale}px 0`,
    },
    volUp: {
      position: 'absolute',
      left: -5 * scale,
      top: 120 * scale,
      width: 5 * scale,
      height: 44 * scale,
      background: '#2a2a2a',
      borderRadius: `${3 * scale}px 0 0 ${3 * scale}px`,
    },
    volDown: {
      position: 'absolute',
      left: -5 * scale,
      top: 175 * scale,
      width: 5 * scale,
      height: 44 * scale,
      background: '#2a2a2a',
      borderRadius: `${3 * scale}px 0 0 ${3 * scale}px`,
    },
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const BatteryIcon = () => (
    <svg width={18 * scale} height={11 * scale} viewBox="0 0 18 11" fill="none">
      <rect x="0.5" y="0.5" width="15" height="10" rx="2.5" stroke={iconColor} strokeOpacity="0.5"/>
      <rect x="2" y="2" width="10" height="7" rx="1" fill={iconColor}/>
      <path d="M16.5 3.5V7.5C17.2 7.2 17.8 6.5 17.8 5.5S17.2 3.8 16.5 3.5Z" fill={iconColor} fillOpacity="0.5"/>
    </svg>
  );

  const SignalIcon = () => (
    <svg width={16 * scale} height={12 * scale} viewBox="0 0 16 12" fill={iconColor}>
      <rect x="0" y="8" width="2.5" height="4" rx="0.5"/>
      <rect x="4" y="5" width="2.5" height="7" rx="0.5"/>
      <rect x="8" y="2.5" width="2.5" height="9.5" rx="0.5"/>
      <rect x="12" y="0" width="2.5" height="12" rx="0.5" opacity="0.3"/>
    </svg>
  );

  const WifiIcon = () => (
    <svg width={15 * scale} height={11 * scale} viewBox="0 0 15 11" fill={iconColor}>
      <path d="M7.5 8C8.3 8 9 8.7 9 9.5S8.3 11 7.5 11 6 10.3 6 9.5 6.7 8 7.5 8z"/>
      <path d="M7.5 5c1.2 0 2.3.5 3.1 1.3l1-1C10.4 4.2 9 3.5 7.5 3.5S4.6 4.2 3.4 5.3l1 1C5.2 5.5 6.3 5 7.5 5z" opacity="0.7"/>
      <path d="M7.5 2C9.3 2 11 2.7 12.3 3.9l1-1C11.8 1.5 9.8.5 7.5.5S3.2 1.5 1.7 2.9l1 1C4 2.7 5.7 2 7.5 2z" opacity="0.4"/>
    </svg>
  );

  const BackIcon = () => (
    <svg width={16 * scale} height={16 * scale} viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke={iconColor} strokeWidth={1.5 * scale} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div style={androidStyles.outer}>
      <div style={androidStyles.volUp} />
      <div style={androidStyles.volDown} />
      <div style={androidStyles.powerBtn} />

      <div style={androidStyles.screen}>
        <div style={androidStyles.punchHole} />
        <div style={androidStyles.statusBar}>
          <span style={androidStyles.time}>{timeStr}</span>
          <div style={androidStyles.icons}>
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>
        <div style={androidStyles.content}>{children}</div>
        <div style={androidStyles.navBar}>
          <div style={androidStyles.navBtn('back')}><BackIcon /></div>
          <div style={androidStyles.navBtn('home')} />
          <div style={androidStyles.navBtn('recents')} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AndroidFrame });
