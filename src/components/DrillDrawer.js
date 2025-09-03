// DrillDrawer.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group, Rect, Arrow, Line, Transformer } from 'react-konva';
import useImage from 'use-image';
import { FaUndo } from 'react-icons/fa';
import { RegularPolygon } from 'react-konva';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import BottomPanel from './BottomPanel';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Responsive constants
const getResponsiveConstants = () => {
  const isMobile = isMobileDevice() || window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
  const isSmallMobile = window.innerWidth <= 480;
  
  return {
    ICON_SIZE: isMobile ? (isSmallMobile ? 22 : 25) : 30,
    SIDE_PANEL_WIDTH: isMobile ? (isSmallMobile ? 60 : 80) : isTablet ? 120 : 150,
    isMobile,
    isTablet,
    isSmallMobile
  };
};

// Export ICON_SIZE for other components
export const ICON_SIZE = 30;

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

const DrillDrawer = ({ isMobile: propIsMobile, isTablet: propIsTablet, isSmallMobile: propIsSmallMobile }) => {
  const [responsiveConstants, setResponsiveConstants] = useState(getResponsiveConstants());
  const stageRef = useRef();

  // Use props if provided, otherwise fall back to local state
  // Ensure we have default values to prevent uninitialized variable errors
  const isMobile = propIsMobile !== undefined ? propIsMobile : responsiveConstants.isMobile;
  const isTablet = propIsTablet !== undefined ? propIsTablet : responsiveConstants.isTablet;
  const isSmallMobile = propIsSmallMobile !== undefined ? propIsSmallMobile : responsiveConstants.isSmallMobile;

  // State declarations - moved to top to prevent uninitialized variable errors
  const [showMobileIcons, setShowMobileIcons] = useState(false);
  const [showMobileLines, setShowMobileLines] = useState(false);
  const [showMobileField, setShowMobileField] = useState(false);
  const [coneSize, setConeSize] = useState('medium');
  const [coneColor, setConeColor] = useState('orange');
  const [background, setBackground] = useState('/watermarked_pitch_full.png');
  const [imageObj, setImageObj] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [cones, setCones] = useState([]);
  const [players, setPlayers] = useState([]);
  const [footballs, setFootballs] = useState([]);
  const [lines, setLines] = useState([]);
  const [labelModeTeam1, setLabelModeTeam1] = useState('plain');
  const [nextNumberTeam1, setNextNumberTeam1] = useState(1);
  const [nextLetterTeam1, setNextLetterTeam1] = useState('A');
  const [nextPlayerNumberTeam1, setNextPlayerNumberTeam1] = useState(1);
  const [playerColorTeam1, setPlayerColorTeam1] = useState('#2563eb');
  const [playerStyleTeam1, setPlayerStyleTeam1] = useState('solid');
  const [playerStripeColorTeam1, setPlayerStripeColorTeam1] = useState('white');
  const [playerLabelTypeTeam1, setPlayerLabelTypeTeam1] = useState('number');
  const [playerCustomTextTeam1, setPlayerCustomTextTeam1] = useState('');
  const [labelModeTeam2, setLabelModeTeam2] = useState('plain');
  const [nextNumberTeam2, setNextNumberTeam2] = useState(1);
  const [nextLetterTeam2, setNextLetterTeam2] = useState('A');
  const [nextPlayerNumberTeam2, setNextPlayerNumberTeam2] = useState(1);
  const [playerColorTeam2, setPlayerColorTeam2] = useState('#dc2626');
  const [playerStyleTeam2, setPlayerStyleTeam2] = useState('solid');
  const [playerStripeColorTeam2, setPlayerStripeColorTeam2] = useState('white');
  const [playerLabelTypeTeam2, setPlayerLabelTypeTeam2] = useState('number');
  const [playerCustomTextTeam2, setPlayerCustomTextTeam2] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingConeId, setEditingConeId] = useState(null);
  const [editingFootballId, setEditingFootballId] = useState(null);
  const [editingLineId, setEditingLineId] = useState(null);
  const [draggingFromPanel, setDraggingFromPanel] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [htmlDragPos, setHtmlDragPos] = useState(null);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [lineBarConfig, setLineBarConfig] = useState({
    mode: 'cursor',
    color: '#2563eb',
    thickness: 4,
    dash: [],
    arrowStart: false,
    arrowEnd: true,
  });
  const [drawingLine, setDrawingLine] = useState(null);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLineDrawingMode, setIsLineDrawingMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Alignment guides state
  const [alignmentGuides, setAlignmentGuides] = useState({
    horizontal: null,
    vertical: null,
    snapPosition: null
  });
  const [snapDistance] = useState(15); // pixels

  // Update responsive constants on window resize
  useEffect(() => {
    const handleResize = () => {
      setResponsiveConstants(getResponsiveConstants());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && (showMobileIcons || showMobileLines || showMobileField) && 
          !event.target.closest('.mobile-icons-menu') && 
          !event.target.closest('.mobile-lines-menu') && 
          !event.target.closest('.mobile-field-menu') && 
          !event.target.closest('.mobile-floating-button')) {
        setShowMobileIcons(false);
        setShowMobileLines(false);
        setShowMobileField(false);
      }
    };

    const handleTouchOutside = (event) => {
      if (isMobile && (showMobileIcons || showMobileLines || showMobileField) && 
          !event.target.closest('.mobile-icons-menu') && 
          !event.target.closest('.mobile-lines-menu') && 
          !event.target.closest('.mobile-field-menu') && 
          !event.target.closest('.mobile-floating-button')) {
        setShowMobileIcons(false);
        setShowMobileLines(false);
        setShowMobileField(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [isMobile, showMobileIcons, showMobileLines, showMobileField]);

  // Prevent default touch behaviors on mobile
  useEffect(() => {
    if (isMobile) {
      const preventDefaultTouch = (e) => {
        // Only prevent default for our custom touch areas
        if (e.target.closest('.mobile-toolbar') || e.target.closest('.mobile-settings-panel')) {
          e.preventDefault();
        }
      };

      // Prevent zoom and other unwanted touch behaviors
      const preventZoom = (e) => {
        if (e.touches && e.touches.length > 1) {
          e.preventDefault();
        }
      };

      // Safe event listener addition
      try {
        document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
        document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
        document.addEventListener('gesturestart', preventZoom, { passive: false });
        document.addEventListener('gesturechange', preventZoom, { passive: false });
      } catch (error) {
        console.log('Touch event listeners not supported:', error.message);
      }

      return () => {
        try {
          document.removeEventListener('touchstart', preventDefaultTouch);
          document.removeEventListener('touchmove', preventDefaultTouch);
          document.removeEventListener('gesturestart', preventZoom);
          document.removeEventListener('gesturechange', preventZoom);
        } catch (error) {
          console.log('Touch event cleanup error:', error.message);
        }
      };
    }
  }, [isMobile]);

  // Optimize mobile performance
  useEffect(() => {
    if (isMobile && stageRef.current) {
      // Reduce animation complexity on mobile
      document.body.style.setProperty('--mobile-animation-duration', '0.15s');
      
      // Optimize canvas rendering for mobile - with proper null checks
      try {
        const stage = stageRef.current;
        if (stage && stage.getLayer && stage.getLayer()) {
          const layer = stage.getLayer();
          if (layer && layer.getCanvas && layer.getCanvas()) {
            const canvas = layer.getCanvas();
            if (canvas && canvas._canvas) {
              canvas._canvas.style.touchAction = 'none';
            }
          }
        }
      } catch (error) {
        // Silently handle any canvas access errors
        console.log('Canvas optimization skipped:', error.message);
      }
    }
  }, [isMobile, stageRef.current]);

  // Separate useEffect for stage optimization that runs after stage is mounted
  useEffect(() => {
    if (isMobile) {
      // Wait a bit for the stage to be fully mounted
      const timer = setTimeout(() => {
        if (stageRef.current) {
          try {
            const stage = stageRef.current;
            if (stage && stage.getLayer && stage.getLayer()) {
              const layer = stage.getLayer();
              if (layer && layer.getCanvas && layer.getCanvas()) {
                const canvas = layer.getCanvas();
                if (canvas && canvas._canvas) {
                  canvas._canvas.style.touchAction = 'none';
                  // Additional mobile optimizations
                  canvas._canvas.style.webkitUserSelect = 'none';
                  canvas._canvas.style.userSelect = 'none';
                }
              }
            }
          } catch (error) {
            // Silently handle any canvas access errors
            console.log('Stage optimization skipped:', error.message);
          }
        }
      }, 100); // Small delay to ensure stage is ready

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const { ICON_SIZE, SIDE_PANEL_WIDTH } = responsiveConstants;
  
  // Debug logging for mobile detection
  console.log('Mobile Detection:', {
    isMobile,
    isTablet,
    isSmallMobile,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    userAgent: navigator.userAgent,
    isMobileDevice: isMobileDevice()
  });

  // Enable mobile scrolling
  useEffect(() => {
    if (isMobile) {
      // Ensure body and html allow scrolling
      document.body.style.overflow = 'auto';
      document.body.style.WebkitOverflowScrolling = 'touch';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.WebkitOverflowScrolling = 'touch';
      
      return () => {
        // Reset on cleanup
        document.body.style.overflow = '';
        document.body.style.WebkitOverflowScrolling = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.WebkitOverflowScrolling = '';
      };
    }
  }, [isMobile]);

  // Monitor scrolling behavior
  useEffect(() => {
    if (isMobile) {
      const container = document.querySelector('.drill-drawer-container');
      if (container) {
        const handleScroll = (e) => {
          console.log('Scroll event:', {
            scrollTop: container.scrollTop,
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            canScrollUp: container.scrollTop > 0,
            canScrollDown: container.scrollTop < (container.scrollHeight - container.clientHeight)
          });
        };
        
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, [isMobile]);

  const coneSizeToRadius = {
    small: 10,
    medium: 15,
    large: 20,
  };

  // Helper for unique IDs
  const getId = () => Math.floor(Date.now() + Math.random() * 1000);

  const [image] = useImage(background, background);

  // Keyboard event handler for delete functionality
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedItems.size > 0) {
          event.preventDefault();
          deleteSelectedItems();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItems]);

  useEffect(() => {
    if (image) {
      setImageObj(image);
      // Responsive dimensions based on screen size
      const MAX_WIDTH = isMobile ? window.innerWidth - 20 : isTablet ? 800 : 1100;
      const MAX_HEIGHT = isMobile ? window.innerHeight - 100 : isTablet ? 600 : 700;
      const screenWidth = Math.min(window.innerWidth - SIDE_PANEL_WIDTH * 2 - (isMobile ? 10 : 20), MAX_WIDTH);
      const screenHeight = Math.min(window.innerHeight - (isMobile ? 100 : 300), MAX_HEIGHT);
      
      // Calculate scale to fit image within Stage dimensions
      const stageWidth = isMobile ? (isSmallMobile ? Math.min(window.innerWidth - 10, 600) : Math.min(window.innerWidth - 20, 700)) : Math.min(window.innerWidth - SIDE_PANEL_WIDTH * 2 - 8, 1100);
      const stageHeight = isMobile ? (window.innerWidth > window.innerHeight ? Math.min(window.innerHeight - 40, 500) : window.innerHeight - 150) : Math.min(window.innerHeight, 700);
      
      const widthRatio = stageWidth / image.width;
      const heightRatio = stageHeight / image.height;
      const scaleFactor = Math.min(widthRatio, heightRatio, 1); // never upscale
      setScale(scaleFactor);
      
      // Center the image in the Stage
      const offsetX = (stageWidth - image.width * scaleFactor) / 2;
      const offsetY = isMobile ? (window.innerWidth > window.innerHeight ? 5 : 20) : (stageHeight - image.height * scaleFactor) / 2; // Adjust for orientation
      setOffset({ x: offsetX, y: offsetY });
    }
  }, [image, SIDE_PANEL_WIDTH, isMobile, isTablet, isSmallMobile]);

  const pushHistory = () => {
    setHistory([...history, { cones, players, footballs, lines }]);
  };

  const undoLast = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCones(prev.cones);
    setPlayers(prev.players);
    setFootballs(prev.footballs || []);
    setLines(prev.lines || []);
    setHistory(history.slice(0, -1));
  };

  const deleteSelectedItems = () => {
    if (selectedItems.size === 0) return;
    
    pushHistory();
    
    // Delete selected players
    const selectedPlayerIds = Array.from(selectedItems)
      .filter(id => id.startsWith('player-'))
      .map(id => parseInt(id.replace('player-', '')));
    
    // Delete selected cones
    const selectedConeIndices = Array.from(selectedItems)
      .filter(id => id.startsWith('cone-'))
      .map(id => parseInt(id.replace('cone-', '')));
    
    // Delete selected footballs
    const selectedFootballIds = Array.from(selectedItems)
      .filter(id => id.startsWith('football-'))
      .map(id => parseInt(id.replace('football-', '')));
    
    // Delete selected lines
    const selectedLineIds = Array.from(selectedItems)
      .filter(id => id.startsWith('line-'))
      .map(id => parseInt(id.replace('line-', '')));
    
    console.log('=== DELETE DEBUG ===');
    console.log('Selected items:', Array.from(selectedItems));
    console.log('Selected line IDs:', selectedLineIds);
    console.log('Current lines before deletion:', lines);
    
    // Update state
    setPlayers(players => players.filter(p => !selectedPlayerIds.includes(p.id)));
    setCones(cones => cones.filter((_, i) => !selectedConeIndices.includes(i)));
    setFootballs(footballs => footballs.filter(f => !selectedFootballIds.includes(f.id)));
    setLines(lines => {
      console.log('Filtering out line IDs:', selectedLineIds);
      const filteredLines = lines.filter(l => !selectedLineIds.includes(l.id));
      console.log('Filtered lines:', filteredLines);
      console.log('=== END DELETE DEBUG ===');
      return filteredLines;
    });
    
    // Clear selection
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const deleteItemAtPosition = (x, y) => {
    if (!isDeleteMode) return;
    
    pushHistory();
    
    // Check for players
    const playerToDelete = players.find(player => {
      const distance = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
      return distance < 25; // Player radius tolerance
    });
    
    if (playerToDelete) {
      setPlayers(players => players.filter(p => p.id !== playerToDelete.id));
      return;
    }
    
    // Check for cones
    const coneToDelete = cones.find((cone, index) => {
      const distance = Math.sqrt((cone.x - x) ** 2 + (cone.y - y) ** 2);
      return distance < 20; // Cone radius tolerance
    });
    
    if (coneToDelete) {
      const coneIndex = cones.findIndex(cone => cone.x === coneToDelete.x && cone.y === coneToDelete.y);
      setCones(cones => cones.filter((_, i) => i !== coneIndex));
      return;
    }
    
    // Check for footballs
    const footballToDelete = footballs.find(football => {
      const distance = Math.sqrt((football.x - x) ** 2 + (football.y - y) ** 2);
      return distance < 20; // Football radius tolerance
    });
    
    if (footballToDelete) {
      setFootballs(footballs => footballs.filter(f => f.id !== footballToDelete.id));
      return;
    }
    
    // Check for lines
    const lineToDelete = lines.find(line => {
      // Check if any point in the line is close to the click
      for (let i = 0; i < line.points.length; i += 2) {
        const lineX = line.points[i];
        const lineY = line.points[i + 1];
        const distance = Math.sqrt((lineX - x) ** 2 + (lineY - y) ** 2);
        if (distance < 20) { // 20px tolerance
          return true;
        }
      }
      return false;
    });
    
    if (lineToDelete) {
      setLines(lines => lines.filter(l => l.id !== lineToDelete.id));
      return;
    }
  };

  const clearAllItems = () => {
    if (players.length === 0 && cones.length === 0 && footballs.length === 0 && lines.length === 0) return;
    
    pushHistory();
    
    setPlayers([]);
    setCones([]);
    setFootballs([]);
    setLines([]);
    setSelectedItems(new Set());
    
    // Reset player auto-numbering to 1 for both teams
    setNextPlayerNumberTeam1(1);
    setNextPlayerNumberTeam2(1);
  };

  const handleItemSelect = (itemId, isMultiSelect) => {
    console.log('=== SELECTION DEBUG ===');
    console.log('Item ID:', itemId);
    console.log('Is multi-select:', isMultiSelect);
    console.log('Is selection mode:', isSelectionMode);
    
    if (isMultiSelect) {
      // Ctrl/Cmd + click = add to selection (regardless of selection mode)
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        console.log('Updated selection (multi-select):', Array.from(newSet));
        return newSet;
      });
    } else {
      // Single click - clear previous selection and select this item
      setSelectedItems(new Set([itemId]));
      console.log('Updated selection (single):', [itemId]);
    }
  };

  const handleItemClick = (itemId, e) => {
    console.log('=== ITEM CLICK DEBUG ===');
    console.log('Item clicked:', itemId);
    console.log('Is delete mode:', isDeleteMode);
    console.log('Event:', e);
    
    // Handle delete mode first
    if (isDeleteMode) {
      console.log('=== SINGLE CLICK DELETE MODE ===');
      console.log('Item clicked for deletion:', itemId);
      
      pushHistory();
      
      // Extract the item type and ID from the itemId
      if (itemId.startsWith('player-')) {
        const playerId = parseFloat(itemId.replace('player-', ''));
        setPlayers(players => players.filter(p => p.id !== playerId));
        console.log('Deleted player with ID:', playerId);
      } else if (itemId.startsWith('cone-')) {
        const coneIndex = parseInt(itemId.replace('cone-', ''));
        setCones(cones => cones.filter((_, i) => i !== coneIndex));
        console.log('Deleted cone at index:', coneIndex);
      } else if (itemId.startsWith('football-')) {
        const footballId = parseFloat(itemId.replace('football-', ''));
        console.log('=== FOOTBALL DELETE DEBUG ===');
        console.log('Item ID:', itemId);
        console.log('Parsed football ID:', footballId);
        console.log('Current footballs:', footballs);
        setFootballs(footballs => {
          const filtered = footballs.filter(f => f.id !== footballId);
          console.log('Filtered footballs:', filtered);
          return filtered;
        });
        console.log('Deleted football with ID:', footballId);
      } else if (itemId.startsWith('line-')) {
        const lineId = parseFloat(itemId.replace('line-', ''));
        setLines(lines => lines.filter(l => l.id !== lineId));
        console.log('Deleted line with ID:', lineId);
      }
      
      return;
    }
    
    // Only treat as multi-select if Ctrl/Cmd key is pressed
    const shouldMultiSelect = (e?.evt?.ctrlKey) || (e?.evt?.metaKey);
    console.log('=== CLICK DEBUG ===');
    console.log('Item clicked:', itemId);
    console.log('Ctrl key pressed:', e?.evt?.ctrlKey);
    console.log('Meta key pressed:', e?.evt?.metaKey);
    console.log('Should multi-select:', shouldMultiSelect);
    handleItemSelect(itemId, shouldMultiSelect);
  };

  const getNextLabel = (team) => {
    if (team === 'team1') {
      if (labelModeTeam1 === 'number') return String(nextNumberTeam1);
      if (labelModeTeam1 === 'letter') return nextLetterTeam1;
      return '';
    }
    if (labelModeTeam2 === 'number') return String(nextNumberTeam2);
    if (labelModeTeam2 === 'letter') return nextLetterTeam2;
    return '';
  };

  const incrementLabel = (team) => {
    if (team === 'team1') {
      if (labelModeTeam1 === 'number') setNextNumberTeam1(nextNumberTeam1 + 1);
      if (labelModeTeam1 === 'letter') setNextLetterTeam1(String.fromCharCode(nextLetterTeam1.charCodeAt(0) + 1));
    } else {
      if (labelModeTeam2 === 'number') setNextNumberTeam2(nextNumberTeam2 + 1);
      if (labelModeTeam2 === 'letter') setNextLetterTeam2(String.fromCharCode(nextLetterTeam2.charCodeAt(0) + 1));
    }
  };

            const handleStageClick = (e) => {
    // Exit any editing mode when clicking outside
    if (editingPlayerId !== null || editingConeId !== null || editingFootballId !== null || editingLineId !== null) {
      setEditingPlayerId(null);
      setEditingConeId(null);
      setEditingFootballId(null);
      setEditingLineId(null);
      setEditingText('');
      return;
    }

    // Safety check for stage
    if (!e || !e.target) return;

    const clickedOnEmpty = 
      e.target === e.target.getStage() ||
      e.target.getClassName?.() === 'Image';

    if (clickedOnEmpty) {
      // Handle delete mode
      if (isDeleteMode) {
        try {
          const stage = e.target.getStage();
          if (stage && stage.getPointerPosition) {
            const pointer = stage.getPointerPosition();
            if (pointer) {
              const canvasX = (pointer.x - offset.x) / scale;
              const canvasY = (pointer.y - offset.y) / scale;
              deleteItemAtPosition(canvasX, canvasY);
            }
          }
        } catch (error) {
          console.log('Delete mode error:', error.message);
        }
        return;
      }
        
        setSelectedId(null);
        setSelectedLineId(null);
        setSelectedItems(new Set()); // Clear multi-selection
        setIsSelectionMode(false); // Exit selection mode
    }
  };

  const handleDropPlayerOnStage = (pos, team) => {
    pushHistory();
    const label = getNextLabel(team);
    incrementLabel(team);
    // Calculate position based on device type
    let canvasX, canvasY;
    if (isMobile) {
      // On mobile, the panel is above the field, so no x-offset needed
      canvasX = (pos.x - offset.x - ICON_SIZE / 2) / scale;
      canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    } else {
      // On desktop, the right panel is on the left side, so no SIDE_PANEL_WIDTH subtraction needed
      canvasX = (pos.x - offset.x - ICON_SIZE / 2) / scale;
      canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    }
    
    // Apply alignment guides and snapping
    const snapped = applySnapping(canvasX, canvasY);
    canvasX = snapped.x;
    canvasY = snapped.y;
    
    const color = team === 'team1' ? playerColorTeam1 : playerColorTeam2;
    const style = team === 'team1' ? playerStyleTeam1 : playerStyleTeam2;
    const stripeColor = team === 'team1' ? playerStripeColorTeam1 : playerStripeColorTeam2;
    const labelType = team === 'team1' ? playerLabelTypeTeam1 : playerLabelTypeTeam2;
    const customText = team === 'team1' ? playerCustomTextTeam1 : playerCustomTextTeam2;
    
    // Generate the appropriate label based on type
    let playerLabel = '';
    if (labelType === 'number') {
      playerLabel = team === 'team1' ? nextPlayerNumberTeam1.toString() : nextPlayerNumberTeam2.toString();
      // Increment the number for next player
      if (team === 'team1') {
        setNextPlayerNumberTeam1(prev => prev + 1);
      } else {
        setNextPlayerNumberTeam2(prev => prev + 1);
      }
    } else if (labelType === 'text') {
      playerLabel = customText;
    }
    
    setPlayers([...players, { 
      id: Date.now(), 
      x: canvasX, 
      y: canvasY, 
      label, 
      color, 
      style, 
      stripeColor, 
      playerLabel 
    }]);
  };

  const handleDeleteSelected = () => {
    deleteSelectedItems();
  };
  
const handleDragPlayer = (id, pos) => {
  setPlayers(players.map(p => 
    p.id === id 
      ? { ...p, x: pos.x, y: pos.y } 
      : p
  ));
};

const handleDragCone = (index, pos) => {
  setCones(cones.map((c, i) =>
    i === index
      ? { ...c, x: pos.x, y: pos.y }
      : c
  ));
};

  const handleEditPlayer = (id, label) => {
    setEditingPlayerId(id);
    setEditingText(label);
  };

  const handleDoubleClickPlayer = (id, label, e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    // Handle delete mode
    if (isDeleteMode) {
      console.log('=== DOUBLE CLICK DELETE PLAYER ===');
      console.log('Deleting player with ID:', id);
      pushHistory();
      setPlayers(players => players.filter(p => p.id !== id));
      return;
    }
    
    setIsSelectionMode(true);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(`player-${id}`);
      return newSet;
    });
  };

  const handleDoubleClickCone = (index, cone, e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    // Handle delete mode
    if (isDeleteMode) {
      console.log('=== DOUBLE CLICK DELETE CONE ===');
      console.log('Deleting cone at index:', index);
      pushHistory();
      setCones(cones => cones.filter((_, i) => i !== index));
      return;
    }
    
    setIsSelectionMode(true);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(`cone-${index}`);
      return newSet;
    });
  };

  const handleDoubleClickFootball = (id, football, e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    // Handle delete mode
    if (isDeleteMode) {
      console.log('=== DOUBLE CLICK DELETE FOOTBALL ===');
      console.log('Deleting football with ID:', id);
      console.log('Current footballs:', footballs);
      pushHistory();
      setFootballs(footballs => {
        const filtered = footballs.filter(f => f.id !== id);
        console.log('Filtered footballs:', filtered);
        return filtered;
      });
      return;
    }
    
    setIsSelectionMode(true);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(`football-${id}`);
      return newSet;
    });
  };

  const handleDoubleClickLine = (id, e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    // Handle delete mode
    if (isDeleteMode) {
      console.log('=== DOUBLE CLICK DELETE LINE ===');
      console.log('Deleting line with ID:', id);
      pushHistory();
      setLines(lines => lines.filter(l => l.id !== id));
      return;
    }
    
    setSelectedLineId(id);
    setIsSelectionMode(true);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(`line-${id}`);
      return newSet;
    });
    console.log('=== LINE SELECTION DEBUG ===');
    console.log('Double-clicked line ID:', id);
    console.log('Added line to selection');
  };



  const handleEditComplete = () => {
    if (editingPlayerId) {
      setPlayers(players.map(p => p.id === editingPlayerId ? { ...p, label: editingText } : p));
      setEditingPlayerId(null);
    } else if (editingConeId !== null) {
      // For cones, we can edit color and size
      setEditingConeId(null);
    } else if (editingFootballId) {
      // For footballs, we can edit position
      setEditingFootballId(null);
    } else if (editingLineId) {
      // For lines, we can edit shape and properties
      setEditingLineId(null);
    }
    setEditingText('');
  };

  // Alignment guides helper functions
  const getAllObjects = () => {
    return [
      ...cones.map(cone => ({ ...cone, type: 'cone' })),
      ...players.map(player => ({ ...player, type: 'player' })),
      ...footballs.map(football => ({ ...football, type: 'football' }))
    ];
  };

  const findAlignmentGuides = (currentX, currentY) => {
    const objects = getAllObjects();
    const guides = { horizontal: null, vertical: null, snapPosition: null };
    
    // Check for horizontal alignment (same Y coordinate)
    for (const obj of objects) {
      if (Math.abs(obj.y - currentY) <= snapDistance) {
        guides.horizontal = obj.y;
        break;
      }
    }
    
    // Check for vertical alignment (same X coordinate)
    for (const obj of objects) {
      if (Math.abs(obj.x - currentX) <= snapDistance) {
        guides.vertical = obj.x;
        break;
      }
    }
    
    // Check for exact position snap
    for (const obj of objects) {
      if (Math.abs(obj.x - currentX) <= snapDistance && Math.abs(obj.y - currentY) <= snapDistance) {
        guides.snapPosition = { x: obj.x, y: obj.y };
        break;
      }
    }
    
    return guides;
  };

  const applySnapping = (x, y) => {
    const guides = findAlignmentGuides(x, y);
    let snappedX = x;
    let snappedY = y;
    
    // Grid-based snapping (10 pixel grid)
    const gridSize = 10;
    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;
    
    // Check if we're close to grid points
    const gridSnapDistance = 8; // Smaller distance for grid snapping
    const isNearGridX = Math.abs(x - gridX) <= gridSnapDistance;
    const isNearGridY = Math.abs(y - gridY) <= gridSnapDistance;
    
    // Apply horizontal snapping (object alignment takes precedence over grid)
    if (guides.horizontal !== null) {
      snappedY = guides.horizontal;
    } else if (isNearGridY) {
      snappedY = gridY;
    }
    
    // Apply vertical snapping (object alignment takes precedence over grid)
    if (guides.vertical !== null) {
      snappedX = guides.vertical;
    } else if (isNearGridX) {
      snappedX = gridX;
    }
    
    // Apply exact position snapping (takes highest precedence)
    if (guides.snapPosition !== null) {
      snappedX = guides.snapPosition.x;
      snappedY = guides.snapPosition.y;
    }
    
    return { x: snappedX, y: snappedY, guides };
  };

  // Konva drag event handlers for in-canvas items
  const handleDragStartPlayer = (player) => (e) => {
    setDraggedItem({ type: 'player', id: player.id, color: player.color, label: player.label });
    setShowHtmlPreview(false);
  };
  const handleDragStartCone = (cone, i) => (e) => {
    setDraggedItem({ type: 'cone', index: i, color: cone.color, size: cone.size });
    setShowHtmlPreview(false);
  };
  const handleDragStartFootball = (football) => (e) => {
  setDraggedItem({ type: 'football', id: football.id });
  setShowHtmlPreview(false);
};


  // On drag move, check if pointer is outside canvas
  const handleDragMove = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const containerRect = stage.container().getBoundingClientRect();
    if (
      pointer.x < 0 || pointer.y < 0 ||
      pointer.x > stage.width() || pointer.y > stage.height()
    ) {
      // Outside canvas: show HTML preview
      setShowHtmlPreview(true);
      setHtmlDragPos({
        x: e.evt.clientX,
        y: e.evt.clientY
      });
    } else {
      // Inside canvas: hide HTML preview
      setShowHtmlPreview(false);
    }
  };

  // On drag end, always hide HTML preview
