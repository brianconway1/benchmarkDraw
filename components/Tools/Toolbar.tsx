import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useHistory } from '../../hooks/useHistory';
import { exportImage } from '../../utils/exportUtils';

interface ToolbarProps {
  canvasRef: React.RefObject<any>;
}

const Toolbar: React.FC<ToolbarProps> = ({ canvasRef }) => {
  const { width } = useWindowDimensions();
  const isPhone = width < 768;
  const { undo, redo, canUndo, canRedo } = useHistory();
  const deleteSelected = useAppStore((state) => state.deleteSelected);
  const clearAll = useAppStore((state) => state.clearAll);
  const copySelected = useAppStore((state) => state.copySelected);
  const paste = useAppStore((state) => state.paste);
  const selectedItems = useAppStore((state) => state.selectedItems);

  const handleScreenshot = async () => {
    if (canvasRef.current) {
      const result = await exportImage(canvasRef, false);
      if (result.success && result.uri) {
        // Handle screenshot success
        console.log('Screenshot saved:', result.uri);
      }
    }
  };

  const handleCopy = () => {
    if (selectedItems.size > 0) {
      copySelected();
    }
  };

  const handlePaste = () => {
    paste();
  };

  const handleDelete = () => {
    if (selectedItems.size > 0) {
      deleteSelected();
    }
  };

  return (
    <View
      style={[
        styles.container,
        isPhone
          ? {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 4,
            }
          : {
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
            },
      ]}
    >
      <TouchableOpacity
        style={[styles.button, !canUndo && styles.buttonDisabled]}
        onPress={undo}
        disabled={!canUndo}
      >
        <Text style={styles.buttonText}>Undo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !canRedo && styles.buttonDisabled]}
        onPress={redo}
        disabled={!canRedo}
      >
        <Text style={styles.buttonText}>Redo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, selectedItems.size === 0 && styles.buttonDisabled]}
        onPress={handleCopy}
        disabled={selectedItems.size === 0}
      >
        <Text style={styles.buttonText}>Copy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePaste}>
        <Text style={styles.buttonText}>Paste</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonDanger, selectedItems.size === 0 && styles.buttonDisabled]}
        onPress={handleDelete}
        disabled={selectedItems.size === 0}
      >
        <Text style={[styles.buttonText, styles.buttonTextDanger]}>Delete</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={clearAll}>
        <Text style={[styles.buttonText, styles.buttonTextDanger]}>Clear All</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleScreenshot}>
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Screenshot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonDanger: {
    borderColor: '#dc2626',
  },
  buttonPrimary: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  buttonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  buttonTextDanger: {
    color: '#dc2626',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
});

export default Toolbar;

