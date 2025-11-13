import { create } from 'zustand';
import {
  CanvasState,
  Player,
  Cone,
  GoalPost,
  Ball,
  Line,
  BackgroundType,
  PlayerTeam,
  DrawingMode,
  LineConfig,
  BoxConfig,
  AnimationFrame,
  Animation,
  PlayerStyle,
  LabelType,
  ConeColor,
  ConeSize,
} from '../types';

interface AppStore extends CanvasState {
  // Background
  setBackground: (background: BackgroundType) => void;

  // Players
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;

  // Cones
  addCone: (cone: Omit<Cone, 'id'>) => void;
  updateCone: (id: string, updates: Partial<Cone>) => void;
  removeCone: (id: string) => void;

  // Goal Posts
  addGoalPost: (goalPost: Omit<GoalPost, 'id'>) => void;
  updateGoalPost: (id: string, updates: Partial<GoalPost>) => void;
  removeGoalPost: (id: string) => void;

  // Balls
  addBall: (ball: Omit<Ball, 'id'>) => void;
  updateBall: (id: string, updates: Partial<Ball>) => void;
  removeBall: (id: string) => void;

  // Lines
  addLine: (line: Omit<Line, 'id'>) => void;
  updateLine: (id: string, updates: Partial<Line>) => void;
  removeLine: (id: string) => void;

  // Selection
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearAll: () => void;

  // Delete
  deleteSelected: () => void;

  // Copy/Paste
  copiedItems: (Player | Cone | GoalPost | Ball | Line)[] | null;
  copySelected: () => void;
  paste: (offset?: { x: number; y: number }) => void;
  getCopiedItems: () => (Player | Cone | GoalPost | Ball | Line)[] | null;

  // Drawing config
  lineConfig: LineConfig;
  setLineConfig: (config: Partial<LineConfig>) => void;
  boxConfig: BoxConfig;
  setBoxConfig: (config: Partial<BoxConfig>) => void;

  // Drop mode (multi-drop for icons)
  dropMode: 'player' | 'cone' | 'goalpost' | 'ball' | null;
  dropModeConfig: {
    team?: PlayerTeam;
    color?: string;
    style?: PlayerStyle;
    stripeColor?: string;
    labelType?: LabelType;
    label?: string;
    nextNumber?: number;
    coneColor?: ConeColor;
    coneSize?: ConeSize;
  } | null;
  setDropMode: (mode: 'player' | 'cone' | 'goalpost' | 'ball' | null, config?: any) => void;
  clearDropMode: () => void;

  // Animations
  animations: Animation[];
  currentAnimation: string | null;
  addAnimation: (animation: Animation) => void;
  updateAnimation: (id: string, updates: Partial<Animation>) => void;
  removeAnimation: (id: string) => void;
  setCurrentAnimation: (id: string | null) => void;
  addFrame: (frame: AnimationFrame) => void;
  updateFrame: (animationId: string, frameId: string, updates: Partial<AnimationFrame>) => void;
  removeFrame: (animationId: string, frameId: string) => void;
}

const defaultLineConfig: LineConfig = {
  mode: 'cursor',
  color: '#2563eb',
  thickness: 4,
  dash: [],
  arrowStart: false,
  arrowEnd: true,
};

const defaultBoxConfig: BoxConfig = {
  fillColor: '#2563eb',
  strokeColor: '#2563eb',
  thickness: 4,
  dash: [],
  filled: false,
};