const handleDragEndPlayer = useCallback((id, e) => {
  setShowHtmlPreview(false);
  setDraggedItem(null);

  const stage = e.target?.getStage?.();
  const pos = stage?.getPointerPosition?.();

  if (!stage || !pos) return;

  setPlayers(players =>
    players.map(p =>
      p.id === id ? { ...p, x: e.target.x(), y: e.target.y() } : p
    )
  );
}, []);


const handleDragEndCone = useCallback((index, e) => {
  setShowHtmlPreview(false);
  setDraggedItem(null);

  // ✅ Safety check for e and target
  const target = e?.target;
  const stage = target?.getStage?.();
  const pos = stage?.getPointerPosition?.();
  if (!target || !stage || !pos) return;

  setCones(cones =>
    cones.map((c, i) =>
      i === index ? { ...c, x: target.x(), y: target.y() } : c
    )
  );
}, []);

const handleDragEndFootball = useCallback((id, e) => {
  setShowHtmlPreview(false);
  setDraggedItem(null);

  const stage = e.target?.getStage?.();
  const pos = stage?.getPointerPosition?.();

  if (!stage || !pos) return;

  setFootballs(fbs =>
    fbs.map(f =>
      f.id === id ? { ...f, x: e.target.x(), y: e.target.y() } : f
    )
  );
}, []);


  // Listen for mousemove globally to update HTML preview position
  useEffect(() => {
    if (!showHtmlPreview) return;
    const move = (e) => setHtmlDragPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [showHtmlPreview]);

  // Screenshot and Recording Bar Component
  function ScreenshotAndRecordBar({ stageRef }) {
    // Only screenshot functionality remains
    const handleScreenshot = () => {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'pitch-screenshot.png';
      link.href = uri;
      link.click();
  };

  return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '24px 0' }}>
        <button
          onClick={handleScreenshot}
          style={{
            padding: '10px 24px',
            fontSize: '1rem',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'background 0.2s',
          }}
        >
          �� Screenshot
        </button>
      </div>
    );
  }

  // Memoized Player and Cone components
