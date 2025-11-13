import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { pointInCircle, pointInRect } from '../utils/geometryUtils';
import { pointInLine } from '../utils/drawingUtils';

export const useSelection = () => {
  const { players, cones, goalPosts, balls, lines, selectItem, clearSelection, isSelected } =
    useAppStore();

  const findItemAtPoint = useCallback(
    (point, tolerance = 10) => {
      // Check lines first (they're on top)
      for (const line of lines) {
        if (pointInLine(point, line, tolerance)) {
          return line.id;
        }
      }

      // Check icons (reverse order to get top-most first)
      const allIcons = [
        ...balls.map((b) => ({ ...b, type: 'ball', radius: 15 })),
        ...goalPosts.map((g) => ({ ...g, type: 'goalpost', width: 30, height: 40 })),
        ...cones.map((c) => ({ ...c, type: 'cone', radius: c.size === 'small' ? 10 : c.size === 'medium' ? 15 : 20 })),
        ...players.map((p) => ({ ...p, type: 'player', radius: 15 })),
      ].reverse();

      for (const icon of allIcons) {
        if ('radius' in icon) {
          const radius = icon.radius || 15;
          if (pointInCircle(point, { x: icon.x, y: icon.y }, radius)) {
            return icon.id;
          }
        } else if ('width' in icon && 'height' in icon) {
          const width = icon.width || 30;
          const height = icon.height || 40;
          if (pointInRect(point, icon.x - width / 2, icon.y - height / 2, width, height)) {
            return icon.id;
          }
        }
      }

      return null;
    },
    [players, cones, goalPosts, balls, lines]
  );

  const handleTap = useCallback(
    (point, multiSelect = false) => {
      const itemId = findItemAtPoint(point);
      if (itemId) {
        if (multiSelect) {
          if (isSelected(itemId)) {
            useAppStore.getState().deselectItem(itemId);
          } else {
            selectItem(itemId);
          }
        } else {
          clearSelection();
          selectItem(itemId);
        }
        return itemId;
      } else {
        if (!multiSelect) {
          clearSelection();
        }
        return null;
      }
    },
    [findItemAtPoint, selectItem, clearSelection, isSelected]
  );

  return {
    findItemAtPoint,
    handleTap,
    isSelected,
  };
};
