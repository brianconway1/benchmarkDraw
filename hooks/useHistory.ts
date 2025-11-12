import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';

export const useHistory = () => {
  const { undo, redo, canUndo, canRedo, pushHistory } = useAppStore();

  const handleUndo = useCallback(() => {
    if (canUndo()) {
      undo();
    }
  }, [undo, canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo()) {
      redo();
    }
  }, [redo, canRedo]);

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    pushHistory,
  };
};