// Memoized Player and Cone components
const MemoPlayer = React.memo(function Player({ player, onDragEnd, onSelect }) {
  const playerSize = ICON_SIZE;
  const radius = playerSize / 2;
  
  return (
    <Group
      x={player.x}
      y={player.y}
      draggable
      onDragEnd={e => onDragEnd(player.id, e)}
      onClick={(e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        onSelect(`player-${player.id}`, e);
      }}
    >
      {player.style === 'striped' ? (
        <Group
          clipFunc={(ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, radius - 1, 0, 2 * Math.PI);
            ctx.closePath();
          }}
        >
          {/* Base circle with main color */}
          <Circle
            radius={radius}
            fill={player.color}
            stroke="black"
            strokeWidth={1}
          />
          {/* Create stripes using multiple rectangles */}
          {[...Array(6)].map((_, i) => (
            <Rect
              key={i}
              x={-playerSize / 2 + (i * (playerSize / 6))}
              y={-playerSize / 2}
              width={playerSize / 12}
              height={playerSize}
              fill={player.stripeColor}
              cornerRadius={0}
            />
          ))}
        </Group>
      ) : (
        <Circle
          radius={radius}
          fill={player.color}
          stroke="black"
          strokeWidth={1}
        />
      )}
      
      {/* Centered Text Label */}
      {(player.playerLabel || (!player.playerLabel && player.label)) && (
        <Text
          text={player.playerLabel || player.label}
          fontSize={player.playerLabel ? 24 : 20}
          fill="black"
          offsetX={((player.playerLabel ? 24 : 20) * (player.playerLabel || player.label).length * 0.6) / 2}
          offsetY={((player.playerLabel ? 24 : 20) * 0.7) / 2}
          fontStyle="bold"
          fontFamily="Arial, sans-serif"
        />
      )}
    </Group>
  );
});