const initialState: CanvasState = {
  background: 'pitch_full',
  players: [],
  cones: [],
  goalPosts: [],
  balls: [],
  lines: [],
  selectedItems: new Set(),
  history: [],
  historyIndex: -1,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  lineConfig: defaultLineConfig,
  boxConfig: defaultBoxConfig,
  animations: [],
  currentAnimation: null,
  copiedItems: null,
  dropMode: null,
  dropModeConfig: null,

  setBackground: (background) => {
    set({ background });
    get().pushHistory();
  },

  addPlayer: (player) => {
    const id = `player-${Date.now()}-${Math.random()}`;
    const newPlayer = { ...player, id };
    console.log('Adding player:', newPlayer);
    set((state) => ({
      players: [...state.players, newPlayer],
    }));
    get().pushHistory();
  },

  updatePlayer: (id, updates) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  removePlayer: (id) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));
    get().pushHistory();
  },

  addCone: (cone) => {
    const id = `cone-${Date.now()}-${Math.random()}`;
    const newCone = { ...cone, id };
    console.log('Adding cone:', newCone);
    set((state) => ({
      cones: [...state.cones, newCone],
    }));
    get().pushHistory();
  },

  updateCone: (id, updates) => {
    set((state) => ({
      cones: state.cones.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  removeCone: (id) => {
    set((state) => ({
      cones: state.cones.filter((c) => c.id !== id),
    }));
    get().pushHistory();
  },

  addGoalPost: (goalPost) => {
    const id = `goalpost-${Date.now()}-${Math.random()}`;
    const newGoalPost = { ...goalPost, id };
    console.log('Adding goal post:', newGoalPost);
    set((state) => ({
      goalPosts: [...state.goalPosts, newGoalPost],
    }));
    get().pushHistory();
  },

  updateGoalPost: (id, updates) => {
    set((state) => ({
      goalPosts: state.goalPosts.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  removeGoalPost: (id) => {
    set((state) => ({
      goalPosts: state.goalPosts.filter((g) => g.id !== id),
    }));
    get().pushHistory();
  },

  addBall: (ball) => {
    const id = `ball-${Date.now()}-${Math.random()}`;
    const newBall = { ...ball, id };
    console.log('Adding ball:', newBall);
    set((state) => ({
      balls: [...state.balls, newBall],
    }));
    get().pushHistory();
  },

  updateBall: (id, updates) => {
    set((state) => ({
      balls: state.balls.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  removeBall: (id) => {
    set((state) => ({
      balls: state.balls.filter((b) => b.id !== id),
    }));
    get().pushHistory();
  },

  addLine: (line) => {
    const id = `line-${Date.now()}-${Math.random()}`;
    set((state) => ({
      lines: [...state.lines, { ...line, id }],
    }));
    get().pushHistory();
  },

  updateLine: (id, updates) => {
    set((state) => ({
      lines: state.lines.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  removeLine: (id) => {
    set((state) => ({
      lines: state.lines.filter((l) => l.id !== id),
    }));
    get().pushHistory();
  },

  selectItem: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedItems);
      newSelection.add(id);
      return { selectedItems: newSelection };
    });
  },

  deselectItem: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedItems);
      newSelection.delete(id);
      return { selectedItems: newSelection };
    });
  },

  selectMultiple: (ids) => {
    set((state) => {
      const newSelection = new Set(state.selectedItems);
      ids.forEach((id) => newSelection.add(id));
      return { selectedItems: newSelection };
    });
  },

  clearSelection: () => {
    set({ selectedItems: new Set() });
  },

  isSelected: (id) => {
    return get().selectedItems.has(id);
  },

  pushHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    const currentState: CanvasState = {
      background: state.background,
      players: [...state.players],
      cones: [...state.cones],
      goalPosts: [...state.goalPosts],
      balls: [...state.balls],
      lines: [...state.lines],
      selectedItems: new Set(state.selectedItems),
      history: [],
      historyIndex: -1,
    };
    newHistory.push(currentState);
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        ...previousState,
        historyIndex: state.historyIndex - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        ...nextState,
        historyIndex: state.historyIndex + 1,
      });
    }
  },

  canUndo: () => {
    return get().historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  clearAll: () => {
    set({
      players: [],
      cones: [],
      goalPosts: [],
      balls: [],
      lines: [],
      selectedItems: new Set(),
    });
    get().pushHistory();
  },

  deleteSelected: () => {
    const state = get();
    const selected = Array.from(state.selectedItems);

    set({
      players: state.players.filter((p) => !selected.includes(p.id)),
      cones: state.cones.filter((c) => !selected.includes(c.id)),
      goalPosts: state.goalPosts.filter((g) => !selected.includes(g.id)),
      balls: state.balls.filter((b) => !selected.includes(b.id)),
      lines: state.lines.filter((l) => !selected.includes(l.id)),
      selectedItems: new Set(),
    });
    get().pushHistory();
  },

  copySelected: () => {
    const state = get();
    const selected = Array.from(state.selectedItems);
    const items: (Player | Cone | GoalPost | Ball | Line)[] = [];

    state.players.forEach((p) => {
      if (selected.includes(p.id)) items.push(p);
    });
    state.cones.forEach((c) => {
      if (selected.includes(c.id)) items.push(c);
    });
    state.goalPosts.forEach((g) => {
      if (selected.includes(g.id)) items.push(g);
    });
    state.balls.forEach((b) => {
      if (selected.includes(b.id)) items.push(b);
    });
    state.lines.forEach((l) => {
      if (selected.includes(l.id)) items.push(l);
    });

    set({ copiedItems: items });
  },

  paste: (offset = { x: 20, y: 20 }) => {
    const state = get();
    if (!state.copiedItems || state.copiedItems.length === 0) return;

    state.copiedItems.forEach((item) => {
      if ('x' in item && 'y' in item) {
        const newItem = { ...item, x: item.x + offset.x, y: item.y + offset.y };
        delete (newItem as any).id;

        if ('team' in item) {
          get().addPlayer(newItem as Omit<Player, 'id'>);
        } else if ('color' in item && 'size' in item) {
          get().addCone(newItem as Omit<Cone, 'id'>);
        } else if ('id' in item && item.id.startsWith('goalpost')) {
          get().addGoalPost(newItem as Omit<GoalPost, 'id'>);
        } else if ('id' in item && item.id.startsWith('ball')) {
          get().addBall(newItem as Omit<Ball, 'id'>);
        } else if ('points' in item) {
          const line = newItem as Omit<Line, 'id'>;
          line.points = line.points.map((p) => ({
            x: p.x + offset.x,
            y: p.y + offset.y,
          }));
          get().addLine(line);
        }
      }
    });
  },

  getCopiedItems: () => {
    return get().copiedItems;
  },

  setLineConfig: (config) => {
    set((state) => ({
      lineConfig: { ...state.lineConfig, ...config },
    }));
  },

  setBoxConfig: (config) => {
    set((state) => ({
      boxConfig: { ...state.boxConfig, ...config },
    }));
  },

  addAnimation: (animation) => {
    set((state) => ({
      animations: [...state.animations, animation],
    }));
  },

  updateAnimation: (id, updates) => {
    set((state) => ({
      animations: state.animations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },

  removeAnimation: (id) => {
    set((state) => ({
      animations: state.animations.filter((a) => a.id !== id),
    }));
  },

  setCurrentAnimation: (id) => {
    set({ currentAnimation: id });
  },

  addFrame: (frame) => {
    const state = get();
    if (!state.currentAnimation) return;

    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === state.currentAnimation
          ? { ...a, frames: [...a.frames, frame] }
          : a
      ),
    }));
  },

  updateFrame: (animationId, frameId, updates) => {
    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === animationId
          ? {
              ...a,
              frames: a.frames.map((f) => (f.id === frameId ? { ...f, ...updates } : f)),
            }
          : a
      ),
    }));
  },

  removeFrame: (animationId, frameId) => {
    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === animationId
          ? { ...a, frames: a.frames.filter((f) => f.id !== frameId) }
          : a
      ),
    }));
  },

  setDropMode: (mode, config) => {
    console.log('Setting drop mode:', mode, config);
    set({
      dropMode: mode,
      dropModeConfig: config || null,
    });
  },

  clearDropMode: () => {
    set({
      dropMode: null,
      dropModeConfig: null,
    });
  },
}));

