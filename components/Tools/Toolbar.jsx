import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, ScrollView } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useHistory } from '../../hooks/useHistory';
import { exportImage } from '../../utils/exportUtils';
import AnimationPanel from '../Animation/AnimationPanel';
import AnimationExport from '../Animation/AnimationExport';

const Toolbar = ({ canvasRef, compact = false }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const minDimension = Math.min(width, height);
  const isPhone = minDimension < 768;
  const isSmallPhone = minDimension < 375;
  const { undo, redo, canUndo, canRedo } = useHistory();
  const deleteSelected = useAppStore((state) => state.deleteSelected);
  const clearAll = useAppStore((state) => state.clearAll);
  const copySelected = useAppStore((state) => state.copySelected);
  const paste = useAppStore((state) => state.paste);
  const selectedItems = useAppStore((state) => state.selectedItems);
  const clearDropMode = useAppStore((state) => state.clearDropMode);
  const [showAnimationModal, setShowAnimationModal] = useState(false);

  // Clear drop mode when any toolbar button is clicked
  const clearDropModeIfActive = () => {
    const store = useAppStore.getState();
    if (store.dropMode) {
      clearDropMode();
    }
  };

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
        isPhone || compact
          ? {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingVertical: (isSmallPhone || compact || isLandscape) ? 4 : 8,
              paddingHorizontal: (isSmallPhone || compact || isLandscape) ? 2 : 4,
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
        style={[
          styles.button,
          !canUndo && styles.buttonDisabled,
          compact && styles.buttonCompact,
        ]}
        onPress={() => {
          clearDropModeIfActive();
          undo();
        }}
        disabled={!canUndo}
      >
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
          {compact ? '↶' : 'Undo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          !canRedo && styles.buttonDisabled,
          compact && styles.buttonCompact,
        ]}
        onPress={() => {
          clearDropModeIfActive();
          redo();
        }}
        disabled={!canRedo}
      >
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
          {compact ? '↷' : 'Redo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedItems.size === 0 && styles.buttonDisabled,
          compact && styles.buttonCompact,
        ]}
        onPress={() => {
          clearDropModeIfActive();
          handleCopy();
        }}
        disabled={selectedItems.size === 0}
      >
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
          {compact ? '📋' : 'Copy'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, compact && styles.buttonCompact]} 
        onPress={() => {
          clearDropModeIfActive();
          handlePaste();
        }}
      >
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
          {compact ? '📄' : 'Paste'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonDanger,
          selectedItems.size === 0 && styles.buttonDisabled,
          compact && styles.buttonCompact,
        ]}
        onPress={() => {
          clearDropModeIfActive();
          handleDelete();
        }}
        disabled={selectedItems.size === 0}
      >
        <Text style={[styles.buttonText, styles.buttonTextDanger, compact && styles.buttonTextCompact]}>
          {compact ? '🗑' : 'Delete'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonDanger, compact && styles.buttonCompact]} 
        onPress={() => {
          clearDropModeIfActive();
          clearAll();
        }}
      >
        <Text style={[styles.buttonText, styles.buttonTextDanger, compact && styles.buttonTextCompact]}>
          {compact ? '✕' : 'Clear All'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonPrimary, compact && styles.buttonCompact]} 
        onPress={() => {
          clearDropModeIfActive();
          handleScreenshot();
        }}
      >
        <Text style={[styles.buttonText, styles.buttonTextPrimary, compact && styles.buttonTextCompact]}>
          {compact ? '📸' : 'Screenshot'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.buttonPrimary, compact && styles.buttonCompact]} 
        onPress={() => {
          clearDropModeIfActive();
          setShowAnimationModal(true);
        }}
      >
        <Text style={[styles.buttonText, styles.buttonTextPrimary, compact && styles.buttonTextCompact]}>
          {compact ? '🎬' : 'Animation'}
        </Text>
      </TouchableOpacity>

      {/* Animation Modal */}
      <Modal visible={showAnimationModal} transparent animationType="slide" onRequestClose={() => setShowAnimationModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Animation</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAnimationModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              <AnimationPanel />
              <View style={styles.animationExportContainer}>
                <AnimationExport />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  buttonCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    marginVertical: 2,
    minWidth: 44,
    minHeight: 44,
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
  buttonTextCompact: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  animationExportContainer: {
    marginTop: 16,
  },
});

export default Toolbar;
