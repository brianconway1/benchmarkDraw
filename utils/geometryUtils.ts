import { Point } from '../types';

export const pointInCircle = (point: Point, center: Point, radius: number): boolean => {
  const distance = Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2));
  return distance <= radius;
};

export const pointInRect = (
  point: Point,
  x: number,
  y: number,
  width: number,
  height: number
): boolean => {
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
};

export const getBoundingBox = (points: Point[]): { x: number; y: number; width: number; height: number } => {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const scalePoint = (point: Point, scaleX: number, scaleY: number, center: Point): Point => {
  return {
    x: center.x + (point.x - center.x) * scaleX,
    y: center.y + (point.y - center.y) * scaleY,
  };
};

export const translatePoint = (point: Point, dx: number, dy: number): Point => {
  return {
    x: point.x + dx,
    y: point.y + dy,
  };
};

export const rotatePoint = (point: Point, angle: number, center: Point): Point => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
};

export const snapToGrid = (point: Point, gridSize: number): Point => {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

export const snapToPoint = (point: Point, targetPoints: Point[], snapDistance: number = 15): Point => {
  for (const target of targetPoints) {
    const distance = Math.sqrt(Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2));
    if (distance <= snapDistance) {
      return target;
    }
  }
  return point;
};

