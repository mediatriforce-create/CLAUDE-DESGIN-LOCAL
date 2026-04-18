/**
 * ios_frame.jsx — iPhone 15 Pro bezel with status bar and home indicator.
 * Use whenever the design needs to look like a real phone screen.
 *
 * Usage:
 *   <IosFrame width={390} bg="#000">
 *     <YourScreen />
 *   </IosFrame>
 *
 * Object.assign(window, { IosFrame });
 */

function IosFrame({ children, width = 390, bg = '#000', statusBarStyle = 'light' }) {
  const scale = width / 390;
  const height = width * (844 / 390);
  const textColor = statusBarStyle === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)';

  const iosFrameStyles = {
    outer: {
      width,
      height,
      borderRadius: 54 * scale,
      background: '#1a1a1a',
      boxShadow: `0 0 0 ${2 * scale}px #333, 0 0 0 ${10 * scale}px #111, 0 ${40 * scale}px ${80 * scale}px rgba(0,0,0,0.6)`,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    },
    screen: {
      position: 'absolute',
      inset: `${3 * scale}px`,
      borderRadius: 52 * scale,
      background: bg,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    statusBar: {
      height: 54 * scale,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: `0 ${24 * scale}px ${8 * scale}px`,
      position: 'relative',
      zIndex: 10,
    },
    time: {
      fontSize: 15 * scale,
      fontWeight: 600,
      fontFamily: "'Inter', system-ui",
      color: textColor,
      letterSpacing: '-0.02em',
    },
    icons: {
      display: 'flex',
      alignItems: 'center',
      gap: 6 * scale,
    },
    notch: {
      position: 'absolute',
      top: 12 * scale,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126 * scale,
      height: 36 * scale,
      background: '#000',
      borderRadius: 20 * scale,
      zIndex: 20,
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
    },
    homeBar: {
      height: 34 * scale,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    homeBarInner: {
      width: 134 * scale,
      height: 5 * scale,
      background: textColor,
      borderRadius: 3 * scale,
    },
    sideBtn: (top, h) => ({
      position: 'absolute',
      right: -6 * scale,
      top: top * scale,
      width: 6 * scale,
      height: h * scale,
      background: '#2a2a2a',
      borderRadius: `0 ${3 * scale}px ${3 * scale}px 0`,
    }),
    volUp: {
      position: 'absolute',
      left: -6 * scale,
      top: 120 * scale,
      width: 6 * scale,
      height: 36 * scale,
      background: '#2a2a2a',
      borderRadius: `${3 * scale}px 0 0 ${3 * scale}px`,
    },
    volDown: {
      position: 'absolute',
      left: -6 * scale,
      top: 170 * scale,
      width: 6 * scale,
      height: 36 * scale,
      background: '#2a2a2a',
      borderRadius: `${3 * scale}px 0 0 ${3 * scale}px`,
    },
    mute: {
      position: 'absolute',
      left: -6 * scale,
      top: 80 * scale,
      width: 6 * scale,
      height: 28 * scale,
      background: '#2a2a2a',
      borderRadius: `${3 * scale}px 0 0 ${3 * scale}px`,
    },
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const BatteryIcon = () => (
    <svg width={25 * scale} height={13 * scale} viewBox="0 0 25 13" fill="none">
      <rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke={textColor} strokeOpacity="0.35"/>
      <rect x="2" y="2" width="16" height="9" rx="1.5" fill={textColor}/>
      <path d="M23 4.5V8.5C23.8 8.2 24.5 7.5 24.5 6.5C24.5 5.5 23.8 4.8 23 4.5Z" fill={textColor} fillOpacity="0.4"/>
    </svg>
  );

  const WifiIcon = () => (
    <svg width={16 * scale} height={12 * scale} viewBox="0 0 16 12" fill={textColor}>
      <path d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11S8.83 12.5 8 12.5 6.5 11.83 6.5 11 7.17 9.5 8 9.5zM8 6C9.5 6 10.85 6.6 11.85 7.57L13.27 6.14C11.91 4.82 10.05 4 8 4s-3.91.82-5.27 2.14L4.15 7.57C5.15 6.6 6.5 6 8 6zM8 2c2.55 0 4.86 1.02 6.54 2.66L16 3.19C13.96 1.21 11.12 0 8 0S2.04 1.21 0 3.19l1.46 1.47C3.14 3.02 5.45 2 8 2z"/>
    </svg>
  );

  return (
    <div style={iosFrameStyles.outer}>
      <div style={iosFrameStyles.mute} />
      <div style={iosFrameStyles.volUp} />
      <div style={iosFrameStyles.volDown} />
      <div style={iosFrameStyles.sideBtn(160, 80)} />

      <div style={iosFrameStyles.screen}>
        <div style={iosFrameStyles.notch} />
        <div style={iosFrameStyles.statusBar}>
          <span style={iosFrameStyles.time}>{timeStr}</span>
          <div style={iosFrameStyles.icons}>
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>
        <div style={iosFrameStyles.content}>{children}</div>
        <div style={iosFrameStyles.homeBar}>
          <div style={iosFrameStyles.homeBarInner} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IosFrame });
