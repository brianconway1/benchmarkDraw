import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Slider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  ToggleButton, 
  ToggleButtonGroup,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Camera, 
  Straighten, 
  ShowChart, 
  Gesture, 
  ArrowForward, 
  ArrowBack, 
  ArrowUpward,
  ArrowDownward,
  FormatColorFill,
  Settings,
  MouseOutlined,
  ArrowUpwardOutlined
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';

const BottomPanel = ({
  stageRef,
  lineBarConfig,
  setLineBarConfig,
  setDraggingFromPanel,
  ICON_SIZE,
  isLineDrawingMode,
  setIsLineDrawingMode,
  isDeleteMode,
  setIsDeleteMode,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('line');
  const colorPickerRef = useRef(null);

  // Exit scissors mode when any other button is clicked
  const exitScissorsMode = () => {
    if (isDeleteMode) {
      console.log('=== EXITING SCISSORS MODE (BOTTOM PANEL) ===');
      setIsDeleteMode(false);
    }
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);



  const dashPatterns = [
    { name: 'Solid', value: [] },
    { name: 'Dashed', value: [8, 8] },
    { name: 'Dotted', value: [2, 6] },
    { name: 'Dash-Dot', value: [16, 8, 4, 8] },
    { name: 'Long Dash', value: [20, 10] },
    { name: 'Double Dash', value: [12, 4, 4, 4] }
  ];

  const arrowPositions = [
    { name: 'None', value: { start: false, end: false } },
    { name: 'Start', value: { start: true, end: false } },
    { name: 'End', value: { start: false, end: true } },
    { name: 'Both', value: { start: true, end: true } }
  ];

  const lineModes = [
    { name: 'Straight', value: 'straight', icon: <Straighten /> },
    { name: 'Curved', value: 'curve', icon: <ShowChart /> },
    { name: 'Free Draw', value: 'free', icon: <Gesture /> }
  ];

  const handleScreenshot = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'pitch-screenshot.png';
    link.href = uri;
    link.click();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '24px 0',
        padding: '0 16px',
        position: 'relative'
      }}
    >
      <Card sx={{ 
        minWidth: 1200, 
        maxWidth: 1600,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        border: '2px solid #000000'
      }}>
        <CardContent sx={{ padding: '16px !important' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
        flexWrap: 'wrap',
              minHeight: '60px'
      }}
    >
      {/* Screenshot Button */}
      <Button
        variant="contained"
        startIcon={<Camera />}
        onClick={() => {
          exitScissorsMode();
          handleScreenshot();
        }}
                    sx={{
              background: '#000000',
              color: '#ffffff',
              border: '2px solid #000000',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              '&:hover': {
                background: '#ffffff',
                color: '#000000',
                border: '2px solid #000000',
              }
            }}
      >
        Screenshot
      </Button>





      {/* Line Tools Panel */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'nowrap', minWidth: 800 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100, justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 700, 
                color: '#000000', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                Line Drawer
              </Typography>
            </Box>

            {/* Line Type */}
            <ToggleButtonGroup
              value={lineBarConfig.mode}
              exclusive
              size="small"
              onChange={(e, value) => {
                if (value) {
                  exitScissorsMode();
                  setLineBarConfig(c => ({ 
                    ...c, 
                    mode: value,
                    // Disable arrow heads when free draw mode is selected
                    arrowStart: value === 'free' ? false : c.arrowStart,
                    arrowEnd: value === 'free' ? false : c.arrowEnd
                  }));
                }
              }}

              sx={{
                '& .MuiToggleButton-root': {
                  color: '#000000',
                  borderColor: '#000000',
                  backgroundColor: '#ffffff',
                  '&.Mui-selected': {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#000000',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  }
                }
              }}
            >
              {lineModes.map((mode) => (
                <Tooltip key={mode.value} title={mode.name} arrow>
                  <ToggleButton value={mode.value} size="small" sx={{ px: 1 }}>
                    {mode.icon}
                  </ToggleButton>
                </Tooltip>
              ))}
            </ToggleButtonGroup>

            {/* Color Picker */}
            <Box sx={{ position: 'relative' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  exitScissorsMode();
                  setShowColorPicker(!showColorPicker);
                }}
                sx={{
                  borderColor: '#000000',
                  color: '#000000',
                  minWidth: 40,
                  px: 1,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <FormatColorFill fontSize="small" />
              </Button>
            </Box>

            {/* Dash Pattern */}
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
          value={lineBarConfig.dash.join(',')}
                onChange={(e) => {
                  const dashValue = e.target.value ? e.target.value.split(',').map(Number) : [];
                  setLineBarConfig(c => ({ ...c, dash: dashValue }));
                }}
                displayEmpty
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#000000',
                    borderColor: '#000000',
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#000000',
                    },
                    '&:hover fieldset': {
                      borderColor: '#000000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000 !important',
                    },
                    '&.Mui-focused': {
                      borderColor: '#000000 !important',
                    }
                  },
                  '& .MuiSelect-icon': {
                    color: '#000000',
                  },
                  '& .MuiSelect-select': {
                    color: '#000000',
                    fontWeight: 600,
                  },
                  '& .Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000 !important',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                  }
                }}
              >
                {dashPatterns.map((pattern) => (
                  <MenuItem 
                    key={pattern.name} 
                    value={pattern.value.join(',')}
                    sx={{
                      color: '#000000',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        }
                      }
                    }}
                  >
                    {pattern.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Arrow Configuration */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Tooltip 
                title={lineBarConfig.mode === 'free' ? "Cannot add arrow heads in free draw mode" : ""}
                arrow
                open={lineBarConfig.mode === 'free' ? undefined : false}
              >
                <Select
                  value={`${lineBarConfig.arrowStart}-${lineBarConfig.arrowEnd}`}
                  onChange={(e) => {
                    if (lineBarConfig.mode === 'free') {
                      return; // Prevent changes in free draw mode
                    }
            const [start, end] = e.target.value.split('-').map(v => v === 'true');
            setLineBarConfig(c => ({ ...c, arrowStart: start, arrowEnd: end }));
          }}
                  disabled={lineBarConfig.mode === 'free'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: lineBarConfig.mode === 'free' ? '#999999' : '#000000',
                      borderColor: lineBarConfig.mode === 'free' ? '#cccccc' : '#000000',
                      backgroundColor: lineBarConfig.mode === 'free' ? '#f5f5f5' : '#ffffff',
                      '& fieldset': {
                        borderColor: lineBarConfig.mode === 'free' ? '#cccccc' : '#000000',
                      },
                      '&:hover fieldset': {
                        borderColor: lineBarConfig.mode === 'free' ? '#cccccc' : '#000000',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: lineBarConfig.mode === 'free' ? '#cccccc !important' : '#000000 !important',
                      },
                      '&.Mui-focused': {
                        borderColor: lineBarConfig.mode === 'free' ? '#cccccc !important' : '#000000 !important',
                      }
                    },
                    '& .MuiSelect-icon': {
                      color: lineBarConfig.mode === 'free' ? '#999999' : '#000000',
                    },
                    '& .MuiSelect-select': {
                      color: lineBarConfig.mode === 'free' ? '#999999' : '#000000',
                      fontWeight: 600,
                    },
                    '& .Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: lineBarConfig.mode === 'free' ? '#cccccc !important' : '#000000 !important',
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: lineBarConfig.mode === 'free' ? '#cccccc' : '#000000',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: lineBarConfig.mode === 'free' ? '#cccccc !important' : '#000000 !important',
                    }
                  }}
                >
                  {arrowPositions.map((position) => (
                    <MenuItem 
                      key={position.name} 
                      value={`${position.value.start}-${position.value.end}`}
                      sx={{
                        color: '#000000',
                        backgroundColor: '#ffffff',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          }
                        }
                      }}
                    >
                      {position.name}
                    </MenuItem>
                  ))}
                </Select>
              </Tooltip>
            </FormControl>

            {/* Thickness Slider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: '#000000', fontSize: '0.7rem', whiteSpace: 'nowrap', fontWeight: 600, textTransform: 'uppercase' }}>
                Width
              </Typography>
              <Slider
                value={lineBarConfig.thickness}
                onChange={(e, value) => setLineBarConfig(c => ({ ...c, thickness: value }))}
                min={1}
                max={10}
                step={1}
                size="small"
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#000000',
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#000000',
                    height: 2,
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#cccccc',
                    height: 2,
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: '#000000', fontSize: '0.7rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {lineBarConfig.thickness}px
              </Typography>
            </Box>

            {/* Line Preview */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 130 }}>
                              <Box
                  sx={{
                    width: 120,
                    height: 32,
                    border: 1,
                    borderColor: '#000000',
                    borderRadius: 1,
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
        >
                <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                  {/* Main line without arrows */}
                  {lineBarConfig.mode === 'straight' && (
            <line
                      x1={lineBarConfig.arrowStart ? 10 + lineBarConfig.thickness * 3 : 10}
                      y1="16"
                      x2={lineBarConfig.arrowEnd ? 110 - lineBarConfig.thickness * 3 : 110}
                      y2="16"
              stroke={lineBarConfig.color}
              strokeWidth={lineBarConfig.thickness}
              strokeDasharray={lineBarConfig.dash.join(' ')}
            />
                  )}
                  
                  {lineBarConfig.mode === 'curve' && (
                    <path
                      d={`M ${lineBarConfig.arrowStart ? 10 + lineBarConfig.thickness * 3 : 10} 16 Q 60 8 ${lineBarConfig.arrowEnd ? 110 - lineBarConfig.thickness * 3 : 110} 16`}
                      stroke={lineBarConfig.color}
                      strokeWidth={lineBarConfig.thickness}
                      strokeDasharray={lineBarConfig.dash.join(' ')}
                      fill="none"
                    />
                  )}
                  
                  {lineBarConfig.mode === 'free' && (
                    <path
                      d={`M ${lineBarConfig.arrowStart ? 10 + lineBarConfig.thickness * 3 : 10} 16 Q 25 8 45 16 Q 60 24 75 16 Q 90 8 ${lineBarConfig.arrowEnd ? 110 - lineBarConfig.thickness * 3 : 110} 16`}
                      stroke={lineBarConfig.color}
                      strokeWidth={lineBarConfig.thickness}
                      strokeDasharray={lineBarConfig.dash.join(' ')}
                      fill="none"
                    />
                  )}
                  
                  {/* Arrow heads using the same approach as Konva Arrow component - only for straight and curved lines */}
                  {lineBarConfig.mode !== 'free' && lineBarConfig.arrowStart && (
                <polygon
                      points={`${10 + lineBarConfig.thickness * 3},${16 - lineBarConfig.thickness} ${10 + lineBarConfig.thickness * 3},${16 + lineBarConfig.thickness} 10,16`}
                  fill={lineBarConfig.color}
                />
                  )}
                  
                  {lineBarConfig.mode !== 'free' && lineBarConfig.arrowEnd && (
                <polygon
                      points={`${110 - lineBarConfig.thickness * 3},${16 - lineBarConfig.thickness} ${110 - lineBarConfig.thickness * 3},${16 + lineBarConfig.thickness} 110,16`}
                  fill={lineBarConfig.color}
                />
                  )}
          </svg>
              </Box>
              <Typography variant="caption" sx={{ color: '#000000', fontStyle: 'italic', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {lineBarConfig.mode === 'straight' ? 'Straight' : lineBarConfig.mode === 'curve' ? 'Curved' : 'Free Draw'}
              </Typography>
            </Box>
          </Box>
      
      {/* Color Picker - positioned outside the card */}
      {showColorPicker && (
        <Box
          ref={colorPickerRef}
          sx={{
            position: 'absolute',
            top: '-200px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            border: 1,
            borderColor: 'divider'
          }}
        >
          <HexColorPicker
            color={lineBarConfig.color}
            onChange={(color) => setLineBarConfig(c => ({ ...c, color }))}
            style={{ width: 150, height: 150 }}
          />
        </Box>
      )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BottomPanel;
