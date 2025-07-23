import React, { useState } from 'react';
import { FaUndo } from 'react-icons/fa';
import { ICON_SIZE } from './DrillDrawer';

const RightPanel = ({
  SIDE_PANEL_WIDTH,
  coneColor,
  setConeColor,
  coneSize,
  setConeSize,
  labelModeTeam1,
  setLabelModeTeam1,
  labelModeTeam2,
  setLabelModeTeam2,
  getNextLabel,
  draggingFromPanel,
  setDraggingFromPanel,
  undoLast,
  editingPlayerId,
  editingText,
  setEditingText,
  handleEditComplete,
  setDragPosition,
  playerColorTeam1,
  setPlayerColorTeam1,
  playerColorTeam2,
  setPlayerColorTeam2,
  playerStyleTeam1,
  setPlayerStyleTeam1,
  playerStyleTeam2,
  setPlayerStyleTeam2,
  playerStripeColorTeam1,
  setPlayerStripeColorTeam1,
  playerStripeColorTeam2,
  setPlayerStripeColorTeam2,
  playerLabelTypeTeam1,
  setPlayerLabelTypeTeam1,
  playerLabelTypeTeam2,
  setPlayerLabelTypeTeam2,
  playerCustomTextTeam1,
  setPlayerCustomTextTeam1,
  playerCustomTextTeam2,
  setPlayerCustomTextTeam2,
  nextPlayerNumberTeam1,
  nextPlayerNumberTeam2,
  deleteSelectedItems,
  clearAllItems,
  setIsLineDrawingMode,
  setLineBarConfig,
  lineBarConfig,
  isDeleteMode,
  setIsDeleteMode,
}) => {
  console.log('=== RIGHTPANEL DEBUG ===');
  console.log('isDeleteMode received:', isDeleteMode);
  
  const [showConeOptions, setShowConeOptions] = useState(false);
  const [showPlayer1Options, setShowPlayer1Options] = useState(false);
  const [showPlayer2Options, setShowPlayer2Options] = useState(false);

  // Exit scissors mode when any other button is clicked
  const exitScissorsMode = () => {
    if (isDeleteMode) {
      console.log('=== EXITING SCISSORS MODE ===');
      setIsDeleteMode(false);
    }
  };

  // Close all menus when clicking outside
  const closeAllMenus = () => {
    setShowConeOptions(false);
    setShowPlayer1Options(false);
    setShowPlayer2Options(false);
  };

  // Close other menus when opening one
  const openMenu = (menuType) => {
    closeAllMenus();
    switch (menuType) {
      case 'cone':
        setShowConeOptions(true);
        break;
      case 'player1':
        setShowPlayer1Options(true);
        break;
      case 'player2':
        setShowPlayer2Options(true);
        break;
    }
  };

  const coneColors = [
    { name: 'White', value: 'white' },
    { name: 'Black', value: 'black' },
    { name: 'Orange', value: 'orange' },
    { name: 'Red', value: 'red' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Green', value: 'green' },
    { name: 'Blue', value: 'blue' },
  ];

  const playerColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Yellow', value: '#ca8a04' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const playerStyles = [
    { name: 'Solid', value: 'solid' },
    { name: 'Striped', value: 'striped' },
  ];

  const stripeColors = [
    { name: 'White', value: 'white' },
    { name: 'Black', value: 'black' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Red', value: 'red' },
    { name: 'Blue', value: 'blue' },
  ];

  // Add click outside handler and Enter key handler
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.options-menu') && !event.target.closest('.settings-button')) {
        closeAllMenus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        // Close all menus when Enter is pressed, but only if menus are open
        if (showConeOptions || showPlayer1Options || showPlayer2Options) {
          closeAllMenus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConeOptions, showPlayer1Options, showPlayer2Options]);

  const renderPlayerIcon = (color, style, stripeColor, label, labelType, customText, nextNumber) => {
    const size = ICON_SIZE;
    const radius = size / 2;
    let playerLabel = '';
    if (labelType === 'number') {
      playerLabel = nextNumber.toString();
    } else if (labelType === 'text') {
      playerLabel = customText;
    }
    
    if (style === 'striped') {
      return (
        <svg width={size} height={size}>
          <defs>
            <pattern id={`stripes-${color}-${stripeColor}`} patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill={color} />
              <rect width="2" height="4" fill={stripeColor} />
            </pattern>
          </defs>
          <circle 
            cx={radius} 
            cy={radius} 
            r={radius - 1} 
            fill={`url(#stripes-${color}-${stripeColor})`}
            stroke="black"
            strokeWidth="1"
          />
          {/* Centered Text Label */}
          {(playerLabel || label) && (
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={playerLabel ? 24 : 20}
              fill="black"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              {playerLabel || label}
            </text>
          )}
        </svg>
      );
    } else {
      return (
        <svg width={size} height={size}>
          <circle 
            cx={radius} 
            cy={radius} 
            r={radius - 1} 
            fill={color}
            stroke="black"
            strokeWidth="1"
          />
          {/* Centered Text Label */}
          {(playerLabel || label) && (
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={playerLabel ? 24 : 20}
              fill="black"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              {playerLabel || label}
            </text>
          )}
        </svg>
      );
    }
  };

  return (
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
        justifyContent: 'center',
        padding: 20,
        gap: 20,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        margin: '10px',
        border: '2px solid #000000'
      }}
    >
        
      {/* Cone Tool */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                exitScissorsMode();
                setDraggingFromPanel('cone');
              }}
          >
            <polygon points="50,10 90,90 10,90" fill={coneColor} stroke="black" strokeWidth="4" />
          </svg>
            <button
              className="settings-button"
              onClick={(e) => {
                e.stopPropagation();
                exitScissorsMode();
                openMenu('cone');
              }}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚙️
            </button>
          </div>
          
          {showConeOptions && (
            <div 
              className="options-menu"
              style={{
                position: 'absolute',
                top: 50,
                left: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: 120,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                  Color:
                </label>
                <select 
                  value={coneColor} 
                  onChange={e => {
                    exitScissorsMode();
                    setConeColor(e.target.value);
                  }}
                  style={{ width: '100%', padding: 4, fontSize: '12px' }}
                >
                  {coneColors.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                  Size:
                </label>
                <select 
                  value={coneSize} 
                  onChange={e => {
                    exitScissorsMode();
                    setConeSize(e.target.value);
                  }}
                  style={{ width: '100%', padding: 4, fontSize: '12px' }}
                >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
              </div>
            </div>
          )}
          
          <div style={{ fontSize: '12px', color: '#000000', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Drag Cone
          </div>
        </div>

        {/* Team 1 Player */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                exitScissorsMode();
                setDraggingFromPanel('team1');
              }}
            >
              {renderPlayerIcon(playerColorTeam1, playerStyleTeam1, playerStripeColorTeam1, getNextLabel('team1'), playerLabelTypeTeam1, playerCustomTextTeam1, nextPlayerNumberTeam1)}
            </div>
            <button
              className="settings-button"
              onClick={(e) => {
                e.stopPropagation();
                exitScissorsMode();
                openMenu('player1');
              }}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚙️
            </button>
      </div>

          {showPlayer1Options && (
            <div 
              className="options-menu"
              style={{
                position: 'absolute',
                top: 50,
                left: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: 120,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                  Color:
                </label>
                <select 
                  value={playerColorTeam1} 
                  onChange={e => {
                    exitScissorsMode();
                    setPlayerColorTeam1(e.target.value);
                  }}
                  style={{ width: '100%', padding: 4, fontSize: '12px' }}
                >
                  {playerColors.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                  Style:
                </label>
                <select 
                  value={playerStyleTeam1} 
                  onChange={e => {
                    exitScissorsMode();
                    setPlayerStyleTeam1(e.target.value);
                  }}
                  style={{ width: '100%', padding: 4, fontSize: '12px' }}
                >
                  {playerStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
              
                                   {playerStyleTeam1 === 'striped' && (
                       <div>
                         <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                           Stripe Color:
                         </label>
                         <select
                           value={playerStripeColorTeam1}
                           onChange={e => setPlayerStripeColorTeam1(e.target.value)}
                           style={{ width: '100%', padding: 4, fontSize: '12px' }}
                         >
                           {stripeColors.map(color => (
                             <option key={color.value} value={color.value}>
                               {color.name}
                             </option>
                           ))}
                         </select>
                       </div>
                     )}
                     
                     <div>
                       <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                         Label Type:
                       </label>
        <select
                         value={playerLabelTypeTeam1}
                         onChange={e => setPlayerLabelTypeTeam1(e.target.value)}
                         style={{ width: '100%', padding: 4, fontSize: '12px' }}
                       >
                         <option value="none">None</option>
                         <option value="number">Auto Number</option>
                         <option value="text">Custom Text</option>
        </select>
      </div>
                     
                     {playerLabelTypeTeam1 === 'text' && (
                       <div>
                         <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                           Custom Text:
                         </label>
                         <input
                           type="text"
                           value={playerCustomTextTeam1}
                           onChange={e => {
                             exitScissorsMode();
                             setPlayerCustomTextTeam1(e.target.value);
                           }}
                           placeholder="Enter text..."
                           style={{ width: '100%', padding: 4, fontSize: '12px' }}
                         />
                       </div>
                     )}
                     
                     {playerLabelTypeTeam1 === 'number' && (
                       <div style={{ fontSize: '10px', textAlign: 'center', marginTop: 4 }}>
                         Next number: {nextPlayerNumberTeam1}
                       </div>
                     )}
            </div>
          )}
          
          <div style={{ fontSize: '12px', color: '#000000', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Drag Player (Team 1)
          </div>
        </div>

      {/* Team 2 Player */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                exitScissorsMode();
                setDraggingFromPanel('team2');
              }}
            >
              {renderPlayerIcon(playerColorTeam2, playerStyleTeam2, playerStripeColorTeam2, getNextLabel('team2'), playerLabelTypeTeam2, playerCustomTextTeam2, nextPlayerNumberTeam2)}
            </div>
            <button
              className="settings-button"
              onClick={(e) => {
                e.stopPropagation();
                exitScissorsMode();
                openMenu('player2');
              }}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ⚙️
            </button>
          </div>
          
          {showPlayer2Options && (
            <div 
              className="options-menu"
              style={{
                position: 'absolute',
                top: 50,
                left: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: 120,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                  Color:
                </label>
                <select 
                  value={playerColorTeam2} 
                  onChange={e => setPlayerColorTeam2(e.target.value)}
                  style={{ width: '100%', padding: 4, fontSize: '12px' }}
                >
                  {playerColors.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                  Style:
                </label>
                <select 
                  value={playerStyleTeam2} 
                  onChange={e => setPlayerStyleTeam2(e.target.value)}
                  style={{ width: '100%', padding: 4, fontSize: '12px' }}
                >
                  {playerStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
              
                                   {playerStyleTeam2 === 'striped' && (
                       <div>
                         <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                           Stripe Color:
                         </label>
                         <select
                           value={playerStripeColorTeam2}
                           onChange={e => setPlayerStripeColorTeam2(e.target.value)}
                           style={{ width: '100%', padding: 4, fontSize: '12px' }}
                         >
                           {stripeColors.map(color => (
                             <option key={color.value} value={color.value}>
                               {color.name}
                             </option>
                           ))}
                         </select>
                       </div>
                     )}
                     
                     <div>
                       <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                         Label Type:
                       </label>
        <select
                         value={playerLabelTypeTeam2}
                         onChange={e => setPlayerLabelTypeTeam2(e.target.value)}
                         style={{ width: '100%', padding: 4, fontSize: '12px' }}
                       >
                         <option value="none">None</option>
                         <option value="number">Auto Number</option>
                         <option value="text">Custom Text</option>
        </select>
      </div>
                     
                     {playerLabelTypeTeam2 === 'text' && (
                       <div>
                         <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                           Custom Text:
                         </label>
                         <input
                           type="text"
                           value={playerCustomTextTeam2}
                           onChange={e => setPlayerCustomTextTeam2(e.target.value)}
                           placeholder="Enter text..."
                           style={{ width: '100%', padding: 4, fontSize: '12px' }}
                         />
                       </div>
                     )}
                     
                     {playerLabelTypeTeam2 === 'number' && (
                       <div style={{ fontSize: '10px', textAlign: 'center', marginTop: 4 }}>
                         Next number: {nextPlayerNumberTeam2}
                       </div>
                     )}
            </div>
          )}
          
          <div style={{ fontSize: '12px', color: '#000000', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Drag Player (Team 2)
          </div>
        </div>

      {/* Football Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{ cursor: 'pointer', fontSize: ICON_SIZE }}
            onMouseDown={(e) => {
              e.stopPropagation();
              exitScissorsMode();
              setDraggingFromPanel('football');
            }}
          >
            ⚽
          </div>
          <div style={{ fontSize: '12px', color: '#000000', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Drag Football
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              exitScissorsMode();
              undoLast();
            }}
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease',
            }}
            title="Undo"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#000000';
              e.target.style.color = '#ffffff';
            }}
          >
            <FaUndo />
          </button>
          

          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              exitScissorsMode();
              clearAllItems();
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
            title="Clear All"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#000000';
              e.target.style.color = '#ffffff';
            }}
          >
            Clear All
          </button>
      </div>

        {/* Cursor and Delete Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              exitScissorsMode();
              setIsLineDrawingMode(false);
              setLineBarConfig(prev => ({ ...prev, mode: 'cursor' }));
            }}
            style={{
              width: 40,
              height: 40,
              backgroundColor: (lineBarConfig.mode === 'cursor' && !isDeleteMode) ? '#ffffff' : '#000000',
              color: (lineBarConfig.mode === 'cursor' && !isDeleteMode) ? '#000000' : '#ffffff',
              border: '2px solid #000000',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease',
            }}
            title="Cursor Mode"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = (lineBarConfig.mode === 'cursor' && !isDeleteMode) ? '#ffffff' : '#000000';
              e.target.style.color = (lineBarConfig.mode === 'cursor' && !isDeleteMode) ? '#000000' : '#ffffff';
            }}
          >
            👆
          </button>
          
          <button 
            onClick={() => {
              console.log('=== SCISSORS BUTTON CLICK ===');
              console.log('Current isDeleteMode:', isDeleteMode);
              console.log('Setting isDeleteMode to:', !isDeleteMode);
              setIsLineDrawingMode(false);
              setIsDeleteMode(!isDeleteMode);
              setLineBarConfig(prev => ({ ...prev, mode: 'cursor' }));
            }}
            style={{
              width: 40,
              height: 40,
              backgroundColor: isDeleteMode ? '#ff4444' : '#000000',
              color: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease',
            }}
            title="Scissors Tool"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDeleteMode ? '#cc3333' : '#ffffff';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = isDeleteMode ? '#ff4444' : '#000000';
              e.target.style.color = '#ffffff';
            }}
          >
            ✂️
          </button>
      </div>

      {/* Player Label Editor */}
      {editingPlayerId !== null && (
        <input
          autoFocus
            style={{ 
              marginTop: 10,
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          value={editingText}
          onChange={e => setEditingText(e.target.value)}
          onBlur={handleEditComplete}
          onKeyDown={e => e.key === 'Enter' && handleEditComplete()}
        />
      )}
    </div>
  </div>
);
};

export default RightPanel;
