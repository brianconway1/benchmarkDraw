import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import Svg, { Image as SvgImage, Line as SvgLine, Path, Rect, Polygon, Defs, Pattern, G } from 'react-native-svg';
import { useAppStore } from '../../store/appStore';
import { usePanZoom } from '../../hooks/usePanZoom';
import { useDrawing } from '../../hooks/useDrawing';
import { useSelection } from '../../hooks/useSelection';
import PlayerIcon from '../Icons/PlayerIcon';
import ConeIcon from '../Icons/ConeIcon';
import GoalPostIcon from '../Icons/GoalPostIcon';
import BallIcon from '../Icons/BallIcon';
import { getArrowPoints } from '../../utils/drawingUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
// Larger dimensions for Full Field, Blank, and White backgrounds
const LARGE_CANVAS_WIDTH = 1200;
const LARGE_CANVAS_HEIGHT = 900;

const DrawingCanvas = ({
  width = SCREEN_WIDTH,
  height = SCREEN_HEIGHT,
  isLandscape = false,
}) => {
  const background = useAppStore((state) => state.background);
  const players = useAppStore((state) => state.players);
  const cones = useAppStore((state) => state.cones);
  const goalPosts = useAppStore((state) => state.goalPosts);
  const balls = useAppStore((state) => state.balls);
  const lines = useAppStore((state) => state.lines);
  const lineConfig = useAppStore((state) => state.lineConfig);
  const boxConfig = useAppStore((state) => state.boxConfig);
  const addLine = useAppStore((state) => state.addLine);
  const isSelected = useAppStore((state) => state.isSelected);
  const dropMode = useAppStore((state) => state.dropMode);
  const dropModeConfig = useAppStore((state) => state.dropModeConfig);
  const addPlayer = useAppStore((state) => state.addPlayer);
  const addCone = useAppStore((state) => state.addCone);
  const addGoalPost = useAppStore((state) => state.addGoalPost);
  const addBall = useAppStore((state) => state.addBall);
  const clearDropMode = useAppStore((state) => state.clearDropMode);

  const { panZoom, handlePan, handleZoom } = usePanZoom();
  const { handleTap } = useSelection();
  
  // Animated values for pan and zoom
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Sync with panZoom state
  React.useEffect(() => {
    translateX.value = panZoom.translateX;
    translateY.value = panZoom.translateY;
    scale.value = panZoom.scale;
  }, [panZoom.translateX, panZoom.translateY, panZoom.scale]);
  
  // Update panZoom state from animated values (for coordinate conversion)
  const updatePanZoomState = useCallback((tx, ty, s) => {
    handlePan(tx - panZoom.translateX, ty - panZoom.translateY);
    handleZoom(s, undefined);
  }, [handlePan, handleZoom, panZoom]);
  
  // Convert screen coordinates to canvas coordinates (viewBox coordinates)
  // Accounts for SVG viewBox scaling AND pan/zoom transforms
  const convertScreenToCanvas = useCallback((screenPoint) => {
    try {
      // Validate input
      if (!screenPoint || typeof screenPoint.x !== 'number' || typeof screenPoint.y !== 'number') {
        console.error('Invalid screen point:', screenPoint);
        return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      }
      
      // SVG viewBox is 0 0 800 600
      // The SVG element is width x height
      // SVG uses preserveAspectRatio="xMidYMid meet" which means:
      // - Scale uniformly to fit the viewport
      // - Center the content
      
      const viewBoxWidth = CANVAS_WIDTH; // 800
      const viewBoxHeight = CANVAS_HEIGHT; // 600
      
      // Safety checks
      if (width <= 0 || height <= 0 || viewBoxWidth <= 0 || viewBoxHeight <= 0) {
        console.error('Invalid dimensions:', { width, height, viewBoxWidth, viewBoxHeight });
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
      }
      
      // Calculate the aspect ratios
      const viewBoxAspect = viewBoxWidth / viewBoxHeight; // 800/600 = 1.333
      const screenAspect = width / height;
      
      // Calculate the uniform scale (SVG scales to fit smaller dimension)
      let svgScale;
      let offsetX = 0;
      let offsetY = 0;
      
      if (screenAspect > viewBoxAspect) {
        // Screen is wider - fit to height, letterbox on sides
        svgScale = height / viewBoxHeight;
        const scaledWidth = viewBoxWidth * svgScale;
        offsetX = (width - scaledWidth) / 2;
      } else {
        // Screen is taller - fit to width, letterbox on top/bottom
        svgScale = width / viewBoxWidth;
        const scaledHeight = viewBoxHeight * svgScale;
        offsetY = (height - scaledHeight) / 2;
      }
      
      // Safety check for svgScale
      if (!isFinite(svgScale) || svgScale <= 0) {
        console.error('Invalid svgScale:', svgScale);
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
      }
      
      // Account for pan/zoom transforms
      const currentScale = scale.value;
      const currentTranslateX = translateX.value;
      const currentTranslateY = translateY.value;
      
      // Safety checks for transform values
      if (!isFinite(currentScale) || currentScale <= 0) {
        console.error('Invalid scale:', currentScale);
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
      }
      
      if (!isFinite(currentTranslateX) || !isFinite(currentTranslateY)) {
        console.error('Invalid translation:', { currentTranslateX, currentTranslateY });
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
      }
      
      // Convert screen coordinates to viewBox coordinates
      // First subtract the SVG offset, then divide by SVG scale, then account for pan/zoom
      const viewBoxX = ((screenPoint.x - offsetX) / svgScale - currentTranslateX) / currentScale;
      const viewBoxY = ((screenPoint.y - offsetY) / svgScale - currentTranslateY) / currentScale;
      
      // Validate result
      if (!isFinite(viewBoxX) || !isFinite(viewBoxY)) {
        console.error('Invalid viewBox coordinates:', { viewBoxX, viewBoxY });
        return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
      }
      
      // Clamp to viewBox bounds
      return {
        x: Math.max(0, Math.min(viewBoxWidth, viewBoxX)),
        y: Math.max(0, Math.min(viewBoxHeight, viewBoxY)),
      };
    } catch (error) {
      console.error('Error in convertScreenToCanvas:', error);
      return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    }
  }, [width, height, scale, translateX, translateY]);

  const { isDrawing, currentLine, startDrawing, updateDrawing, finishDrawing, cancelDrawing } =
    useDrawing(lineConfig.mode, lineConfig, boxConfig, (line) => {
      addLine(line);
    });

  const [draggingItem, setDraggingItem] = useState(null);
  
  // Shared values for pinch gesture
  const lastPinchScale = useSharedValue(1);
  const pinchFocalPoint = useSharedValue(null);
  const baseScale = useSharedValue(1);
  
  // Smooth zoom limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3.0;

  // Pinch gesture for zooming with smoothed transitions
  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      'worklet';
      // Safety check - ensure valid dimensions
      if (width <= 0 || height <= 0 || CANVAS_WIDTH <= 0 || CANVAS_HEIGHT <= 0) {
        return;
      }
      
      // Store the starting scale when pinch begins
      const currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
      baseScale.value = currentScale;
      lastPinchScale.value = currentScale;
      
      // Calculate SVG scale and offsets for proper coordinate conversion
      const viewBoxAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      const screenAspect = width / height;
      let svgScale;
      let offsetX = 0;
      let offsetY = 0;
      
      if (screenAspect > viewBoxAspect) {
        // Screen is wider - fit to height, letterbox on sides
        svgScale = height / CANVAS_HEIGHT;
        const scaledWidth = CANVAS_WIDTH * svgScale;
        offsetX = (width - scaledWidth) / 2;
      } else {
        // Screen is taller - fit to width, letterbox on top/bottom
        svgScale = width / CANVAS_WIDTH;
        const scaledHeight = CANVAS_HEIGHT * svgScale;
        offsetY = (height - scaledHeight) / 2;
      }
      
      // Safety check for svgScale
      if (svgScale <= 0 || currentScale <= 0) {
        return;
      }
      
      // Convert focal point from screen coordinates to viewBox coordinates
      // Simplified approach: account for all transforms in reverse
      const screenPointX = e.focalX;
      const screenPointY = e.focalY;
      
      // Account for SVG offset
      const screenX = screenPointX - offsetX;
      const screenY = screenPointY - offsetY;
      
      // Account for transform center
      const centeredX = screenX - width / 2;
      const centeredY = screenY - height / 2;
      
      // Reverse scale
      const unscaledX = centeredX / currentScale;
      const unscaledY = centeredY / currentScale;
      
      // Reverse translate (add back center, then subtract pan)
      const untranslatedX = unscaledX + width / 2 - translateX.value * svgScale;
      const untranslatedY = unscaledY + height / 2 - translateY.value * svgScale;
      
      // Convert to viewBox coordinates
      const viewBoxFocalX = untranslatedX / svgScale;
      const viewBoxFocalY = untranslatedY / svgScale;
      
      // Clamp to viewBox bounds and store
      pinchFocalPoint.value = {
        x: Math.max(0, Math.min(CANVAS_WIDTH, viewBoxFocalX)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT, viewBoxFocalY)),
      };
    })
    .onUpdate((e) => {
      'worklet';
      // Safety check - ensure valid dimensions
      if (width <= 0 || height <= 0 || CANVAS_WIDTH <= 0 || CANVAS_HEIGHT <= 0) {
        return;
      }
      
      // Calculate SVG scale and offsets
      const viewBoxAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      const screenAspect = width / height;
      let svgScale;
      let offsetX = 0;
      let offsetY = 0;
      
      if (screenAspect > viewBoxAspect) {
        svgScale = height / CANVAS_HEIGHT;
        const scaledWidth = CANVAS_WIDTH * svgScale;
        offsetX = (width - scaledWidth) / 2;
      } else {
        svgScale = width / CANVAS_WIDTH;
        const scaledHeight = CANVAS_HEIGHT * svgScale;
        offsetY = (height - scaledHeight) / 2;
      }
      
      // Safety check for svgScale
      if (svgScale <= 0 || !isFinite(svgScale)) {
        return;
      }
      
      // Calculate new scale with clamping
      const currentScaleValue = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
      const newScale = baseScale.value * e.scale;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      
      // Apply smooth damping for more controlled zoom
      const scaleDiff = clampedScale - currentScaleValue;
      const dampedScale = currentScaleValue + scaleDiff * 0.85; // 85% damping for smoother feel
      const finalScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, dampedScale));
      
      // Ensure final scale is valid
      if (!isFinite(finalScale) || finalScale <= 0) {
        return;
      }
      
      // Zoom towards focal point - keep the focal point at the same screen position
      if (pinchFocalPoint.value && Math.abs(finalScale - currentScaleValue) > 0.001) {
        const fp = pinchFocalPoint.value;
        
        // Current screen position of focal point (with old scale)
        const viewBoxInScreenX = fp.x * svgScale;
        const viewBoxInScreenY = fp.y * svgScale;
        const centeredX = viewBoxInScreenX - width / 2;
        const centeredY = viewBoxInScreenY - height / 2;
        const scaledX = centeredX * currentScaleValue;
        const scaledY = centeredY * currentScaleValue;
        const currentScreenX = offsetX + width / 2 + scaledX + translateX.value * svgScale;
        const currentScreenY = offsetY + height / 2 + scaledY + translateY.value * svgScale;
        
        // Screen position with new scale (without adjusting translation)
        const newScaledX = centeredX * finalScale;
        const newScaledY = centeredY * finalScale;
        const newScreenXWithoutAdjust = offsetX + width / 2 + newScaledX + translateX.value * svgScale;
        const newScreenYWithoutAdjust = offsetY + height / 2 + newScaledY + translateY.value * svgScale;
        
        // Calculate the difference
        const deltaScreenX = currentScreenX - newScreenXWithoutAdjust;
        const deltaScreenY = currentScreenY - newScreenYWithoutAdjust;
        
        // Convert screen delta to viewBox translation delta
        if (isFinite(deltaScreenX) && isFinite(deltaScreenY) && finalScale > 0 && svgScale > 0) {
          const viewBoxDeltaX = (deltaScreenX / finalScale) / svgScale;
          const viewBoxDeltaY = (deltaScreenY / finalScale) / svgScale;
          
          // Adjust translation to keep focal point fixed (with bounds checking)
          if (isFinite(viewBoxDeltaX) && isFinite(viewBoxDeltaY)) {
            translateX.value = translateX.value + viewBoxDeltaX;
            translateY.value = translateY.value + viewBoxDeltaY;
          }
        }
      }
      
      // Update scale value
      if (isFinite(finalScale)) {
        scale.value = finalScale;
      }
    })
    .onEnd(() => {
      'worklet';
      // Safety check - ensure valid scale
      const currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
      if (!isFinite(currentScale) || currentScale <= 0) {
        return;
      }
      
      // Snap to final scale with spring animation for smooth finish
      const finalScale = currentScale;
      
      // Smooth the final scale if it's close to limits
      if (finalScale < MIN_SCALE + 0.1) {
        scale.value = withSpring(MIN_SCALE, {
          damping: 20,
          stiffness: 100,
        });
        lastPinchScale.value = MIN_SCALE;
        baseScale.value = MIN_SCALE;
      } else if (finalScale > MAX_SCALE - 0.1) {
        scale.value = withSpring(MAX_SCALE, {
          damping: 20,
          stiffness: 100,
        });
        lastPinchScale.value = MAX_SCALE;
        baseScale.value = MAX_SCALE;
      } else {
        scale.value = withSpring(finalScale, {
          damping: 20,
          stiffness: 150,
        });
        lastPinchScale.value = finalScale;
        baseScale.value = finalScale;
      }
      
      pinchFocalPoint.value = null;
      
      // Update panZoom state after animation (with safety check)
      if (isFinite(translateX.value) && isFinite(translateY.value) && isFinite(scale.value)) {
        runOnJS(updatePanZoomState)(translateX.value, translateY.value, scale.value);
      }
    });

  // Pan gesture for dragging canvas with smoother movement
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .activeOffsetX(10) // Require 10px movement before activating pan
    .activeOffsetY(10) // Require 10px movement before activating pan
    .onUpdate((e) => {
      'worklet';
      // Safety check - ensure valid dimensions
      if (width <= 0 || height <= 0 || CANVAS_WIDTH <= 0 || CANVAS_HEIGHT <= 0) {
        return;
      }
      
      // Calculate SVG scale for coordinate conversion
      const viewBoxAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      const screenAspect = width / height;
      let svgScale;
      
      if (screenAspect > viewBoxAspect) {
        svgScale = height / CANVAS_HEIGHT;
      } else {
        svgScale = width / CANVAS_WIDTH;
      }
      
      // Safety check for svgScale
      if (svgScale <= 0 || !isFinite(svgScale)) {
        return;
      }
      
      const currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
      if (currentScale <= 0 || !isFinite(currentScale)) {
        return;
      }
      
      // Convert pan distance to viewBox coordinates
      // Pan distance is in screen pixels, convert to viewBox units
      const deltaX = e.changeX / svgScale / currentScale;
      const deltaY = e.changeY / svgScale / currentScale;
      
      // Safety check for deltas
      if (isFinite(deltaX) && isFinite(deltaY)) {
        // Apply pan with 95% smoothing for better feel
        const newTranslateX = translateX.value + deltaX * 0.95;
        const newTranslateY = translateY.value + deltaY * 0.95;
        
        if (isFinite(newTranslateX) && isFinite(newTranslateY)) {
          translateX.value = newTranslateX;
          translateY.value = newTranslateY;
        }
      }
    })
    .onEnd(() => {
      'worklet';
      // Safety check before updating state
      if (isFinite(translateX.value) && isFinite(translateY.value) && isFinite(scale.value)) {
        runOnJS(updatePanZoomState)(translateX.value, translateY.value, scale.value);
      }
    });

  // Combine gestures - pinch and pan can work simultaneously
  const panAndPinchGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const getBackgroundImageUri = () => {
    switch (background) {
      case 'pitch_blank':
        return require('../../assets/images/pitch_blank.png');
      case 'pitch_full':
        return require('../../assets/images/pitch_full.png');
      case 'pitch_half':
        return require('../../assets/images/pitch_half.png');
      default:
        return null;
    }
  };

  const handleTouchStart = useCallback(
    (event) => {
      try {
        // Don't process touches if we're panning/zooming
        // Let gesture handlers take priority
        if (!event || !event.nativeEvent) {
          console.error('Invalid event in handleTouchStart:', event);
          return;
        }
        
        const { locationX, locationY } = event.nativeEvent;
        
        // Validate coordinates
        if (typeof locationX !== 'number' || typeof locationY !== 'number') {
          console.error('Invalid coordinates in handleTouchStart:', { locationX, locationY });
          return;
        }
        
        if (!isFinite(locationX) || !isFinite(locationY)) {
          console.error('Non-finite coordinates in handleTouchStart:', { locationX, locationY });
          return;
        }
        
        console.log('handleTouchStart called with:', { locationX, locationY, width, height });
        
        const canvasPoint = convertScreenToCanvas({ x: locationX, y: locationY });
        console.log('Converted to canvas point:', canvasPoint);

        // Check if tap is outside canvas bounds - if so, clear drop mode
        if (locationX < 0 || locationY < 0 || locationX > width || locationY > height) {
          console.log('Tap outside canvas bounds, clearing drop mode');
          const store = useAppStore.getState();
          if (store.dropMode) {
            clearDropMode();
          }
          return;
        }

        // Handle drop mode first (multi-drop icons)
        // Get latest drop mode from store to ensure we have current values
        const store = useAppStore.getState();
        const currentDropMode = store.dropMode;
        const currentDropModeConfig = store.dropModeConfig;
        console.log('Current drop mode state:', { currentDropMode, hasConfig: !!currentDropModeConfig });
        
        if (currentDropMode) {
          // Validate canvas point
          if (!canvasPoint || typeof canvasPoint.x !== 'number' || typeof canvasPoint.y !== 'number') {
            console.error('Invalid canvas point (null/undefined):', canvasPoint);
            return;
          }
          
          if (!isFinite(canvasPoint.x) || !isFinite(canvasPoint.y)) {
            console.error('Invalid canvas point (non-finite):', canvasPoint);
            return;
          }
          
          // Clamp coordinates to valid range
          const clampedX = Math.max(0, Math.min(CANVAS_WIDTH, canvasPoint.x));
          const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT, canvasPoint.y));
          
          console.log('✓ Drop mode IS active, adding item...');
          console.log('Adding item in drop mode:', currentDropMode, 'at', { x: clampedX, y: clampedY });
          
          try {
            switch (currentDropMode) {
              case 'player': {
                if (!currentDropModeConfig) {
                  console.error('Player drop mode config is missing');
                  return;
                }
                const { team, color, style, stripeColor, labelType, label, nextNumber } = currentDropModeConfig;
                let finalLabel = label || '';
                // Increment number if using number labels
                if (labelType === 'number' && nextNumber !== undefined) {
                  finalLabel = nextNumber.toString();
                  // Update the drop mode config with next number for next drop
                  useAppStore.getState().setDropMode('player', {
                    ...currentDropModeConfig,
                    nextNumber: nextNumber + 1,
                    label: finalLabel,
                  });
                }
                const playerData = {
                  x: clampedX,
                  y: clampedY,
                  team: team || 'team1',
                  color: color || '#2563eb',
                  style: style || 'solid',
                  stripeColor: stripeColor || 'white',
                  labelType: labelType || 'number',
                  label: finalLabel,
                };
                console.log('Calling addPlayer with:', playerData);
                try {
                  addPlayer(playerData);
                  console.log('addPlayer called successfully. Current players count:', useAppStore.getState().players.length);
                } catch (addError) {
                  console.error('Error calling addPlayer:', addError);
                  // Don't re-throw - just log and return to prevent crash
                  return;
                }
                return;
              }
              case 'cone': {
                if (!currentDropModeConfig) {
                  console.error('Cone drop mode config is missing');
                  return;
                }
                const { coneColor, coneSize } = currentDropModeConfig;
                const coneData = {
                  x: clampedX,
                  y: clampedY,
                  color: coneColor || 'orange',
                  size: coneSize || 'medium',
                };
                console.log('Calling addCone with:', coneData);
                try {
                  addCone(coneData);
                  console.log('addCone called. Current cones count:', useAppStore.getState().cones.length);
                } catch (addError) {
                  console.error('Error calling addCone:', addError);
                  return;
                }
                return;
              }
              case 'goalpost': {
                const goalPostData = {
                  x: clampedX,
                  y: clampedY,
                };
                console.log('Calling addGoalPost with:', goalPostData);
                try {
                  addGoalPost(goalPostData);
                  console.log('addGoalPost called. Current goal posts count:', useAppStore.getState().goalPosts.length);
                } catch (addError) {
                  console.error('Error calling addGoalPost:', addError);
                  return;
                }
                return;
              }
              case 'ball': {
                const ballData = {
                  x: clampedX,
                  y: clampedY,
                };
                console.log('Calling addBall with:', ballData);
                try {
                  addBall(ballData);
                  console.log('addBall called. Current balls count:', useAppStore.getState().balls.length);
                } catch (addError) {
                  console.error('Error calling addBall:', addError);
                  return;
                }
                return;
              }
              default:
                console.error('Unknown drop mode:', currentDropMode);
                return;
            }
          } catch (error) {
            console.error('Error adding item in drop mode:', error);
            // Clear drop mode on error to prevent stuck state
            clearDropMode();
          }
          return; // Exit early after handling drop mode
        } else {
          console.log('✗ Drop mode NOT active. currentDropMode:', currentDropMode, 'currentDropModeConfig:', currentDropModeConfig);
        }

        if (lineConfig.mode !== 'cursor') {
          startDrawing(canvasPoint);
          return;
        }

        // Check if tapping on an item
        const itemId = handleTap(canvasPoint, false);
        if (itemId) {
          // Start dragging
          let item = null;
          let type = '';

          const allPlayers = useAppStore.getState().players;
          const allCones = useAppStore.getState().cones;
          const allGoalPosts = useAppStore.getState().goalPosts;
          const allBalls = useAppStore.getState().balls;

          allPlayers.forEach((p) => {
            if (p.id === itemId) {
              item = p;
              type = 'player';
            }
          });
          allCones.forEach((c) => {
            if (c.id === itemId) {
              item = c;
              type = 'cone';
            }
          });
          allGoalPosts.forEach((g) => {
            if (g.id === itemId) {
              item = g;
              type = 'goalpost';
            }
          });
          allBalls.forEach((b) => {
            if (b.id === itemId) {
              item = b;
              type = 'ball';
            }
          });

          if (item) {
            setDraggingItem({
              id: itemId,
              type,
              offset: {
                x: canvasPoint.x - item.x,
                y: canvasPoint.y - item.y,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error in handleTouchStart:', error);
        // Clear drop mode on error to prevent stuck state
        const store = useAppStore.getState();
        if (store.dropMode) {
          clearDropMode();
        }
      }
    },
    [convertScreenToCanvas, lineConfig.mode, startDrawing, handleTap, addPlayer, addCone, addGoalPost, addBall, clearDropMode]
  );

  // Handle touch move for drawing and dragging (called from gesture handler)
  const handleTouchMoveGesture = useCallback((e) => {
    const canvasPoint = convertScreenToCanvas({ x: e.x, y: e.y });

    if (isDrawing) {
      updateDrawing(canvasPoint);
      return;
    }

    if (draggingItem) {
      const newX = canvasPoint.x - draggingItem.offset.x;
      const newY = canvasPoint.y - draggingItem.offset.y;

      const store = useAppStore.getState();
      switch (draggingItem.type) {
        case 'player':
          store.updatePlayer(draggingItem.id, { x: newX, y: newY });
          break;
        case 'cone':
          store.updateCone(draggingItem.id, { x: newX, y: newY });
          break;
        case 'goalpost':
          store.updateGoalPost(draggingItem.id, { x: newX, y: newY });
          break;
        case 'ball':
          store.updateBall(draggingItem.id, { x: newX, y: newY });
          break;
      }
    }
  }, [convertScreenToCanvas, isDrawing, updateDrawing, draggingItem]);

  const handleTouchMove = useCallback(
    (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const canvasPoint = convertScreenToCanvas({ x: locationX, y: locationY });

      if (isDrawing) {
        updateDrawing(canvasPoint);
        return;
      }

      if (draggingItem) {
        const newX = canvasPoint.x - draggingItem.offset.x;
        const newY = canvasPoint.y - draggingItem.offset.y;

        const store = useAppStore.getState();
        switch (draggingItem.type) {
          case 'player':
            store.updatePlayer(draggingItem.id, { x: newX, y: newY });
            break;
          case 'cone':
            store.updateCone(draggingItem.id, { x: newX, y: newY });
            break;
          case 'goalpost':
            store.updateGoalPost(draggingItem.id, { x: newX, y: newY });
            break;
          case 'ball':
            store.updateBall(draggingItem.id, { x: newX, y: newY });
            break;
        }
      }
    },
    [convertScreenToCanvas, isDrawing, updateDrawing, draggingItem]
  );

  const handleTouchEnd = useCallback(() => {
    if (isDrawing) {
      finishDrawing();
    }
    setDraggingItem(null);
  }, [isDrawing, finishDrawing]);

  // Tap gesture for item selection and drop mode
  // Use a stable reference for the handler
  const handleTapGesture = useCallback((x, y) => {
    console.log('handleTapGesture called with:', { x, y });
    try {
      handleTouchStart({ nativeEvent: { locationX: x, locationY: y } });
    } catch (error) {
      console.error('Error in handleTapGesture:', error);
    }
  }, [handleTouchStart]);

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      'worklet';
      // Validate coordinates before passing to JS
      const x = e.x;
      const y = e.y;
      // Check if coordinates are valid numbers (worklet-safe check)
      if (typeof x === 'number' && typeof y === 'number' && x === x && y === y) {
        runOnJS(handleTapGesture)(x, y);
      } else {
        console.error('Invalid tap coordinates in worklet:', { x, y });
      }
    });
  
  // Pan gesture for dragging items (single finger, when tapping on item)
  const itemDragGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .activeOffsetX(5) // Require less movement for item dragging
    .activeOffsetY(5)
    .onStart((e) => {
      'worklet';
      // Check if we're dragging an item
      if (draggingItem) {
        return;
      }
      runOnJS(() => {
        const canvasPoint = convertScreenToCanvas({ x: e.x, y: e.y });
        const itemId = handleTap(canvasPoint, false);
        if (itemId) {
          const allPlayers = useAppStore.getState().players;
          const allCones = useAppStore.getState().cones;
          const allGoalPosts = useAppStore.getState().goalPosts;
          const allBalls = useAppStore.getState().balls;

          let item = null;
          let type = '';

          allPlayers.forEach((p) => {
            if (p.id === itemId) {
              item = p;
              type = 'player';
            }
          });
          allCones.forEach((c) => {
            if (c.id === itemId) {
              item = c;
              type = 'cone';
            }
          });
          allGoalPosts.forEach((g) => {
            if (g.id === itemId) {
              item = g;
              type = 'goalpost';
            }
          });
          allBalls.forEach((b) => {
            if (b.id === itemId) {
              item = b;
              type = 'ball';
            }
          });

          if (item) {
            setDraggingItem({
              id: itemId,
              type,
              offset: {
                x: canvasPoint.x - item.x,
                y: canvasPoint.y - item.y,
              },
            });
          }
        }
      })();
    })
    .onUpdate((e) => {
      'worklet';
      if (draggingItem) {
        runOnJS(() => {
          const canvasPoint = convertScreenToCanvas({ x: e.x, y: e.y });
          handleTouchMoveGesture(canvasPoint);
        })();
      }
    })
    .onEnd(() => {
      'worklet';
      if (draggingItem) {
        runOnJS(() => {
          setDraggingItem(null);
        })();
      }
    });

  // Combine all gestures
  // Tap and item drag race - whichever wins first
  // Pan and pinch work simultaneously but only if tap/itemDrag don't activate
  // Use Simultaneous to allow all, but tap/itemDrag have lower activeOffset so they activate first
  const allGestures = Gesture.Simultaneous(
    tapGesture,
    itemDragGesture,
    panAndPinchGesture
  );
  
  // Animated transform for SVG content with interpolation
  const animatedTransform = useAnimatedStyle(() => {
    'worklet';
    // Safety checks
    if (width <= 0 || height <= 0 || CANVAS_WIDTH <= 0 || CANVAS_HEIGHT <= 0) {
      return { transform: [] };
    }
    
    // Calculate SVG scale and offsets for proper coordinate conversion
    // SVG auto-centers via preserveAspectRatio="xMidYMid meet"
    const viewBoxAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    const screenAspect = width / height;
    let svgScale;
    
    if (screenAspect > viewBoxAspect) {
      // Screen is wider - fit to height, letterbox on sides
      svgScale = height / CANVAS_HEIGHT;
    } else {
      // Screen is taller - fit to width, letterbox on top/bottom
      svgScale = width / CANVAS_WIDTH;
    }
    
    // Safety check for svgScale
    if (svgScale <= 0 || !isFinite(svgScale)) {
      return { transform: [] };
    }
    
    // Clamp scale for safety
    const currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value));
    if (!isFinite(currentScale) || currentScale <= 0) {
      return { transform: [] };
    }
    
    // Get translation values with safety checks
    const currentTranslateX = isFinite(translateX.value) ? translateX.value : 0;
    const currentTranslateY = isFinite(translateY.value) ? translateY.value : 0;
    
    // Transform origin is at center for proper zoom behavior
    // SVG is already centered by preserveAspectRatio, we just apply zoom and pan
    return {
      transform: [
        { translateX: width / 2 },
        { translateY: height / 2 },
        { scale: currentScale },
        { translateX: -width / 2 + currentTranslateX * svgScale },
        { translateY: -height / 2 + currentTranslateY * svgScale },
      ],
    };
  });

  const renderLine = (line) => {
    const selected = isSelected(line.id);

    if (line.type === 'straight' && line.points.length >= 2) {
      const p1 = line.points[0];
      const p2 = line.points[line.points.length - 1];
      return (
        <React.Fragment key={line.id}>
          <SvgLine
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={line.color}
            strokeWidth={line.thickness}
            strokeDasharray={line.dash.join(' ')}
          />
          {line.arrowStart && (
            <Polygon
              points={getArrowPoints(p2, p1)}
              fill={line.color}
            />
          )}
          {line.arrowEnd && (
            <Polygon
              points={getArrowPoints(p1, p2)}
              fill={line.color}
            />
          )}
        </React.Fragment>
      );
    } else if (line.type === 'curve' && line.points.length >= 2 && line.controlPoint) {
      const p1 = line.points[0];
      const p2 = line.points[line.points.length - 1];
      const cp = line.controlPoint;
      const path = `M ${p1.x} ${p1.y} Q ${cp.x} ${cp.y} ${p2.x} ${p2.y}`;
      return (
        <React.Fragment key={line.id}>
          <Path
            d={path}
            stroke={line.color}
            strokeWidth={line.thickness}
            strokeDasharray={line.dash.join(' ')}
            fill="none"
          />
          {line.arrowStart && (
            <Polygon
              points={getArrowPoints(p2, p1)}
              fill={line.color}
            />
          )}
          {line.arrowEnd && (
            <Polygon
              points={getArrowPoints(p1, p2)}
              fill={line.color}
            />
          )}
        </React.Fragment>
      );
    } else if (line.type === 'free' && line.points.length >= 2) {
      const pathData = line.points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ');
      return (
        <Path
          key={line.id}
          d={pathData}
          stroke={line.color}
          strokeWidth={line.thickness}
          strokeDasharray={line.dash.join(' ')}
          fill="none"
        />
      );
    } else if (line.type === 'rectangle' && line.points.length >= 4) {
      const bounds = {
        x: Math.min(...line.points.map((p) => p.x)),
        y: Math.min(...line.points.map((p) => p.y)),
        width: Math.max(...line.points.map((p) => p.x)) - Math.min(...line.points.map((p) => p.x)),
        height: Math.max(...line.points.map((p) => p.y)) - Math.min(...line.points.map((p) => p.y)),
      };
      return (
        <Rect
          key={line.id}
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          fill={line.filled ? line.fillColor || line.color : 'none'}
          stroke={line.color}
          strokeWidth={line.thickness}
          strokeDasharray={line.dash.join(' ')}
        />
      );
    }
    return null;
  };


  // Debug: Log drop mode state
  React.useEffect(() => {
    if (dropMode) {
      console.log('Drop mode active:', dropMode, dropModeConfig);
    }
  }, [dropMode, dropModeConfig]);

  // Debug: Log players count
  React.useEffect(() => {
    console.log('Players count:', players.length, 'Cones:', cones.length, 'Goals:', goalPosts.length, 'Balls:', balls.length);
  }, [players.length, cones.length, goalPosts.length, balls.length]);

  return (
    <GestureDetector gesture={allGestures}>
      <Animated.View style={[styles.container, { width, height }]}>
        <Animated.View style={[styles.svgContainer, { width, height }, animatedTransform]}>
          <Svg
            width={width}
            height={height}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            style={styles.svg}
          >
            <G>
        {(() => {
          // Use larger dimensions for Full Field, Blank, and White (but NOT half-field)
          const isLargeBackground = background === 'pitch_full' || background === 'pitch_blank' || background === 'white';
          
          // Rotate pitch_full, pitch_blank, and white 90 degrees (but NOT pitch_half)
          const shouldRotate = isLargeBackground;
          
          // For pitch_half, use larger dimensions in landscape to fill screen better
          let imageWidth, imageHeight;
          if (background === 'pitch_half') {
            if (isLandscape) {
              // Make half field larger in landscape to fill screen better
              imageWidth = 1000;
              imageHeight = 600;
            } else {
              // Portrait: use standard size
              imageWidth = CANVAS_WIDTH;
              imageHeight = CANVAS_HEIGHT;
            }
          } else if (isLargeBackground) {
            imageWidth = LARGE_CANVAS_WIDTH;
            imageHeight = LARGE_CANVAS_HEIGHT;
          } else {
            imageWidth = CANVAS_WIDTH;
            imageHeight = CANVAS_HEIGHT;
          }
          
          // Calculate offset to center the larger image within the viewBox
          const offsetX = (CANVAS_WIDTH - imageWidth) / 2;
          const offsetY = (CANVAS_HEIGHT - imageHeight) / 2;
          
          // Rotation center point (center of the image)
          const rotationCenterX = imageWidth / 2;
          const rotationCenterY = imageHeight / 2;
          
          if (background === 'white') {
            return shouldRotate ? (
              <G transform={`translate(${offsetX}, ${offsetY}) rotate(90 ${rotationCenterX} ${rotationCenterY})`}>
                <Rect x="0" y="0" width={imageWidth} height={imageHeight} fill="#FFFFFF" />
              </G>
            ) : (
              <G transform={`translate(${offsetX}, ${offsetY})`}>
                <Rect x="0" y="0" width={imageWidth} height={imageHeight} fill="#FFFFFF" />
              </G>
            );
          } else if (getBackgroundImageUri()) {
            return shouldRotate ? (
              <G transform={`translate(${offsetX}, ${offsetY}) rotate(90 ${rotationCenterX} ${rotationCenterY})`}>
                <SvgImage
                  href={getBackgroundImageUri()}
                  x="0"
                  y="0"
                  width={imageWidth}
                  height={imageHeight}
                  preserveAspectRatio="xMidYMid meet"
                />
              </G>
            ) : (
              <G transform={`translate(${offsetX}, ${offsetY})`}>
                <SvgImage
                  href={getBackgroundImageUri()}
                  x="0"
                  y="0"
                  width={imageWidth}
                  height={imageHeight}
                  preserveAspectRatio="xMidYMid meet"
                />
              </G>
            );
          } else {
            return shouldRotate ? (
              <G transform={`translate(${offsetX}, ${offsetY}) rotate(90 ${rotationCenterX} ${rotationCenterY})`}>
                <Rect x="0" y="0" width={imageWidth} height={imageHeight} fill="#FFFFFF" />
              </G>
            ) : (
              <G transform={`translate(${offsetX}, ${offsetY})`}>
                <Rect x="0" y="0" width={imageWidth} height={imageHeight} fill="#FFFFFF" />
              </G>
            );
          }
        })()}

        {/* Render lines */}
        {lines.map((line) => renderLine(line))}

        {/* Render current drawing line */}
        {currentLine && renderLine(currentLine)}

        {/* Render icons */}
        {players.filter(p => p && p.id && typeof p.x === 'number' && typeof p.y === 'number').map((player) => (
          <PlayerIcon key={player.id} player={player} selected={isSelected(player.id)} />
        ))}
        {cones.filter(c => c && c.id && typeof c.x === 'number' && typeof c.y === 'number').map((cone) => (
          <ConeIcon key={cone.id} cone={cone} selected={isSelected(cone.id)} />
        ))}
        {goalPosts.filter(g => g && g.id && typeof g.x === 'number' && typeof g.y === 'number').map((goalPost) => (
          <GoalPostIcon key={goalPost.id} goalPost={goalPost} selected={isSelected(goalPost.id)} />
        ))}
        {balls.filter(b => b && b.id && typeof b.x === 'number' && typeof b.y === 'number').map((ball) => (
          <BallIcon key={ball.id} ball={ball} selected={isSelected(ball.id)} />
        ))}
            </G>
          </Svg>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    overflow: 'hidden',
  },
  svg: {
    flex: 1,
  },
});

export default DrawingCanvas;
