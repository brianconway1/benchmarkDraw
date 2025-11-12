import { Point, Line } from '../types';

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const calculateAngle = (p1: Point, p2: Point): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

export const getLineBounds = (line: Line): { x: number; y: number; width: number; height: number } => {
  if (line.points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = line.points[0].x;
  let minY = line.points[0].y;
  let maxX = line.points[0].x;
  let maxY = line.points[0].y;

  line.points.forEach((point) => {
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

export const pointInLine = (point: Point, line: Line, tolerance: number = 5): boolean => {
  if (line.type === 'straight' && line.points.length >= 2) {
    const p1 = line.points[0];
    const p2 = line.points[line.points.length - 1];
    const distance = distanceToLineSegment(point, p1, p2);
    return distance <= tolerance;
  } else if (line.type === 'curve' && line.points.length >= 2 && line.controlPoint) {
    const p1 = line.points[0];
    const p2 = line.points[line.points.length - 1];
    const cp = line.controlPoint;
    // Approximate curve with multiple line segments
    const segments = 20;
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      const pt1 = quadraticBezierPoint(p1, cp, p2, t1);
      const pt2 = quadraticBezierPoint(p1, cp, p2, t2);
      const distance = distanceToLineSegment(point, pt1, pt2);
      if (distance <= tolerance) return true;
    }
    return false;
  } else if (line.type === 'free' && line.points.length >= 2) {
    for (let i = 0; i < line.points.length - 1; i++) {
      const p1 = line.points[i];
      const p2 = line.points[i + 1];
      const distance = distanceToLineSegment(point, p1, p2);
      if (distance <= tolerance) return true;
    }
    return false;
  } else if (line.type === 'rectangle' && line.points.length >= 2) {
    const bounds = getLineBounds(line);
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }
  return false;
};

const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

const quadraticBezierPoint = (p0: Point, p1: Point, p2: Point, t: number): Point => {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
};

export const createStraightLine = (start: Point, end: Point, config: any): Omit<Line, 'id'> => {
  return {
    type: 'straight',
    points: [start, end],
    color: config.color,
    thickness: config.thickness,
    dash: config.dash,
    arrowStart: config.arrowStart,
    arrowEnd: config.arrowEnd,
  };
};

export const createCurveLine = (start: Point, control: Point, end: Point, config: any): Omit<Line, 'id'> => {
  return {
    type: 'curve',
    points: [start, end],
    controlPoint: control,
    color: config.color,
    thickness: config.thickness,
    dash: config.dash,
    arrowStart: config.arrowStart,
    arrowEnd: config.arrowEnd,
  };
};

export const createFreeLine = (points: Point[], config: any): Omit<Line, 'id'> => {
  return {
    type: 'free',
    points,
    color: config.color,
    thickness: config.thickness,
    dash: config.dash,
    arrowStart: false,
    arrowEnd: false,
  };
};

export const createRectangle = (start: Point, end: Point, config: any): Omit<Line, 'id'> => {
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxX = Math.max(start.x, end.x);
  const maxY = Math.max(start.y, end.y);

  return {
    type: 'rectangle',
    points: [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ],
    color: config.strokeColor || config.color,
    thickness: config.thickness,
    dash: config.dash,
    arrowStart: false,
    arrowEnd: false,
    filled: config.filled,
    fillColor: config.fillColor,
  };
};

export const getArrowPoints = (
  start: Point,
  end: Point,
  arrowLength: number = 15,
  arrowWidth: number = 8
): string => {
  const angle = calculateAngle(start, end);
  const arrowAngle1 = angle + Math.PI - Math.PI / 6;
  const arrowAngle2 = angle + Math.PI + Math.PI / 6;

  const x1 = end.x;
  const y1 = end.y;
  const x2 = end.x + arrowLength * Math.cos(arrowAngle1);
  const y2 = end.y + arrowLength * Math.sin(arrowAngle1);
  const x3 = end.x + arrowLength * Math.cos(arrowAngle2);
  const y3 = end.y + arrowLength * Math.sin(arrowAngle2);

  return `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
};

