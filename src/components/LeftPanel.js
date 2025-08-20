import React from 'react';

const LeftPanel = ({
  SIDE_PANEL_WIDTH,
  background,
  setBackground,
  setIsLineDrawingMode,
  setLineBarConfig,
  isMobile,
  isTablet,
  isSmallMobile
}) => {
  const panelStyle = isMobile ? {
    width: '100%',
    position: 'relative',
    marginBottom: isSmallMobile ? '8px' : '10px'
  } : {
    width: SIDE_PANEL_WIDTH,
    position: 'relative'
  };

  const containerStyle = isMobile ? {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallMobile ? '6px' : '8px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    margin: isSmallMobile ? '2px' : '3px',
    border: '2px solid #000000',
    gap: isSmallMobile ? '6px' : '8px',
    touchAction: 'manipulation'
  } : {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    margin: '10px',
    border: '2px solid #000000'
  };

  const buttonStyle = isMobile ? {
    width: isSmallMobile ? '70px' : '80px',
    padding: isSmallMobile ? '10px 0' : '12px 0',
    fontSize: isSmallMobile ? '0.75rem' : '0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: '#ffffff',
    color: '#000000',
    fontWeight: 700,
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid #000000',
    marginBottom: 0,
    minHeight: isSmallMobile ? '40px' : '48px', // Touch-friendly minimum height
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
    // Better mobile styling
    WebkitUserSelect: 'none',
    userSelect: 'none'
  } : {
    width: '110px',
    padding: '16px 0',
    fontSize: '1.05rem',
    borderRadius: '10px',
    border: 'none',
    background: '#ffffff',
    color: '#000000',
    fontWeight: 700,
    boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid #000000',
    marginBottom: 0,
  };

  return (
    <div style={panelStyle}>
      <div 
        onClick={() => {
          setIsLineDrawingMode(false);
          setLineBarConfig(prev => ({ ...prev, mode: 'cursor' }));
        }}
        style={containerStyle}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column', 
          gap: isMobile ? (isSmallMobile ? 8 : 10) : 24, 
          width: '100%', 
          alignItems: 'center', 
          padding: isMobile ? (isSmallMobile ? '0 8px' : '0 10px') : '0 20px',
          justifyContent: isMobile ? 'space-around' : 'center'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBackground('/pitch_full.png');
            }}
            style={{
              ...buttonStyle,
              background: background === '/pitch_full.png' ? '#000000' : '#ffffff',
              color: background === '/pitch_full.png' ? '#ffffff' : '#000000',
            }}
          >
            {isMobile ? (isSmallMobile ? 'Full' : 'Full') : 'Full Field'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBackground('/pitch_half.png');
            }}
            style={{
              ...buttonStyle,
              background: background === '/pitch_half.png' ? '#000000' : '#ffffff',
              color: background === '/pitch_half.png' ? '#ffffff' : '#000000',
            }}
          >
            {isMobile ? (isSmallMobile ? 'Half' : 'Half') : 'Half Field'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBackground('/pitch_blank.png');
            }}
            style={{
              ...buttonStyle,
              background: background === '/pitch_blank.png' ? '#000000' : '#ffffff',
              color: background === '/pitch_blank.png' ? '#ffffff' : '#000000',
            }}
          >
            {isMobile ? (isSmallMobile ? 'Blank' : 'Blank') : 'Blank'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel; 