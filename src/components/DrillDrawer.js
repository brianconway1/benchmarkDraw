// DrillDrawer.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group, Rect, Arrow, Line, Transformer } from 'react-konva';
import useImage from 'use-image';
import { FaUndo } from 'react-icons/fa';
import { RegularPolygon } from 'react-konva';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import BottomPanel from './BottomPanel';

// Responsive constants
const getResponsiveConstants = () => {
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
  
  return {
    ICON_SIZE: isMobile ? 25 : 30,
    SIDE_PANEL_WIDTH: isMobile ? 80 : isTablet ? 120 : 150,
    isMobile,
    isTablet
  };
};

const DrillDrawer = () => {
  const [responsiveConstants, setResponsiveConstants] = useState(getResponsiveConstants());
  const stageRef = useRef();

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
      if (isMobile && showMobileSettings && !event.target.closest('.mobile-settings-panel') && !event.target.closest('.mobile-toolbar')) {
        setShowMobileSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, showMobileSettings]);

  const { ICON_SIZE, SIDE_PANEL_WIDTH, isMobile, isTablet } = responsiveConstants;

  const [coneSize, setConeSize] = useState('medium');
  const [coneColor, setConeColor] = useState('orange');

  const coneSizeToRadius = {
    small: 10,
    medium: 15,
    large: 20,
  };

  const [background, setBackground] = useState('/pitch_full.png');
  const [imageObj, setImageObj] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [cones, setCones] = useState([]);


  const [players, setPlayers] = useState([]);
  const [labelModeTeam1, setLabelModeTeam1] = useState('plain');
  const [nextNumberTeam1, setNextNumberTeam1] = useState(1);
  const [nextLetterTeam1, setNextLetterTeam1] = useState('A');
  const [nextPlayerNumberTeam1, setNextPlayerNumberTeam1] = useState(1);
  const [playerColorTeam1, setPlayerColorTeam1] = useState('#2563eb');
  const [playerStyleTeam1, setPlayerStyleTeam1] = useState('solid');
  const [playerStripeColorTeam1, setPlayerStripeColorTeam1] = useState('white');
  const [playerLabelTypeTeam1, setPlayerLabelTypeTeam1] = useState('number'); // 'none', 'number', 'text'
  const [playerCustomTextTeam1, setPlayerCustomTextTeam1] = useState('');

  const [labelModeTeam2, setLabelModeTeam2] = useState('plain');
  const [nextNumberTeam2, setNextNumberTeam2] = useState(1);
  const [nextLetterTeam2, setNextLetterTeam2] = useState('A');
  const [nextPlayerNumberTeam2, setNextPlayerNumberTeam2] = useState(1);
  const [playerColorTeam2, setPlayerColorTeam2] = useState('#dc2626');
  const [playerStyleTeam2, setPlayerStyleTeam2] = useState('solid');
  const [playerStripeColorTeam2, setPlayerStripeColorTeam2] = useState('white');
  const [playerLabelTypeTeam2, setPlayerLabelTypeTeam2] = useState('number'); // 'none', 'number', 'text'
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
  // Hybrid drag preview state
  const [draggedItem, setDraggedItem] = useState(null); // { type, id, color, label, index }
  const [htmlDragPos, setHtmlDragPos] = useState(null); // {x, y}
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const [lines, setLines] = useState([]); // {id, type, points, color, thickness, dash, arrowStart, arrowEnd}
  const [lineBarConfig, setLineBarConfig] = useState({
    mode: 'cursor', // 'cursor' | 'straight' | 'curve' | 'free'
    color: '#2563eb',
    thickness: 4,
    dash: [],
    arrowStart: false,
    arrowEnd: true,
  });
  const [drawingLine, setDrawingLine] = useState(null); // {type, points, ...}
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLineDrawingMode, setIsLineDrawingMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);


  // Helper for unique IDs
  const getId = () => Math.floor(Date.now() + Math.random() * 1000);

  const [image] = useImage(background, 'Anonymous');

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

  // 1. Add footballs state
  const [footballs, setFootballs] = useState([]);


  useEffect(() => {
    if (image) {
      setImageObj(image);
      // Responsive dimensions based on screen size
      const MAX_WIDTH = isMobile ? window.innerWidth - 20 : isTablet ? 800 : 1100;
      const MAX_HEIGHT = isMobile ? window.innerHeight * 0.6 : isTablet ? 600 : 700;
      const screenWidth = Math.min(window.innerWidth - SIDE_PANEL_WIDTH * 2 - (isMobile ? 10 : 20), MAX_WIDTH);
      const screenHeight = Math.min(window.innerHeight - (isMobile ? 200 : 300), MAX_HEIGHT);
      const widthRatio = screenWidth / image.width;
      const heightRatio = screenHeight / image.height;
      const scaleFactor = Math.min(widthRatio, heightRatio, 1); // never upscale
      setScale(scaleFactor);
      const offsetX = (screenWidth - image.width * scaleFactor) / 2;
      const offsetY = (screenHeight - image.height * scaleFactor) / 2;
      setOffset({ x: offsetX, y: offsetY });
    }
  }, [image, SIDE_PANEL_WIDTH, isMobile, isTablet]);

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

    const clickedOnEmpty = 
      e.target === e.target.getStage() ||
      e.target.getClassName?.() === 'Image';

    if (clickedOnEmpty) {
      // Handle delete mode
      if (isDeleteMode) {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const canvasX = (pointer.x - offset.x) / scale;
        const canvasY = (pointer.y - offset.y) / scale;
        deleteItemAtPosition(canvasX, canvasY);
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
    const canvasX = (pos.x - SIDE_PANEL_WIDTH - offset.x - ICON_SIZE / 2) / scale;
    const canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
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
        offsetX={ICON_SIZE / 2}
        offsetY={ICON_SIZE / 2}
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
    return;
  }

  // Handle drag and drop for other elements
  if (draggingFromPanel === 'team1' || draggingFromPanel === 'team2') {
    handleDropPlayerOnStage(pos, draggingFromPanel);
  } else if (draggingFromPanel === 'cone') {
    const canvasX = (pos.x - SIDE_PANEL_WIDTH - offset.x - ICON_SIZE / 2) / scale;
    const canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    pushHistory();
    setCones([...cones, {
      x: canvasX,
      y: canvasY,
      color: coneColor,
      size: coneSize
    }]);
  } else if (draggingFromPanel === 'football') {
    const canvasX = (pos.x - SIDE_PANEL_WIDTH - offset.x - ICON_SIZE / 2) / scale;
    const canvasY = (pos.y - offset.y - ICON_SIZE / 2) / scale;
    pushHistory();
    setFootballs(fbs => [...fbs, { id: getId(), x: canvasX, y: canvasY }]);
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
    <div style={{ 
      display: 'flex', 
      height: isMobile ? 'auto' : '100vh', 
      overflow: 'hidden', 
      alignItems: 'stretch',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Left Panel */}
      <LeftPanel
        SIDE_PANEL_WIDTH={SIDE_PANEL_WIDTH}
        background={background}
        setBackground={setBackground}
        setIsLineDrawingMode={setIsLineDrawingMode}
        setLineBarConfig={setLineBarConfig}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      {/* Field (Pitch) with equal horizontal spacing */}
      <div style={{ 
        flexGrow: 1, 
        margin: isMobile ? '5px 0' : '0 4px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        position: 'relative' 
      }}>
        <Stage
          width={isMobile ? window.innerWidth - 20 : Math.min(window.innerWidth - SIDE_PANEL_WIDTH * 2 - 8, 1100)}
          height={isMobile ? window.innerHeight * 0.6 : Math.min(window.innerHeight, 700)}
          onClick={handleStageClick}
          ref={stageRef}
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
            // Handle touch events for mobile
            if (draggingFromPanel) {
              const touch = e.evt.touches[0];
              const stage = e.target.getStage();
              const point = stage.getPointerPosition();
              setDragPosition(point);
            }
            handleStageMouseMove(e);
          }}
          onTouchEnd={handleStageMouseUp}
          onTouchStart={handleStageMouseDown}
          className={isDeleteMode ? 'scissors-cursor' : ''}
          style={{ 
            cursor: isDeleteMode ? 'crosshair' : (isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? 'crosshair' : 'default'),
            border: isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? '2px solid #2196F3' : 'none',
            borderRadius: isLineDrawingMode && lineBarConfig.mode !== 'cursor' ? '4px' : '0'
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


            {draggingFromPanel === 'cone' && dragPosition && (
                <RegularPolygon
                  x={(dragPosition.x - SIDE_PANEL_WIDTH - offset.x - ICON_SIZE / 2) / scale}
                  y={(dragPosition.y - offset.y - ICON_SIZE / 2) / scale}
                  sides={3}
                  radius={coneSizeToRadius[coneSize]}
                  fill={coneColor}
                  stroke="black"
                  strokeWidth={1}
                  opacity={0.6}
                  rotation={0}
                />
            )}
            {(draggingFromPanel === 'team1' || draggingFromPanel === 'team2') && dragPosition && (
                <Group
                  x={(dragPosition.x - SIDE_PANEL_WIDTH - offset.x - ICON_SIZE / 2) / scale}
                  y={(dragPosition.y - offset.y - ICON_SIZE / 2) / scale}
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
            )}
            {draggingFromPanel === 'line' && dragPosition && (
              <Arrow
                points={[
                  (dragPosition.x - SIDE_PANEL_WIDTH - offset.x - 40) / scale,
                  (dragPosition.y - offset.y) / scale,
                  (dragPosition.x - SIDE_PANEL_WIDTH - offset.x + 40) / scale,
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
            {draggingFromPanel === 'football' && dragPosition && (
              <Text
                text="⚽"
                fontSize={ICON_SIZE}
                x={(dragPosition.x - SIDE_PANEL_WIDTH - offset.x - ICON_SIZE / 2) / scale}
                y={(dragPosition.y - offset.y - ICON_SIZE / 2) / scale}
                opacity={0.6}
              />
            )}




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
        />
      </div>
      {/* Right Panel */}
      {!isMobile && (
        <RightPanel
          SIDE_PANEL_WIDTH={SIDE_PANEL_WIDTH}
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

      {/* Mobile Floating Toolbar */}
      {isMobile && (
        <div
          className="mobile-toolbar"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '50px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '2px solid #000000',
            padding: '10px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* Cone Tool */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              borderRadius: '50%',
              border: '2px solid #000000'
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setDraggingFromPanel('cone');
            }}
          >
            <svg width="30" height="30" viewBox="0 0 100 100">
              <polygon points="50,10 90,90 10,90" fill={coneColor} stroke="black" strokeWidth="4" />
            </svg>
          </div>

          {/* Team 1 Player */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              borderRadius: '50%',
              border: '2px solid #000000'
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setDraggingFromPanel('team1');
            }}
          >
            <svg width="30" height="30">
              <circle cx="15" cy="15" r="14" fill={playerColorTeam1} stroke="black" strokeWidth="1" />
              <text x="15" y="18" textAnchor="middle" fontSize="12" fill="black" fontWeight="bold">
                {nextPlayerNumberTeam1}
              </text>
            </svg>
          </div>

          {/* Team 2 Player */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              borderRadius: '50%',
              border: '2px solid #000000'
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setDraggingFromPanel('team2');
            }}
          >
            <svg width="30" height="30">
              <circle cx="15" cy="15" r="14" fill={playerColorTeam2} stroke="black" strokeWidth="1" />
              <text x="15" y="18" textAnchor="middle" fontSize="12" fill="black" fontWeight="bold">
                {nextPlayerNumberTeam2}
              </text>
            </svg>
          </div>

          {/* Football */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#f8f9fa',
              borderRadius: '50%',
              border: '2px solid #000000',
              fontSize: '30px'
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setDraggingFromPanel('football');
            }}
          >
            ⚽
          </div>

          {/* Undo Button */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#000000',
              borderRadius: '50%',
              border: '2px solid #000000',
              color: '#ffffff'
            }}
            onClick={undoLast}
            onTouchStart={(e) => {
              e.preventDefault();
              undoLast();
            }}
          >
            <FaUndo />
          </div>

          {/* Clear All Button */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#000000',
              borderRadius: '50%',
              border: '2px solid #000000',
              color: '#ffffff',
              fontSize: '12px',
              textAlign: 'center',
              padding: '5px'
            }}
            onClick={clearAllItems}
            onTouchStart={(e) => {
              e.preventDefault();
              clearAllItems();
            }}
          >
            Clear
          </div>

          {/* Settings Button */}
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: showMobileSettings ? '#2563eb' : '#000000',
              borderRadius: '50%',
              border: '2px solid #000000',
              color: '#ffffff',
              fontSize: '20px'
            }}
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            onTouchStart={(e) => {
              e.preventDefault();
              setShowMobileSettings(!showMobileSettings);
            }}
          >
            ⚙️
          </div>
        </div>
      )}

      {/* Mobile Settings Panel */}
      {isMobile && showMobileSettings && (
        <div
          className="mobile-settings-panel"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '2px solid #000000',
            padding: '15px',
            zIndex: 999,
            minWidth: '200px',
            maxWidth: '250px'
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Settings</h4>
          
          {/* Cone Color */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Cone Color:
            </label>
            <select
              value={coneColor}
              onChange={(e) => setConeColor(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
            </select>
          </div>

          {/* Cone Size */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Cone Size:
            </label>
            <select
              value={coneSize}
              onChange={(e) => setConeSize(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Team 1 Color */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Team 1 Color:
            </label>
            <select
              value={playerColorTeam1}
              onChange={(e) => setPlayerColorTeam1(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="#2563eb">Blue</option>
              <option value="#dc2626">Red</option>
              <option value="#16a34a">Green</option>
              <option value="#ca8a04">Yellow</option>
              <option value="#9333ea">Purple</option>
              <option value="#ea580c">Orange</option>
              <option value="#db2777">Pink</option>
              <option value="#6b7280">Gray</option>
            </select>
          </div>

          {/* Team 2 Color */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Team 2 Color:
            </label>
            <select
              value={playerColorTeam2}
              onChange={(e) => setPlayerColorTeam2(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="#2563eb">Blue</option>
              <option value="#dc2626">Red</option>
              <option value="#16a34a">Green</option>
              <option value="#ca8a04">Yellow</option>
              <option value="#9333ea">Purple</option>
              <option value="#ea580c">Orange</option>
              <option value="#db2777">Pink</option>
              <option value="#6b7280">Gray</option>
            </select>
          </div>

          {/* Delete Mode Toggle */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Delete Mode:
            </label>
            <button
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '2px solid #000000',
                backgroundColor: isDeleteMode ? '#ff4444' : '#ffffff',
                color: isDeleteMode ? '#ffffff' : '#000000',
                cursor: 'pointer'
              }}
            >
              {isDeleteMode ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default DrillDrawer;