const MemoCone = React.memo(function Cone({ cone, index, onDragEnd, onSelect }) {
  return (
    <RegularPolygon
      x={cone.x}
      y={cone.y}
      sides={3}
      radius={coneSizeToRadius[cone.size]}
      fill={cone.color}
      stroke="black"
      strokeWidth={1}
      draggable
      onClick={(e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        onSelect(`cone-${index}`, e);
      }}
      onDragEnd={e => {
        const newX = e.target.x();
        const newY = e.target.y();
        onDragEnd(index, newX, newY);
      }}
      rotation={0}
    />
  );
});

const MemoFootball = React.memo(function Football({ football, onDragEnd, onSelect }) {
  return (
    <Group
      x={football.x}
      y={football.y}
      draggable
      onDragEnd={e => onDragEnd(football.id, e)}
      onClick={(e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        onSelect(`football-${football.id}`, e);
      }}
    >
      <Circle
        radius={ICON_SIZE / 2}
        fill="transparent"
        stroke="transparent"
        strokeWidth={0}
      />
      <Text
        text="⚽"
        fontSize={ICON_SIZE}
        x={ICON_SIZE / 2}
        y={ICON_SIZE / 2}
        offsetX={ICON_SIZE / 2}
        offsetY={ICON_SIZE / 2}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
});






// --- Line Selection and Editing ---
const handleLineSelect = (id) => setSelectedLineId(id);

const handleLineDrag = (id, idx, pos) => {
  setLines(ls => ls.map(l => {
    if (l.id !== id) return l;
    const pts = [...l.points];
    pts[idx * 2] = pos.x;
    pts[idx * 2 + 1] = pos.y;
    return { ...l, points: pts };
  }));
};

const handleCurveControlDrag = (id, ctrlIdx, pos) => {
  setLines(ls => ls.map(l => {
    if (l.id !== id) return l;
    const pts = [...l.points];
    pts[ctrlIdx * 2] = pos.x;
    pts[ctrlIdx * 2 + 1] = pos.y;
    return { ...l, points: pts };
  }));
};

const handleDeleteLine = (id) => {
  setLines(ls => ls.filter(l => l.id !== id));
  setSelectedLineId(null);
};

// --- Konva Stage Interaction for Drawing ---
const handleStageMouseDown = (e) => {
  console.log('Mouse down event:', { isLineDrawingMode, isDrawing, mode: lineBarConfig.mode });
  
  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  // If in cursor mode, don't start drawing
  if (lineBarConfig.mode === 'cursor') {
    setIsLineDrawingMode(false);
    return;
  }

  // Automatically activate drawing mode when clicking on canvas
  if (!isLineDrawingMode) {
    setIsLineDrawingMode(true);
  }

  const canvasX = (pos.x - offset.x) / scale;
  const canvasY = (pos.y - offset.y) / scale;

  // Start drawing - click to begin
  setIsDrawing(true);
  
  if (lineBarConfig.mode === 'free') {
    setDrawingLine({
      id: getId(),
      type: 'free',
      points: [canvasX, canvasY],
      color: lineBarConfig.color,
      thickness: lineBarConfig.thickness,
      dash: lineBarConfig.dash,
      arrowStart: false,
      arrowEnd: false
    });
  } else if (lineBarConfig.mode === 'straight') {
    // Start point for straight line
    setDrawingLine({
      id: getId(),
      type: 'straight',
      points: [canvasX, canvasY, canvasX, canvasY], // Start and end at same point initially
      color: lineBarConfig.color,
      thickness: lineBarConfig.thickness,
      dash: lineBarConfig.dash,
      arrowStart: lineBarConfig.arrowStart,
      arrowEnd: lineBarConfig.arrowEnd
    });
  } else if (lineBarConfig.mode === 'curve') {
    // Start point for curve - we'll use quadratic curve with control point
    setDrawingLine({
      id: getId(),
      type: 'curve',
      points: [canvasX, canvasY, canvasX, canvasY, canvasX, canvasY], // Start, control, and end at same point initially
      color: lineBarConfig.color,
      thickness: lineBarConfig.thickness,
      dash: lineBarConfig.dash,
      arrowStart: lineBarConfig.arrowStart,
      arrowEnd: lineBarConfig.arrowEnd
    });
  }
  
  console.log('Started drawing:', {
    mode: lineBarConfig.mode,
    color: lineBarConfig.color,
    thickness: lineBarConfig.thickness,
    dash: lineBarConfig.dash,
    arrowStart: lineBarConfig.arrowStart,
    arrowEnd: lineBarConfig.arrowEnd,
    drawingLine: drawingLine
  });
};

const handleStageMouseMove = (e) => {
  // Only update line if we're actively drawing (mouse is down) and not in cursor mode
  if (!isDrawing || !drawingLine || lineBarConfig.mode === 'cursor') return;
  
  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  const canvasX = (pos.x - offset.x) / scale;
  const canvasY = (pos.y - offset.y) / scale;

  if (drawingLine.type === 'free') {
    // For free draw, add points as mouse moves
    setDrawingLine(prev => ({
      ...prev,
      points: [...prev.points, canvasX, canvasY]
    }));
  } else if (drawingLine.type === 'straight') {
    // Update end point for straight line
    setDrawingLine(prev => ({
      ...prev,
      points: [prev.points[0], prev.points[1], canvasX, canvasY]
    }));
  } else if (drawingLine.type === 'curve') {
    // Create a proper curve with control point
    const startX = drawingLine.points[0];
    const startY = drawingLine.points[1];
    
    // Calculate control point to create a nice curve
    // Control point is perpendicular to the line direction
    const dx = canvasX - startX;
    const dy = canvasY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 10) {
      // Create a curve by offsetting the control point perpendicular to the line
      const offset = Math.min(distance * 0.3, 50); // Curve offset
      const midX = (startX + canvasX) / 2;
      const midY = (startY + canvasY) / 2;
      
      // Perpendicular vector
      const perpX = -dy / distance;
      const perpY = dx / distance;
      
      // Control point with perpendicular offset
      const controlX = midX + perpX * offset;
      const controlY = midY + perpY * offset;
      
      setDrawingLine(prev => ({
        ...prev,
        points: [startX, startY, controlX, controlY, canvasX, canvasY]
      }));
    } else {
      // If distance is too small, just use midpoint as control
      const midX = (startX + canvasX) / 2;
      const midY = (startY + canvasY) / 2;
      
      setDrawingLine(prev => ({
        ...prev,
        points: [startX, startY, midX, midY, canvasX, canvasY]
      }));
    }
  }
  
  console.log('Drawing line:', {
    type: drawingLine.type,
    points: drawingLine.points,
    color: drawingLine.color,
    thickness: drawingLine.thickness
  });
};

