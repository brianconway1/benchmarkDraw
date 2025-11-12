import { useState, useCallback } from 'react';
import { PanZoomState, Point } from '../types';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const DEFAULT_SCALE = 1.0;

export const usePanZoom = () => {
  const [panZoom, setPanZoom] = useState<PanZoomState>({
    scale: DEFAULT_SCALE,
    translateX: 0,
    translateY: 0,
  });

  const handlePan = useCallback((dx: number, dy: number) => {
    setPanZoom((prev) => ({
      ...prev,
      translateX: prev.translateX + dx / prev.scale,
      translateY: prev.translateY + dy / prev.scale,
    }));
  }, []);

  const handleZoom = useCallback((scale: number, focalPoint?: Point) => {
    setPanZoom((prev) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
      if (!focalPoint) {
        return { ...prev, scale: newScale };
      }

      // Zoom towards focal point
      const zoomFactor = newScale / prev.scale;
      const newTranslateX = focalPoint.x - (focalPoint.x - prev.translateX) * zoomFactor;
      const newTranslateY = focalPoint.y - (focalPoint.y - prev.translateY) * zoomFactor;

      return {
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setPanZoom({
      scale: DEFAULT_SCALE,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  const screenToCanvas = useCallback(
    (screenPoint: Point): Point => {
      // Simple conversion - can be enhanced with pan/zoom later
      return {
        x: screenPoint.x,
        y: screenPoint.y,
      };
    },
    []
  );

  const canvasToScreen = useCallback(
    (canvasPoint: Point): Point => {
      return {
        x: (canvasPoint.x + panZoom.translateX) * panZoom.scale,
        y: (canvasPoint.y + panZoom.translateY) * panZoom.scale,
      };
    },
    [panZoom]
  );

  return {
    panZoom,
    handlePan,
    handleZoom,
    resetZoom,
    screenToCanvas,
    canvasToScreen,
  };
};

