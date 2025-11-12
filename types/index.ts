export type BackgroundType = 'white' | 'pitch_blank' | 'pitch_full' | 'pitch_half';

export type PlayerTeam = 'team1' | 'team2';

export type PlayerStyle = 'solid' | 'striped';

export type LabelType = 'none' | 'number' | 'text';

export type ConeSize = 'small' | 'medium' | 'large';

export type ConeColor = 'white' | 'black' | 'orange' | 'red' | 'yellow' | 'green' | 'blue';

export type DrawingMode = 'cursor' | 'straight' | 'curve' | 'free' | 'rectangle';

export type DashPattern = number[];

export interface LineConfig {
  mode: DrawingMode;
  color: string;
  thickness: number;
  dash: DashPattern;
  arrowStart: boolean;
  arrowEnd: boolean;
}

export interface BoxConfig {
  fillColor: string;
  strokeColor: string;
  thickness: number;
  dash: DashPattern;
  filled: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  x: number;
  y: number;
  team: PlayerTeam;
  color: string;
  style: PlayerStyle;
  stripeColor: string;
  labelType: LabelType;
  label: string;
  width?: number;
  height?: number;
}

export interface Cone {
  id: string;
  x: number;
  y: number;
  color: ConeColor;
  size: ConeSize;
  width?: number;
  height?: number;
}

export interface GoalPost {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface Line {
  id: string;
  type: 'straight' | 'curve' | 'free' | 'rectangle';
  points: Point[];
  color: string;
  thickness: number;
  dash: DashPattern;
  arrowStart: boolean;
  arrowEnd: boolean;
  filled?: boolean;
  fillColor?: string;
  controlPoint?: Point; // For curves
}

export type CanvasItem = Player | Cone | GoalPost | Ball | Line;

export interface CanvasState {
  background: BackgroundType;
  players: Player[];
  cones: Cone[];
  goalPosts: GoalPost[];
  balls: Ball[];
  lines: Line[];
  selectedItems: Set<string>;
  history: CanvasState[];
  historyIndex: number;
}

export interface DrawingState {
  isDrawing: boolean;
  currentLine: Line | null;
  startPoint: Point | null;
  currentPoint: Point | null;
}

export interface AnimationFrame {
  id: string;
  name: string;
  state: CanvasState;
  duration: number; // milliseconds
}

export interface Animation {
  id: string;
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
}

export interface PanZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