const handleStageMouseUp = (e) => {
  const pos = e.target.getStage().getPointerPosition();
  if (!pos) return;

  // Handle line drawing completion - release to finish
  if (isDrawing && drawingLine) {
    // Check if the line has meaningful length (not just a click)
    let hasLength = false;
    
    if (drawingLine.type === 'free') {
      hasLength = drawingLine.points.length >= 4; // At least 2 points
    } else if (drawingLine.type === 'straight') {
      // Check distance between start and end points
      const startX = drawingLine.points[0];
      const startY = drawingLine.points[1];
      const endX = drawingLine.points[2];
      const endY = drawingLine.points[3];
      const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      hasLength = distance > 5; // Minimum 5 pixel distance
    } else if (drawingLine.type === 'curve') {
      // Check distance between start and end points for curves
      const startX = drawingLine.points[0];
      const startY = drawingLine.points[1];
      const endX = drawingLine.points[4];
      const endY = drawingLine.points[5];
      const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      hasLength = distance > 5; // Minimum 5 pixel distance
    }
    
    if (hasLength) {
      pushHistory();
      setLines(ls => [...ls, drawingLine]);
    }
    
    setDrawingLine(null);
    setIsDrawing(false);
    
    // Automatically deactivate drawing mode when mouse is released
    setIsLineDrawingMode(false);
    
    // Reset line bar config to cursor mode to ensure clean state
    setLineBarConfig(prev => ({
      ...prev,
      mode: 'cursor'
    }));
    
    return;
  }

  // Handle drag and drop for other elements
  if (draggingFromPanel === 'team1' || draggingFromPanel === 'team2') {
    handleDropPlayerOnStage(pos, draggingFromPanel);
    // Reset line drawing mode when dropping players
    setIsLineDrawingMode(false);
  } else if (draggingFromPanel === 'cone') {
    // Calculate position based on device type
    let canvasX, canvasY;
    if (isMobile) {
      // On mobile, the panel is above the field, so no x-offset needed
      canvasX = (pos.x - offset.x - ICON_SIZE / 2) / scale;
      canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    } else {
      // On desktop, the right panel is on the left side, so no SIDE_PANEL_WIDTH subtraction needed
      canvasX = (pos.x - offset.x - ICON_SIZE / 2) / scale;
      canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    }
    
    // Apply alignment guides and snapping
    const snapped = applySnapping(canvasX, canvasY);
    canvasX = snapped.x;
    canvasY = snapped.y;
    
    pushHistory();
    setCones([...cones, {
      x: canvasX,
      y: canvasY,
      color: coneColor,
      size: coneSize
    }]);
    // Reset line drawing mode when dropping cones
    setIsLineDrawingMode(false);
  } else if (draggingFromPanel === 'football') {
    // Calculate position based on device type
    let canvasX, canvasY;
    if (isMobile) {
      // On mobile, the panel is above the field, so no x-offset needed
      canvasX = (pos.x - offset.x - ICON_SIZE / 2) / scale;
      canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    } else {
      // On desktop, the right panel is on the left side, so no SIDE_PANEL_WIDTH subtraction needed
      canvasX = (pos.x - offset.x - ICON_SIZE / 2) / scale;
      canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    }
    
    // Apply alignment guides and snapping
    const snapped = applySnapping(canvasX, canvasY);
    canvasX = snapped.x;
    canvasY = snapped.y;
    
    pushHistory();
    // Store football position at its visual center (accounting for text baseline offset)
    setFootballs(fbs => [...fbs, { id: getId(), x: canvasX, y: canvasY - ICON_SIZE * 0.1 }]);
    // Reset line drawing mode when dropping footballs
    setIsLineDrawingMode(false);
  }

  // Reset all drag/drop state
  setDraggingFromPanel(null);
  setDragPosition(null);
};


  useEffect(() => {
    if (draggingFromPanel !== 'football') return;
    const handlePointerMove = e => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [draggingFromPanel]);

  return (
    <div 
      className="drill-drawer-container"
      style={{ 
      display: 'flex', 
        height: isMobile ? (window.innerWidth > window.innerHeight ? '100vh' : (isSmallMobile ? 'calc(100vh - 50px)' : 'calc(100vh - 60px)')) : '100vh', 
        overflow: 'auto', 
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      alignItems: 'stretch',
      flexDirection: isMobile ? 'column' : 'row',
      position: 'relative'
      }}
      onTouchStart={(e) => {
        // Allow scrolling when touching the container
        if (!isDrawing && !isLineDrawingMode && !isDeleteMode) {
          // Don't prevent default - allow natural scrolling
        }
      }}
      onTouchMove={(e) => {
        // Allow scrolling when touching the container
        if (!isDrawing && !isLineDrawingMode && !isDeleteMode) {
          // Don't prevent default - allow natural scrolling
        }
      }}
    >
      {/* Right Panel (now positioned on the left) */}
      {!isMobile && (
        <RightPanel
        SIDE_PANEL_WIDTH={SIDE_PANEL_WIDTH}
        background={background}
        setBackground={setBackground}
          coneColor={coneColor}
          setConeColor={setConeColor}
          coneSize={coneSize}
          setConeSize={setConeSize}
          labelModeTeam1={labelModeTeam1}
          setLabelModeTeam1={setLabelModeTeam1}
          labelModeTeam2={labelModeTeam2}
          setLabelModeTeam2={setLabelModeTeam2}
          getNextLabel={getNextLabel}
          draggingFromPanel={draggingFromPanel}
          setDraggingFromPanel={setDraggingFromPanel}
          undoLast={undoLast}
          editingPlayerId={editingPlayerId}
          editingText={editingText}
          setEditingText={setEditingText}
          handleEditComplete={handleEditComplete}
          setDragPosition={setDragPosition}
          playerColorTeam1={playerColorTeam1}
          setPlayerColorTeam1={setPlayerColorTeam1}
          playerColorTeam2={playerColorTeam2}
          setPlayerColorTeam2={setPlayerColorTeam2}
          playerStyleTeam1={playerStyleTeam1}
          setPlayerStyleTeam1={setPlayerStyleTeam1}
          playerStyleTeam2={playerStyleTeam2}
          setPlayerStyleTeam2={setPlayerStyleTeam2}
          playerStripeColorTeam1={playerStripeColorTeam1}
          setPlayerStripeColorTeam1={setPlayerStripeColorTeam1}
          playerStripeColorTeam2={playerStripeColorTeam2}
          setPlayerStripeColorTeam2={setPlayerStripeColorTeam2}
          playerLabelTypeTeam1={playerLabelTypeTeam1}
          setPlayerLabelTypeTeam1={setPlayerLabelTypeTeam1}
          playerLabelTypeTeam2={playerLabelTypeTeam2}
          setPlayerLabelTypeTeam2={setPlayerLabelTypeTeam2}
          playerCustomTextTeam1={playerCustomTextTeam1}
          setPlayerCustomTextTeam1={setPlayerCustomTextTeam1}
          playerCustomTextTeam2={playerCustomTextTeam2}
          setPlayerCustomTextTeam2={setPlayerCustomTextTeam2}
          nextPlayerNumberTeam1={nextPlayerNumberTeam1}
          nextPlayerNumberTeam2={nextPlayerNumberTeam2}
          deleteSelectedItems={deleteSelectedItems}
          clearAllItems={clearAllItems}
        setIsLineDrawingMode={setIsLineDrawingMode}
        setLineBarConfig={setLineBarConfig}
          lineBarConfig={lineBarConfig}
          isDeleteMode={isDeleteMode}
          setIsDeleteMode={setIsDeleteMode}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      )}
      {/* Field (Pitch) with equal horizontal spacing */}
      <div 
        className="drill-drawer-container"
        style={{ 
          flexGrow: 1, 
          margin: isMobile ? (isSmallMobile ? '3px 0' : '5px 0') : '0 4px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column', 
          position: 'relative',
          minHeight: isMobile ? (window.innerWidth > window.innerHeight ? '600px' : (isSmallMobile ? '900px' : '1000px')) : 'auto',
          // Better mobile layout
          width: isMobile ? '100%' : 'auto',
          padding: isMobile ? '0 5px' : '0'
          // Removed overflow to prevent scroll conflicts
        }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          limitToBounds={false}
          centerOnInit={true}
          wheel={{ disabled: !isMobile }}
          pinch={{ disabled: !isMobile, step: 5 }}
          doubleClick={{ disabled: !isMobile, step: 1.5 }}
          panning={{ disabled: true }}
        >
          <TransformComponent>
            <Stage
              width={isMobile ? (isSmallMobile ? Math.min(window.innerWidth - 10, 600) : Math.min(window.innerWidth - 20, 700)) : Math.min(window.innerWidth - SIDE_PANEL_WIDTH * 2 - 8, 1100)}
              height={isMobile ? (window.innerWidth > window.innerHeight ? Math.min(window.innerHeight - 40, 500) : window.innerHeight - 150) : Math.min(window.innerHeight, 700)}
              onClick={handleStageClick}
              ref={stageRef}
              className={`${isDeleteMode ? 'scissors-cursor' : ''} ${(isDrawing || isLineDrawingMode || isDeleteMode) ? 'drawing-mode' : ''}`}
              onMouseMove={e => {
                if (draggingFromPanel) {
                  setDragPosition(e.target.getStage().getPointerPosition());
                }
                // Always handle mouse move for line drawing
                handleStageMouseMove(e);
              }}
              onMouseUp={handleStageMouseUp}
              onMouseDown={handleStageMouseDown}
              onTouchMove={e => {
                // Always handle touch move for line drawing completion
                if (isDrawing || drawingLine || draggingFromPanel || isLineDrawingMode) {
                  e.evt.preventDefault();
                  if (draggingFromPanel) {
                    const stage = e.target.getStage();
                    const point = stage.getPointerPosition();
                    setDragPosition(point);
                  }
                  handleStageMouseMove(e);
                }
                // If not drawing, allow natural scrolling
              }}
              onTouchEnd={e => {
                // Always handle touch end for line drawing completion
                if (isDrawing || drawingLine || draggingFromPanel || isLineDrawingMode) {
                  e.evt.preventDefault();
                  handleStageMouseUp(e);
                }
              }}
              onTouchStart={e => {
                // Only prevent default if we're actually drawing or dragging
                if (isDrawing || draggingFromPanel || isLineDrawingMode) {
                  e.evt.preventDefault();
                  handleStageMouseDown(e);
                }
              }}
              style={{ 
                cursor: isDeleteMode ? 'crosshair' : (isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? 'crosshair' : 'default'),
                border: isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? '2px solid #2196F3' : 'none',
                borderRadius: isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? '4px' : '0',
                touchAction: isMobile ? ((isDrawing || isLineDrawingMode || isDeleteMode) ? 'none' : 'pan-y') : 'auto',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                // Mobile performance improvements
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                // Better mobile rendering
                imageRendering: isMobile ? 'optimizeSpeed' : 'auto',
                // Prevent mobile glitches
                WebkitTapHighlightColor: 'transparent',
                // Smooth mobile interactions
                transition: isMobile ? 'all 0.15s ease' : 'none',
                // Better mobile sizing
                maxWidth: isMobile ? '100%' : 'none',
                maxHeight: isMobile ? '100%' : 'none'
              }}
            >
              <Layer scale={{ x: scale, y: scale }} x={offset.x} y={offset.y}>
                {imageObj && <KonvaImage image={imageObj} />}
                

                
                {/* Drawing mode indicator */}
                {isLineDrawingMode && lineBarConfig.mode !== 'cursor' && (
                  <Text
                    x={10}
                    y={10}
                    text={`Drawing Mode: ${lineBarConfig.mode}`}
                    fontSize={16}
                    fill="#2196F3"
                    fontStyle="bold"
                    shadowColor="white"
                    shadowBlur={2}
                    shadowOffset={{ x: 1, y: 1 }}
                  />
                )}
                
                {/* Delete mode indicator */}
                {isDeleteMode && (
                  <Text
                    x={10}
                    y={isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? 35 : 10}
                    text={`Scissors Mode Active (${isDeleteMode}) - Click to cut items`}
                    fontSize={16}
                    fill="#ff4444"
                    fontStyle="bold"
                    shadowColor="white"
                    shadowBlur={2}
                    shadowOffset={{ x: 1, y: 1 }}
                  />
                )}

                {cones.map((cone, i) => (
                  <MemoCone
                    key={`cone-${i}`}
                    cone={cone}
                    index={i}
                    onDragEnd={handleDragEndCone}
                    onSelect={handleItemClick}
                  />
                ))}

                {players.map((player) => (
                  <MemoPlayer
                    key={player.id}
                    player={player}
                    onDragEnd={handleDragEndPlayer}
                    onSelect={handleItemClick}
                  />
                ))}

                {/* Render footballs */}
                {footballs.map((fb) => (
                  <MemoFootball
                    key={fb.id}
                    football={fb}
                    onDragEnd={handleDragEndFootball}
                    onSelect={handleItemClick}
                  />
                ))}


                {draggingFromPanel === 'cone' && dragPosition && (() => {
                  const canvasX = (dragPosition.x - offset.x - ICON_SIZE / 2) / scale;
                  const canvasY = (dragPosition.y - offset.y - ICON_SIZE / 2) / scale;
                  const snapped = applySnapping(canvasX, canvasY);
                  
                  return (
                    <RegularPolygon
                      x={snapped.x}
                      y={snapped.y}
                      sides={3}
                      radius={coneSizeToRadius[coneSize]}
                      fill={coneColor}
                      stroke="black"
                      strokeWidth={1}
                      opacity={0.6}
                      rotation={0}
                    />
                  );
                })()}
                {(draggingFromPanel === 'team1' || draggingFromPanel === 'team2') && dragPosition && (() => {
                  const canvasX = (dragPosition.x - offset.x - ICON_SIZE / 2) / scale;
                  const canvasY = (dragPosition.y - offset.y - ICON_SIZE / 2) / scale;
                  const snapped = applySnapping(canvasX, canvasY);
                  
                  return (
                    <Group
                      x={snapped.x}
                      y={snapped.y}
                    >
                      {(() => {
                        const color = draggingFromPanel === 'team1' ? playerColorTeam1 : playerColorTeam2;
                        const style = draggingFromPanel === 'team1' ? playerStyleTeam1 : playerStyleTeam2;
                        const stripeColor = draggingFromPanel === 'team1' ? playerStripeColorTeam1 : playerStripeColorTeam2;
                        const size = ICON_SIZE;
                        const labelType = draggingFromPanel === 'team1' ? playerLabelTypeTeam1 : playerLabelTypeTeam2;
                        const customText = draggingFromPanel === 'team1' ? playerCustomTextTeam1 : playerCustomTextTeam2;
                        const nextNumber = draggingFromPanel === 'team1' ? nextPlayerNumberTeam1 : nextPlayerNumberTeam2;
                        
                        const radius = size / 2;
                        let playerLabel = '';
                        if (labelType === 'number') {
                          playerLabel = nextNumber.toString();
                        } else if (labelType === 'text') {
                          playerLabel = customText;
                        }
                        
                        return (
                          <>
                            {style === 'striped' ? (
                              <Group
                                clipFunc={(ctx) => {
                                  ctx.beginPath();
                                  ctx.arc(0, 0, radius - 1, 0, 2 * Math.PI);
                                  ctx.closePath();
                                }}
                              >
                                {/* Base circle with main color */}
                                <Circle
                                  radius={radius}
                                  fill={color}
                                  opacity={0.6}
                                />
                                {/* Create stripes using multiple rectangles */}
                                {[...Array(6)].map((_, i) => (
                                  <Rect
                                    key={i}
                                    x={-size / 2 + (i * (size / 6))}
                                    y={-size / 2}
                                    width={size / 12}
                                    height={size}
                                    fill={stripeColor}
                                    opacity={0.6}
                                    cornerRadius={0}
                                  />
                                ))}
                              </Group>
                            ) : (
                              <Circle
                                radius={radius}
                                fill={color}
                                opacity={0.6}
                              />
                            )}
                            
                            {/* Centered Text Label */}
                            {(playerLabel || getNextLabel(draggingFromPanel)) && (
                              <Text
                                text={playerLabel || getNextLabel(draggingFromPanel)}
                                fontSize={playerLabel ? 24 : 20}
                                fill="black"
                                offsetX={((playerLabel ? 24 : 20) * (playerLabel || getNextLabel(draggingFromPanel)).length * 0.6) / 2}
                                offsetY={((playerLabel ? 24 : 20) * 0.7) / 2}
                                fontStyle="bold"
                                fontFamily="Arial, sans-serif"
                              />
                            )}
                          </>
                        );
                      })()}
                    </Group>
                  );
                })()}
                {draggingFromPanel === 'line' && dragPosition && (
                  <Arrow
                    points={[
                      (dragPosition.x - offset.x - 40) / scale,
                      (dragPosition.y - offset.y) / scale,
                      (dragPosition.x - offset.x + 40) / scale,
                      (dragPosition.y - offset.y) / scale,
                    ]}
                    stroke={lineBarConfig.color || '#2563eb'}
                    fill={lineBarConfig.color || '#2563eb'}
                    strokeWidth={lineBarConfig.thickness || 4}
                    dash={lineBarConfig.dash || []}
                    pointerAtBeginning={!!lineBarConfig.arrowStart}
                    pointerAtEnding={!!lineBarConfig.arrowEnd}
                    pointerLength={(lineBarConfig.thickness || 4) * 4}
                    pointerWidth={(lineBarConfig.thickness || 4) * 4}
                    opacity={0.6}
                  />
                )}
                {draggingFromPanel === 'football' && dragPosition && (() => {
                  const canvasX = (dragPosition.x - offset.x - ICON_SIZE / 2) / scale;
                  const canvasY = (dragPosition.y - offset.y - ICON_SIZE / 2) / scale;
                  const snapped = applySnapping(canvasX, canvasY);
                  
                  return (
                    <Text
                      text="⚽"
                      fontSize={ICON_SIZE}
                      x={snapped.x + ICON_SIZE / 2}
                      y={snapped.y + ICON_SIZE / 2}
                      offsetX={ICON_SIZE / 2}
                      offsetY={ICON_SIZE / 2}
                      opacity={0.6}
                      align="center"
                      verticalAlign="middle"
                    />
                  );
                })()}

                {/* Alignment Guide Lines */}
                {dragPosition && (draggingFromPanel === 'cone' || draggingFromPanel === 'team1' || draggingFromPanel === 'team2' || draggingFromPanel === 'football') && (() => {
                  const canvasX = (dragPosition.x - offset.x - ICON_SIZE / 2) / scale;
                  const canvasY = (dragPosition.y - offset.y - ICON_SIZE / 2) / scale;
                  const guides = findAlignmentGuides(canvasX, canvasY);
                  
                  // Grid-based guide lines
                  const gridSize = 10;
                  const gridX = Math.round(canvasX / gridSize) * gridSize;
                  const gridY = Math.round(canvasY / gridSize) * gridSize;
                  const gridSnapDistance = 8;
                  const isNearGridX = Math.abs(canvasX - gridX) <= gridSnapDistance;
                  const isNearGridY = Math.abs(canvasY - gridY) <= gridSnapDistance;
                  
                  return (
                    <>
                      {/* Horizontal guide line (object alignment) */}
                      {guides.horizontal !== null && (
                        <Line
                          points={[0, guides.horizontal, 1000, guides.horizontal]}
                          stroke="#ff6b6b"
                          strokeWidth={2}
                          dash={[5, 5]}
                          opacity={0.8}
                        />
                      )}
                      {/* Vertical guide line (object alignment) */}
                      {guides.vertical !== null && (
                        <Line
                          points={[guides.vertical, 0, guides.vertical, 1000]}
                          stroke="#ff6b6b"
                          strokeWidth={2}
                          dash={[5, 5]}
                          opacity={0.8}
                        />
                      )}
                      {/* Grid guide lines (only show if no object alignment) */}
                      {guides.horizontal === null && isNearGridY && (
                        <Line
                          points={[0, gridY, 1000, gridY]}
                          stroke="#4ecdc4"
                          strokeWidth={1}
                          dash={[3, 3]}
                          opacity={0.6}
                        />
                      )}
                      {guides.vertical === null && isNearGridX && (
                        <Line
                          points={[gridX, 0, gridX, 1000]}
                          stroke="#4ecdc4"
                          strokeWidth={1}
                          dash={[3, 3]}
                          opacity={0.6}
                        />
                      )}
                    </>
                  );
                })()}




            {lines.map(line => {
              // Special handling for free draw lines with arrows
              if (line.type === 'free' && (line.arrowStart || line.arrowEnd)) {
                return (
                  <Group key={line.id} onClick={(e) => {
                    e.evt.preventDefault();
                    e.evt.stopPropagation();
                    handleItemClick(`line-${line.id}`, e);
                  }}
                  onDblClick={(e) => {
                    e.evt.preventDefault();
                    e.evt.stopPropagation();
                    handleDoubleClickLine(line.id, e);
                  }}>
                    {/* Main free draw line */}
                    <Line
                      points={line.points}
                      stroke={line.color}
                      strokeWidth={line.thickness}
                      dash={line.dash}
                      lineCap="round"
                      lineJoin="round"
                      opacity={selectedItems.has(`line-${line.id}`) ? 0.7 : 1}
                    />
                    
                    {/* Start arrow */}
                    {line.arrowStart && line.points.length >= 4 && (
                      <Arrow
                        points={[
                          line.points[2], line.points[3],
                          line.points[0], line.points[1]
                        ]}
                        stroke={line.color}
                        fill={line.color}
                        strokeWidth={line.thickness}
                        pointerLength={line.thickness * 3}
                        pointerWidth={line.thickness * 2}
                        pointerAtBeginning={false}
                        pointerAtEnding={true}
                        opacity={selectedItems.has(`line-${line.id}`) ? 0.7 : 1}
                      />
                    )}
                    
                    {/* End arrow */}
                    {line.arrowEnd && line.points.length >= 4 && (
                      <Arrow
                        points={[
                          line.points[line.points.length - 4], line.points[line.points.length - 3],
                          line.points[line.points.length - 2], line.points[line.points.length - 1]
                        ]}
                        stroke={line.color}
                        fill={line.color}
                        strokeWidth={line.thickness}
                        pointerLength={line.thickness * 3}
                        pointerWidth={line.thickness * 2}
                        pointerAtBeginning={false}
                        pointerAtEnding={true}
                        opacity={selectedItems.has(`line-${line.id}`) ? 0.7 : 1}
                      />
                    )}
                  </Group>
                );
              }
              
              // Use Arrow component for straight and curved lines with arrows
              if ((line.type === 'straight' || line.type === 'curve') && (line.arrowStart || line.arrowEnd)) {
                return (
                  <Arrow
                    key={line.id}
                    points={line.points}
                    stroke={line.color}
                    fill={line.color}
                    strokeWidth={line.thickness}
                    dash={line.dash}
                    pointerAtBeginning={!!line.arrowStart}
                    pointerAtEnding={!!line.arrowEnd}
                    tension={line.type === 'curve' ? 1 : 0} // Add tension for curves
                    lineCap="round"
                    lineJoin="round"
                    onClick={(e) => {
                      e.evt.preventDefault();
                      e.evt.stopPropagation();
                      handleItemClick(`line-${line.id}`, e);
                    }}
                    onDblClick={(e) => {
                      e.evt.preventDefault();
                      e.evt.stopPropagation();
                      handleDoubleClickLine(line.id, e);
                    }}
                    opacity={selectedItems.has(`line-${line.id}`) ? 0.7 : 1}
                  />
                );
              }

              // Use Line component for lines without arrows
              return (
                <Line
                  key={line.id}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.thickness}
                  dash={line.dash}
                  lineCap="round"
                  lineJoin="round"
                  tension={line.type === 'curve' ? 1 : 0} // Add tension for curves
                  onClick={(e) => {
                    e.evt.preventDefault();
                    e.evt.stopPropagation();
                    handleItemClick(`line-${line.id}`, e);
                  }}
                  onDblClick={(e) => {
                    e.evt.preventDefault();
                    e.evt.stopPropagation();
                    handleDoubleClickLine(line.id, e);
                  }}
                  opacity={selectedItems.has(`line-${line.id}`) ? 0.7 : 1}
                />
              );
            })}

                      {/* Render handles for selected line for editing */}
                      {selectedLineId && (() => {
                        const line = lines.find(l => l.id === selectedLineId);
                        if (!line) return null;
                        if (line.type === 'curve' && line.points.length === 6) {
                          // 3 handles: start, control, end
                          return [0, 1, 2].map(i => (
                            <Circle
                              key={i}
                              x={line.points[i * 2]}
                              y={line.points[i * 2 + 1]}
                              radius={10}
                              fill="#fbbf24"
                              stroke="#b45309"
                              strokeWidth={2}
                              draggable
                              onDragMove={e => handleCurveControlDrag(line.id, i, { x: e.target.x(), y: e.target.y() })}
                            />
                          ));
                        } else {
                          // 2 handles: start, end
                          return [0, 1].map(i => (
                            <Circle
                              key={i}
                              x={line.points[i * 2]}
                              y={line.points[i * 2 + 1]}
                              radius={10}
                              fill="#fbbf24"         // amber
                              stroke="#b45309"       // darker border
                              strokeWidth={2}
                              draggable
                              onDragMove={e => handleLineDrag(line.id, i, { x: e.target.x(), y: e.target.y() })}
                              onMouseEnter={e => {
                                const container = e.target.getStage().container();
                                container.style.cursor = 'move';
                              }}
                              onMouseLeave={e => {
                                const container = e.target.getStage().container();
                                container.style.cursor = 'default';
                              }}
                            />
                          ));
                        }
                      })()}      
                      {/* Render the line being drawn */}
                      {drawingLine && (
                        drawingLine.type === 'free' && (drawingLine.arrowStart || drawingLine.arrowEnd) ? (
                          <Group>
                            {/* Main free draw line */}
                            <Line
                              points={drawingLine.points}
                              stroke={drawingLine.color}
                              strokeWidth={drawingLine.thickness}
                              dash={drawingLine.dash}
                              lineCap="round"
                              lineJoin="round"
                              opacity={0.8}
                            />
                            
                            {/* Start arrow */}
                            {drawingLine.arrowStart && drawingLine.points.length >= 4 && (
                              <Arrow
                                points={[
                                  drawingLine.points[0], drawingLine.points[1],
                                  drawingLine.points[2], drawingLine.points[3]
                                ]}
                                stroke={drawingLine.color}
                                fill={drawingLine.color}
                                strokeWidth={drawingLine.thickness}
                                pointerLength={drawingLine.thickness * 3}
                                pointerWidth={drawingLine.thickness * 2}
                                pointerAtBeginning={false}
                                pointerAtEnding={true}
                                opacity={0.8}
                              />
                            )}
                            
                            {/* End arrow */}
                            {drawingLine.arrowEnd && drawingLine.points.length >= 4 && (
                              <Arrow
                                points={[
                                  drawingLine.points[drawingLine.points.length - 4], drawingLine.points[drawingLine.points.length - 3],
                                  drawingLine.points[drawingLine.points.length - 2], drawingLine.points[drawingLine.points.length - 1]
                                ]}
                                stroke={drawingLine.color}
                                fill={drawingLine.color}
                                strokeWidth={drawingLine.thickness}
                                pointerLength={drawingLine.thickness * 3}
                                pointerWidth={drawingLine.thickness * 2}
                                pointerAtBeginning={false}
                                pointerAtEnding={true}
                                opacity={0.8}
                              />
                            )}
                          </Group>
                        ) : drawingLine.arrowStart || drawingLine.arrowEnd ? (
                          <Arrow
                            points={drawingLine.points}
                            stroke={drawingLine.color}
                            fill={drawingLine.color}
                            strokeWidth={drawingLine.thickness}
                            pointerLength={drawingLine.thickness * 3}
                            pointerWidth={drawingLine.thickness * 2}
                            dash={drawingLine.dash}
                            pointerAtBeginning={!!drawingLine.arrowStart}
                            pointerAtEnding={!!drawingLine.arrowEnd}
                            tension={drawingLine.type === 'curve' ? 1 : 0} // Add tension for curves
                            lineCap="round"
                            lineJoin="round"
                            opacity={0.8}
                          />
                        ) : (
                          <Line
                            points={drawingLine.points}
                            stroke={drawingLine.color}
                            strokeWidth={drawingLine.thickness}
                            dash={drawingLine.dash}
                            lineCap="round"
                            lineJoin="round"
                            tension={drawingLine.type === 'curve' ? 1 : 0} // Add tension for curves
                            opacity={0.8}
                          />
                        )
                      )}


              </Layer>
            </Stage>
          </TransformComponent>
        </TransformWrapper>
        {/* Bottom Panel - Line Drawing Controls */}
        {!isMobile && (
        <BottomPanel
          stageRef={stageRef}
          lineBarConfig={lineBarConfig}
          setLineBarConfig={setLineBarConfig}
          setDraggingFromPanel={setDraggingFromPanel}
          ICON_SIZE={ICON_SIZE}
          isLineDrawingMode={isLineDrawingMode}
          setIsLineDrawingMode={setIsLineDrawingMode}
          isDeleteMode={isDeleteMode}
          setIsDeleteMode={setIsDeleteMode}
          isMobile={isMobile}
          isTablet={isTablet}
          isSmallMobile={isSmallMobile}
        />
        )}
      </div>
      {/* Right Panel - Field Background Selection */}
      {!isMobile && (
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
            <div style={{ fontSize: '14px', color: '#000000', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Field Background
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground('/watermarked_pitch_full.png');
                }}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontSize: '12px',
                  backgroundColor: background === '/watermarked_pitch_full.png' ? '#000000' : '#ffffff',
                  color: background === '/watermarked_pitch_full.png' ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                }}
                title="Full Field"
              >
                Full Field
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground('/watermarked_pitch_half.png');
                }}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontSize: '12px',
                  backgroundColor: background === '/watermarked_pitch_half.png' ? '#000000' : '#ffffff',
                  color: background === '/watermarked_pitch_half.png' ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                }}
                title="Half Field"
              >
                Half Field
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBackground('/watermarked_pitch_blank.png');
                }}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontSize: '12px',
                  backgroundColor: background === '/watermarked_pitch_blank.png' ? '#000000' : '#ffffff',
                  color: background === '/watermarked_pitch_blank.png' ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                }}
                title="Blank Field"
              >
                Blank Field
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Editing Overlays */}
      {(editingConeId !== null || editingFootballId !== null || editingLineId !== null) && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999
          }}
          onClick={() => {
            setEditingConeId(null);
            setEditingFootballId(null);
            setEditingLineId(null);
          }}
        />
      )}
      
      {editingConeId !== null && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 1000,
            minWidth: '200px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: '0 0 16px 0', color: '#000000', fontWeight: 700 }}>Edit Cone</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Color:</label>
            <input
              type="color"
              value={cones[editingConeId]?.color || '#ff0000'}
              onChange={(e) => {
                const newCones = [...cones];
                newCones[editingConeId] = { ...newCones[editingConeId], color: e.target.value };
                setCones(newCones);
              }}
              style={{ width: '100%', height: '40px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Size:</label>
            <select
              value={cones[editingConeId]?.size || 'small'}
              onChange={(e) => {
                const newCones = [...cones];
                newCones[editingConeId] = { ...newCones[editingConeId], size: e.target.value };
                setCones(newCones);
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingConeId(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setEditingConeId(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #000000',
                borderRadius: '4px',
                backgroundColor: '#000000',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {editingFootballId !== null && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 1000,
            minWidth: '200px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: '0 0 16px 0', color: '#000000', fontWeight: 700 }}>Edit Football</h3>
          <p style={{ margin: '0 0 16px 0', color: '#666666' }}>
            Drag the football to reposition it, then click Done when finished.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingFootballId(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setEditingFootballId(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #000000',
                borderRadius: '4px',
                backgroundColor: '#000000',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {editingLineId !== null && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 1000,
            minWidth: '250px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: '0 0 16px 0', color: '#000000', fontWeight: 700 }}>Edit Line</h3>
          <p style={{ margin: '0 0 16px 0', color: '#666666' }}>
            Use the handles on the line to adjust its shape, then click Done when finished.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingLineId(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setEditingLineId(null)}
              style={{
                padding: '8px 16px',
                border: '1px solid #000000',
                borderRadius: '4px',
                backgroundColor: '#000000',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Mobile Floating Buttons */}
      {isMobile && (
        <>
          {/* Top Floating Buttons - Screenshot, Undo, Clear */}
          {/* Screenshot Button - Top Left */}
        <div
            className="mobile-floating-button"
          style={{
            position: 'fixed',
              top: isSmallMobile ? '80px' : '90px',
              left: isSmallMobile ? '15px' : '20px',
              width: isSmallMobile ? '50px' : '60px',
              height: isSmallMobile ? '50px' : '60px',
            backgroundColor: '#ffffff',
              borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: isSmallMobile ? '18px' : '20px',
              fontWeight: 'bold',
              color: '#000000',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onClick={() => {
              // Screenshot functionality
              const stage = stageRef.current;
              if (stage) {
                const dataURL = stage.toDataURL();
                const link = document.createElement('a');
                link.download = 'drill-drawer-screenshot.png';
                link.href = dataURL;
                link.click();
              }
            }}
            title="Take Screenshot"
          >
            📸
          </div>

          {/* Undo Button - Top Center */}
          <div
            className="mobile-floating-button"
            style={{
              position: 'fixed',
              top: isSmallMobile ? '80px' : '90px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isSmallMobile ? '50px' : '60px',
              height: isSmallMobile ? '50px' : '60px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: isSmallMobile ? '18px' : '20px',
              fontWeight: 'bold',
              color: '#000000',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onClick={() => {
              // Undo functionality
              undoLast();
            }}
            title="Undo Last Action"
          >
            ↩️
          </div>

          {/* Clear Button - Top Right */}
          <div
            className="mobile-floating-button"
            style={{
              position: 'fixed',
              top: isSmallMobile ? '80px' : '90px',
              right: isSmallMobile ? '15px' : '20px',
              width: isSmallMobile ? '50px' : '60px',
              height: isSmallMobile ? '50px' : '60px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: isSmallMobile ? '12px' : '14px',
              fontWeight: 'bold',
              color: '#000000',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onClick={() => {
              // Clear all functionality
              if (window.confirm('Are you sure you want to clear everything?')) {
                clearAllItems();
              }
            }}
            title="Clear All Items"
          >
            Clear
          </div>

          {/* Icons Button - Left Bottom */}
          <div
            className="mobile-floating-button"
            style={{
              position: 'fixed',
              bottom: isSmallMobile ? '20px' : '25px',
              left: isSmallMobile ? '15px' : '20px',
              width: isSmallMobile ? '60px' : '70px',
              height: isSmallMobile ? '60px' : '70px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: isSmallMobile ? '12px' : '14px',
              fontWeight: 'bold',
              color: '#000000',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onClick={() => setShowMobileIcons(!showMobileIcons)}
          >
            Icons
          </div>

          {/* Lines Button - Middle Bottom */}
          <div
            className="mobile-floating-button"
            style={{
              position: 'fixed',
              bottom: isSmallMobile ? '20px' : '25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isSmallMobile ? '60px' : '70px',
              height: isSmallMobile ? '60px' : '70px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: isSmallMobile ? '12px' : '14px',
              fontWeight: 'bold',
              color: '#000000',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onClick={() => setShowMobileLines(!showMobileLines)}
          >
            Lines
          </div>

          {/* Field Button - Right Bottom */}
          <div
            className="mobile-floating-button"
            style={{
              position: 'fixed',
              bottom: isSmallMobile ? '20px' : '25px',
              right: isSmallMobile ? '15px' : '20px',
              width: isSmallMobile ? '60px' : '70px',
              height: isSmallMobile ? '60px' : '70px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '2px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'pointer',
              fontSize: isSmallMobile ? '12px' : '14px',
              fontWeight: 'bold',
              color: '#000000',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.2s ease',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onClick={() => setShowMobileField(!showMobileField)}
          >
            Field
          </div>
        </>
      )}

      {/* HTML drag preview for out-of-canvas drag */}
      {showHtmlPreview && draggedItem && htmlDragPos && (
          <div
            style={{
            position: 'fixed',
            pointerEvents: 'none',
            left: htmlDragPos.x - ICON_SIZE / 2,
            top: htmlDragPos.y - ICON_SIZE / 2,
            zIndex: 9999,
            opacity: 0.85,
            width: ICON_SIZE,
            height: ICON_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
          }}
        >
          {draggedItem.type === 'cone' ? (
          <svg width={ICON_SIZE} height={ICON_SIZE}>
              <polygon points={`${ICON_SIZE/2},5 ${ICON_SIZE-5},${ICON_SIZE-5} 5,${ICON_SIZE-5}`}
                fill={draggedItem.color}
                stroke="black"
                strokeWidth="3"
              />
          </svg>
          ) : (
          <svg width={ICON_SIZE} height={ICON_SIZE}>
              <circle cx={ICON_SIZE/2} cy={ICON_SIZE/2} r={ICON_SIZE/2} fill={draggedItem.color} />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
                fontSize="14"
              fill="white"
            >
                {draggedItem.label}
              </text>
            </svg>
          )}
        </div>
      )}

      {/* Mobile Icons Menu - Left Side */}
      {isMobile && showMobileIcons && (
        <div
          className="mobile-icons-menu"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '20px'
          }}
          onClick={() => setShowMobileIcons(false)}
        >
          <div
            style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
              padding: '16px',
              maxWidth: '300px',
              width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
              border: '2px solid #000000',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Drawing Tools</h3>
              <button
                onClick={() => setShowMobileIcons(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
          </div>

            {/* Cone Tool */}
            <div style={{ marginBottom: '16px', padding: '15px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <svg width="30" height="30" viewBox="0 0 100 100">
                  <polygon points="50,10 90,90 10,90" fill={coneColor} stroke="black" strokeWidth="4" />
                </svg>
                <span style={{ fontWeight: 'bold' }}>Cone Tool</span>
              </div>
              <button
                onClick={() => {
                  setDraggingFromPanel('cone');
                  setIsLineDrawingMode(false);
                  setShowMobileIcons(false);
                }}
              style={{ 
                width: '100%', 
                  padding: '12px',
              backgroundColor: '#000000',
              color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Add Cone
              </button>
          </div>

            {/* Team 1 Player */}
            <div style={{ marginBottom: '16px', padding: '15px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: playerColorTeam1, border: '2px solid #000000' }}></div>
                <span style={{ fontWeight: 'bold' }}>Team 1 Player</span>
              </div>
              <button
                onClick={() => {
                  setDraggingFromPanel('team1');
                  setIsLineDrawingMode(false);
                  setShowMobileIcons(false);
                }}
              style={{ 
                width: '100%', 
                  padding: '12px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Add Player
              </button>
          </div>

            {/* Team 2 Player */}
            <div style={{ marginBottom: '16px', padding: '15px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: playerColorTeam2, border: '2px solid #000000' }}></div>
                <span style={{ fontWeight: 'bold' }}>Team 2 Player</span>
              </div>
              <button
                onClick={() => {
                  setDraggingFromPanel('team2');
                  setIsLineDrawingMode(false);
                  setShowMobileIcons(false);
                }}
              style={{ 
                width: '100%', 
                  padding: '12px',
              backgroundColor: '#000000',
              color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Add Player
              </button>
          </div>

            {/* Football */}
            <div style={{ marginBottom: '16px', padding: '15px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '30px' }}>⚽</span>
                <span style={{ fontWeight: 'bold' }}>Football</span>
              </div>
              <button
                onClick={() => {
                  setDraggingFromPanel('football');
                  setIsLineDrawingMode(false);
                  setShowMobileIcons(false);
                }}
            style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#000000',
              color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
              fontWeight: 'bold', 
                  fontSize: '14px'
                }}
              >
                Add Football
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Lines Menu - Full Screen */}
      {isMobile && showMobileLines && (
        <div
          className="mobile-lines-menu"
              style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
                width: '100%', 
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowMobileLines(false)}
        >
          <div
              style={{ 
                backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '400px',
                width: '100%', 
              maxHeight: '90vh',
              overflowY: 'auto',
                border: '2px solid #000000',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Line Drawing</h3>
              <button
                onClick={() => setShowMobileLines(false)}
              style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
          </div>

            {/* Line Drawing Modes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={() => {
                  setLineBarConfig(prev => ({ 
                    ...prev, 
                    mode: 'straight',
                    color: '#000000',
                    thickness: 3,
                    arrowStart: false,
                    arrowEnd: true
                  }));
                  setIsLineDrawingMode(true);
                  setShowMobileLines(false);
                }}
              style={{ 
                width: '100%', 
                  padding: '15px',
                  backgroundColor: lineBarConfig.mode === 'straight' ? '#000000' : '#ffffff',
                  color: lineBarConfig.mode === 'straight' ? '#ffffff' : '#000000',
                border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
              fontWeight: 'bold', 
                  fontSize: '16px'
                }}
              >
                Straight Line
              </button>
            <button
                onClick={() => {
                  setLineBarConfig(prev => ({ 
                    ...prev, 
                    mode: 'curve',
                    color: '#000000',
                    thickness: 3,
                    arrowStart: false,
                    arrowEnd: true
                  }));
                  setIsLineDrawingMode(true);
                  setShowMobileLines(false);
                }}
              style={{
                width: '100%',
                  padding: '15px',
                  backgroundColor: lineBarConfig.mode === 'curve' ? '#000000' : '#ffffff',
                  color: lineBarConfig.mode === 'curve' ? '#ffffff' : '#000000',
                border: '2px solid #000000',
                borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Curved Line
              </button>
            <button
                onClick={() => {
                  setLineBarConfig(prev => ({ 
                    ...prev, 
                    mode: 'free',
                    color: '#000000',
                    thickness: 3,
                    arrowStart: false,
                    arrowEnd: true
                  }));
                  setIsLineDrawingMode(true);
                  setShowMobileLines(false);
                }}
              style={{
                width: '100%',
                  padding: '15px',
                  backgroundColor: lineBarConfig.mode === 'free' ? '#000000' : '#ffffff',
                  color: lineBarConfig.mode === 'free' ? '#ffffff' : '#000000',
                border: '2px solid #000000',
                  borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Free Draw
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Field Menu - Right Side */}
      {isMobile && showMobileField && (
        <div
          className="mobile-field-menu"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '20px'
          }}
          onClick={() => setShowMobileField(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '300px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '2px solid #000000',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Field Background</h3>
              <button
                onClick={() => setShowMobileField(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Field Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                onClick={() => {
                  setBackground('/watermarked_pitch_full.png');
                  setShowMobileField(false);
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: background === '/watermarked_pitch_full.png' ? '#000000' : '#ffffff',
                  color: background === '/watermarked_pitch_full.png' ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Full Field
              </button>
              <button
                onClick={() => {
                  setBackground('/watermarked_pitch_half.png');
                  setShowMobileField(false);
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: background === '/watermarked_pitch_half.png' ? '#000000' : '#ffffff',
                  color: background === '/watermarked_pitch_half.png' ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Half Field
              </button>
              <button
                onClick={() => {
                  setBackground('/watermarked_pitch_blank.png');
                  setShowMobileField(false);
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: background === '/watermarked_pitch_blank.png' ? '#000000' : '#ffffff',
                  color: background === '/watermarked_pitch_blank.png' ? '#ffffff' : '#000000',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Blank Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillDrawer;
