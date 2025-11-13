import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, GestureResponderEvent, TouchableOpacity, Text } from 'react-native';
import Svg, { Image as SvgImage, Line as SvgLine, Path, Rect, Polygon, Defs, Pattern } from 'react-native-svg';
import { useAppStore } from '../../store/appStore';
import { usePanZoom } from '../../hooks/usePanZoom';
import { useDrawing } from '../../hooks/useDrawing';
import { useSelection } from '../../hooks/useSelection';
import { Point, Line as LineType } from '../../types';
import PlayerIcon from '../Icons/PlayerIcon';
import ConeIcon from '../Icons/ConeIcon';
import GoalPostIcon from '../Icons/GoalPostIcon';
import BallIcon from '../Icons/BallIcon';
import { getArrowPoints } from '../../utils/drawingUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

interface DrawingCanvasProps {
  width?: number;
  height?: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = SCREEN_WIDTH,
  height = SCREEN_HEIGHT,
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

  const { screenToCanvas } = usePanZoom();
  const { handleTap } = useSelection();
  
  // Convert screen coordinates to canvas coordinates (viewBox coordinates)
  // SVG viewBox scales content to fit the viewport, so we need to account for that
  const convertScreenToCanvas = useCallback((screenPoint: Point): Point => {
    // SVG viewBox is 0 0 800 600
    // The SVG element is width x height
    // SVG uses preserveAspectRatio="xMidYMid meet" which means:
    // - Scale uniformly to fit the viewport
    // - Center the content
    
    const viewBoxWidth = CANVAS_WIDTH; // 800
    const viewBoxHeight = CANVAS_HEIGHT; // 600
    
    // Calculate the aspect ratios
    const viewBoxAspect = viewBoxWidth / viewBoxHeight; // 800/600 = 1.333
    const screenAspect = width / height;
    
    // Calculate the uniform scale (SVG scales to fit smaller dimension)
    let scale: number;
    let offsetX = 0;
    let offsetY = 0;
    
    if (screenAspect > viewBoxAspect) {
      // Screen is wider - fit to height, letterbox on sides
      scale = height / viewBoxHeight;
      const scaledWidth = viewBoxWidth * scale;
      offsetX = (width - scaledWidth) / 2;
    } else {
      // Screen is taller - fit to width, letterbox on top/bottom
      scale = width / viewBoxWidth;
      const scaledHeight = viewBoxHeight * scale;
      offsetY = (height - scaledHeight) / 2;
    }
    
    // Convert screen coordinates to viewBox coordinates
    // First subtract the offset, then divide by scale to get viewBox coords
    const viewBoxX = (screenPoint.x - offsetX) / scale;
    const viewBoxY = (screenPoint.y - offsetY) / scale;
    
    // Debug log for first few touches
    console.log('Coordinate conversion:', {
      screenPoint,
      width,
      height,
      viewBoxWidth,
      viewBoxHeight,
      screenAspect,
      viewBoxAspect,
      scale,
      offsetX,
      offsetY,
      viewBoxX,
      viewBoxY,
    });
    
    // Clamp to viewBox bounds
    return {
      x: Math.max(0, Math.min(viewBoxWidth, viewBoxX)),
      y: Math.max(0, Math.min(viewBoxHeight, viewBoxY)),
    };
  }, [width, height]);

  const { isDrawing, currentLine, startDrawing, updateDrawing, finishDrawing, cancelDrawing } =
    useDrawing(lineConfig.mode, lineConfig, boxConfig, (line) => {
      addLine(line);
    });

  const [draggingItem, setDraggingItem] = useState<{ id: string; type: string; offset: Point } | null>(null);


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
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const canvasPoint = convertScreenToCanvas({ x: locationX, y: locationY });

      // Check if tap is outside canvas bounds - if so, clear drop mode
      if (locationX < 0 || locationY < 0 || locationX > width || locationY > height) {
        const store = useAppStore.getState();
        if (store.dropMode) {
          console.log('Tap outside canvas, clearing drop mode');
          clearDropMode();
        }
        return;
      }

