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
  
  // Convert screen coordinates to canvas coordinates
  const convertScreenToCanvas = useCallback((screenPoint: Point): Point => {
    // For now, simple conversion - can be enhanced with pan/zoom
    // Canvas is 800x600, screen might be different
    const scaleX = CANVAS_WIDTH / width;
    const scaleY = CANVAS_HEIGHT / height;
    return {
      x: screenPoint.x * scaleX,
      y: screenPoint.y * scaleY,
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

      console.log('Touch event:', { locationX, locationY, canvasPoint, dropMode, dropModeConfig });

      // Handle drop mode first (multi-drop icons)
      if (dropMode && dropModeConfig) {
        console.log('Adding item in drop mode:', dropMode, 'at', canvasPoint);
        switch (dropMode) {
          case 'player': {
            const { team, color, style, stripeColor, labelType, label, nextNumber } = dropModeConfig;
            let finalLabel = label || '';
            // Increment number if using number labels
            if (labelType === 'number' && nextNumber !== undefined) {
              finalLabel = nextNumber.toString();
              // Update the drop mode config with next number for next drop
              useAppStore.getState().setDropMode('player', {
                ...dropModeConfig,
                nextNumber: nextNumber + 1,
                label: finalLabel,
              });
            }
            addPlayer({
              x: canvasPoint.x,
              y: canvasPoint.y,
              team: team || 'team1',
              color: color || '#2563eb',
              style: style || 'solid',
              stripeColor: stripeColor || 'white',
              labelType: labelType || 'number',
              label: finalLabel,
            });
            return;
          }
          case 'cone': {
            const { coneColor, coneSize } = dropModeConfig;
            addCone({
              x: canvasPoint.x,
              y: canvasPoint.y,
              color: coneColor || 'orange',
              size: coneSize || 'medium',
            });
            return;
          }
          case 'goalpost': {
            addGoalPost({
              x: canvasPoint.x,
              y: canvasPoint.y,
            });
            return;
          }
          case 'ball': {
            addBall({
              x: canvasPoint.x,
              y: canvasPoint.y,
            });
            return;
          }
        }
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
    [convertScreenToCanvas, lineConfig.mode, startDrawing, handleTap, dropMode, dropModeConfig, addPlayer, addCone, addGoalPost, addBall]
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouchStart,
      onPanResponderMove: handleTouchMove,
      onPanResponderRelease: handleTouchEnd,
      onPanResponderTerminate: handleTouchEnd,
    })
  ).current;

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
    <View style={[styles.container, { width, height }]} {...panResponder.panHandlers}>
      {/* X button to exit drop mode */}
      {dropMode && (
        <TouchableOpacity
          style={styles.exitDropModeButton}
          onPress={clearDropMode}
          activeOpacity={0.7}
        >
          <Text style={styles.exitDropModeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
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
  exitDropModeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  exitDropModeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default DrawingCanvas;

