import React from 'react';

const LeftPanel = ({
  SIDE_PANEL_WIDTH,
  background,
  setBackground,
  setIsLineDrawingMode,
  setLineBarConfig
}) => (
  <div style={{ width: SIDE_PANEL_WIDTH, position: 'relative' }}>
    <div 
      onClick={() => {
        setIsLineDrawingMode(false);
        setLineBarConfig(prev => ({ ...prev, mode: 'cursor' }));
      }}
      style={{
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
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', alignItems: 'center', padding: '0 20px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBackground('/pitch_full.png');
          }}
          style={{
            width: '110px',
            padding: '16px 0',
            fontSize: '1.05rem',
            borderRadius: '10px',
            border: 'none',
            background: background === '/pitch_full.png' ? '#000000' : '#ffffff',
            color: background === '/pitch_full.png' ? '#ffffff' : '#000000',
            fontWeight: 700,
            boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #000000',
            marginBottom: 0,
          }}
        >
          Full Field
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBackground('/pitch_half.png');
          }}
          style={{
            width: '110px',
            padding: '16px 0',
            fontSize: '1.05rem',
            borderRadius: '10px',
            border: 'none',
            background: background === '/pitch_half.png' ? '#000000' : '#ffffff',
            color: background === '/pitch_half.png' ? '#ffffff' : '#000000',
            fontWeight: 700,
            boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #000000',
            marginBottom: 0,
          }}
        >
          Half Field
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBackground('/pitch_blank.png');
          }}
          style={{
            width: '110px',
            padding: '16px 0',
            fontSize: '1.05rem',
            borderRadius: '10px',
            border: 'none',
            background: background === '/pitch_blank.png' ? '#000000' : '#ffffff',
            color: background === '/pitch_blank.png' ? '#ffffff' : '#000000',
            fontWeight: 700,
            boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid #000000',
            marginBottom: 0,
          }}
        >
          Blank
        </button>
      </div>
    </div>
  </div>
);

export default LeftPanel; 