      // Handle drop mode first (multi-drop icons)
      // Get latest drop mode from store to ensure we have current values
      const store = useAppStore.getState();
      const currentDropMode = store.dropMode;
      const currentDropModeConfig = store.dropModeConfig;
      
      if (currentDropMode && currentDropModeConfig) {
        console.log('✓ Drop mode IS active, adding item...');
        console.log('Adding item in drop mode:', currentDropMode, 'at', canvasPoint);
        switch (currentDropMode) {
          case 'player': {
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
              x: canvasPoint.x,
              y: canvasPoint.y,
              team: team || 'team1',
              color: color || '#2563eb',
              style: style || 'solid',
              stripeColor: stripeColor || 'white',
              labelType: labelType || 'number',
              label: finalLabel,
            };
            console.log('Calling addPlayer with:', playerData);
            addPlayer(playerData);
            console.log('addPlayer called. Current players count:', useAppStore.getState().players.length);
            return;
          }
          case 'cone': {
            const { coneColor, coneSize } = currentDropModeConfig;
            const coneData = {
              x: canvasPoint.x,
              y: canvasPoint.y,
              color: coneColor || 'orange',
              size: coneSize || 'medium',
            };
            console.log('Calling addCone with:', coneData);
            addCone(coneData);
            console.log('addCone called. Current cones count:', useAppStore.getState().cones.length);
            return;
          }
          case 'goalpost': {
            const goalPostData = {
              x: canvasPoint.x,
              y: canvasPoint.y,
            };
            console.log('Calling addGoalPost with:', goalPostData);
            addGoalPost(goalPostData);
            console.log('addGoalPost called. Current goal posts count:', useAppStore.getState().goalPosts.length);
            return;
          }
          case 'ball': {
            const ballData = {
              x: canvasPoint.x,
              y: canvasPoint.y,
            };
            console.log('Calling addBall with:', ballData);
            addBall(ballData);
            console.log('addBall called. Current balls count:', useAppStore.getState().balls.length);
            return;
          }
        }
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
        let item: any = null;
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
    },
    [convertScreenToCanvas, lineConfig.mode, startDrawing, handleTap, addPlayer, addCone, addGoalPost, addBall]
  );

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
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

  // Recreate PanResponder when handlers change to ensure we have latest callbacks
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouchStart,
      onPanResponderMove: handleTouchMove,
      onPanResponderRelease: handleTouchEnd,
      onPanResponderTerminate: handleTouchEnd,
    })
  );

  // Update PanResponder handlers when they change
  React.useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouchStart,
      onPanResponderMove: handleTouchMove,
      onPanResponderRelease: handleTouchEnd,
      onPanResponderTerminate: handleTouchEnd,
    });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const renderLine = (line: LineType) => {
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
    <View style={[styles.container, { width, height }]} {...panResponder.current.panHandlers}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={styles.svg}
      >
        {background === 'white' ? (
          <Rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#FFFFFF" />
        ) : getBackgroundImageUri() ? (
          <SvgImage
            href={getBackgroundImageUri()}
            x="0"
            y="0"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <Rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#FFFFFF" />
        )}

        {/* Render lines */}
        {lines.map((line) => renderLine(line))}

        {/* Render current drawing line */}
        {currentLine && renderLine(currentLine as LineType)}

        {/* Render icons */}
        {players.map((player) => (
          <PlayerIcon key={player.id} player={player} selected={isSelected(player.id)} />
        ))}
        {cones.map((cone) => (
          <ConeIcon key={cone.id} cone={cone} selected={isSelected(cone.id)} />
        ))}
        {goalPosts.map((goalPost) => (
          <GoalPostIcon key={goalPost.id} goalPost={goalPost} selected={isSelected(goalPost.id)} />
        ))}
        {balls.map((ball) => (
          <BallIcon key={ball.id} ball={ball} selected={isSelected(ball.id)} />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  svg: {
    flex: 1,
  },
});

export default DrawingCanvas;

