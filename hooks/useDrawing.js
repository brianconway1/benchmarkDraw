import { useState, useCallback } from 'react';
import {
  createStraightLine,
  createCurveLine,
  createFreeLine,
  createRectangle,
} from '../utils/drawingUtils';

export const useDrawing = (
  mode,
  lineConfig,
  boxConfig,
  onLineComplete
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [controlPoint, setControlPoint] = useState(null);
  const [freeDrawPoints, setFreeDrawPoints] = useState([]);

  const startDrawing = useCallback(
    (point) => {
      if (mode === 'cursor') return;

      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);
      setControlPoint(null);
      setFreeDrawPoints([point]);

      if (mode === 'free') {
        setCurrentLine(null);
      } else if (mode === 'rectangle') {
        setCurrentLine(createRectangle(point, point, { ...boxConfig, color: boxConfig.strokeColor }));
      } else {
        setCurrentLine(createStraightLine(point, point, lineConfig));
      }
    },
    [mode, lineConfig, boxConfig]
  );

  const updateDrawing = useCallback(
    (point) => {
      if (!isDrawing || !startPoint) return;

      setCurrentPoint(point);

      if (mode === 'free') {
        const newPoints = [...freeDrawPoints, point];
        setFreeDrawPoints(newPoints);
        setCurrentLine(createFreeLine(newPoints, lineConfig));
      } else if (mode === 'curve') {
        // For curves, use midpoint as control point initially
        const midX = (startPoint.x + point.x) / 2;
        const midY = (startPoint.y + point.y) / 2;
        const cp = controlPoint || { x: midX, y: midY - 50 };
        setControlPoint(cp);
        setCurrentLine(createCurveLine(startPoint, cp, point, lineConfig));
      } else if (mode === 'rectangle') {
        setCurrentLine(createRectangle(startPoint, point, { ...boxConfig, color: boxConfig.strokeColor }));
      } else {
        // straight line
        setCurrentLine(createStraightLine(startPoint, point, lineConfig));
      }
    },
    [isDrawing, startPoint, mode, lineConfig, boxConfig, freeDrawPoints, controlPoint]
  );

  const finishDrawing = useCallback(() => {
    if (!isDrawing || !currentLine) return;

    onLineComplete(currentLine);
    setIsDrawing(false);
    setCurrentLine(null);
    setStartPoint(null);
    setCurrentPoint(null);
    setControlPoint(null);
    setFreeDrawPoints([]);
  }, [isDrawing, currentLine, onLineComplete]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setCurrentLine(null);
    setStartPoint(null);
    setCurrentPoint(null);
    setControlPoint(null);
    setFreeDrawPoints([]);
  }, []);

  return {
    isDrawing,
    currentLine,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
  };
};
