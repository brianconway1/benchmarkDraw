import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppStore } from '../../store/appStore';
import { useHistory } from '../../hooks/useHistory';
import { exportImage } from '../../utils/exportUtils';
import AnimationPanel from '../Animation/AnimationPanel';
import AnimationExport from '../Animation/AnimationExport';

// Icon Components - Standard icons
const UndoIcon = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.5 8C9.85 8 7.45 9 5.6 10.6L2 7V14H9L5.38 10.38C6.77 9.22 8.54 8.5 10.5 8.5C14.04 8.5 17.05 10.81 18.1 14L20.47 13.22C19.08 9.03 15.15 6 10.5 6L12.5 8Z"
      fill={color}
    />
  </Svg>
);

const RedoIcon = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.4 10.6C16.55 9 14.15 8 11.5 8L9.5 6C14.15 6 18.08 9.03 19.47 13.22L17.1 14C16.05 10.81 13.04 8.5 9.5 8.5C7.54 8.5 5.77 9.22 4.38 10.38L1 14H8V7L4.6 10.6Z"
      fill={color}
    />
  </Svg>
);

const CopyIcon = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
      fill={color}
    />
  </Svg>
);

const PasteIcon = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 2H14.82C14.4 0.84 13.3 0 12 0C10.7 0 9.6 0.84 9.18 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM12 2C12.55 2 13 2.45 13 3C13 3.55 12.55 4 12 4C11.45 4 11 3.55 11 3C11 2.45 11.45 2 12 2ZM19 20H5V4H7V7H17V4H19V20Z"
      fill={color}
    />
  </Svg>
);

const DeleteIcon = ({ size = 20, color = '#dc2626' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
      fill={color}
    />
  </Svg>
);

const ClearIcon = ({ size = 20, color = '#dc2626' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill={color}
    />
  </Svg>
);

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

  const iconSize = isPhone ? 20 : 22;

  return (
    <View
      style={[
        styles.container,
        isPhone || compact
          ? {
              paddingVertical: (isSmallPhone || compact || isLandscape) ? 6 : 8,
              paddingHorizontal: (isSmallPhone || compact || isLandscape) ? 4 : 8,
            }
          : {
              paddingVertical: 10,
              paddingHorizontal: 16,
            },
      ]}
    >
      {/* Top Row: Icon Buttons */}
      <View style={[
        styles.topRow,
        isPhone && styles.topRowPhone
      ]}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            !canUndo && styles.buttonDisabled,
            compact && styles.iconButtonCompact,
          ]}
          onPress={() => {
            clearDropModeIfActive();
            undo();
          }}
          disabled={!canUndo}
          activeOpacity={0.7}
        >
          <UndoIcon size={iconSize} color={!canUndo ? '#999999' : '#000000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            !canRedo && styles.buttonDisabled,
            compact && styles.iconButtonCompact,
          ]}
          onPress={() => {
            clearDropModeIfActive();
            redo();
          }}
          disabled={!canRedo}
          activeOpacity={0.7}
        >
          <RedoIcon size={iconSize} color={!canRedo ? '#999999' : '#000000'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            selectedItems.size === 0 && styles.buttonDisabled,
            compact && styles.iconButtonCompact,
          ]}
          onPress={() => {
            clearDropModeIfActive();
            handleCopy();
          }}
          disabled={selectedItems.size === 0}
          activeOpacity={0.7}
        >
          <CopyIcon size={iconSize} color={selectedItems.size === 0 ? '#999999' : '#000000'} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconButton, compact && styles.iconButtonCompact]} 
          onPress={() => {
            clearDropModeIfActive();
            handlePaste();
          }}
          activeOpacity={0.7}
        >
          <PasteIcon size={iconSize} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            styles.iconButtonDanger,
            selectedItems.size === 0 && styles.buttonDisabled,
            compact && styles.iconButtonCompact,
          ]}
          onPress={() => {
            clearDropModeIfActive();
            handleDelete();
          }}
          disabled={selectedItems.size === 0}
          activeOpacity={0.7}
        >
          <DeleteIcon size={iconSize} color={selectedItems.size === 0 ? '#999999' : '#dc2626'} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconButton, styles.iconButtonDanger, compact && styles.iconButtonCompact]} 
          onPress={() => {
            clearDropModeIfActive();
            clearAll();
          }}
          activeOpacity={0.7}
        >
          <ClearIcon size={iconSize} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Text Buttons */}
      <View style={[
        styles.bottomRow,
        isPhone && styles.bottomRowPhone
      ]}>
        <TouchableOpacity 
          style={[styles.textButton, styles.buttonPrimary, compact && styles.textButtonCompact]} 
          onPress={() => {
            clearDropModeIfActive();
            handleScreenshot();
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.textButtonText, styles.buttonTextPrimary]}>
            Screenshot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.textButton, styles.buttonPrimary, compact && styles.textButtonCompact]} 
          onPress={() => {
            clearDropModeIfActive();
            setShowAnimationModal(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.textButtonText, styles.buttonTextPrimary]}>
            Animation
          </Text>
        </TouchableOpacity>
      </View>

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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  topRowPhone: {
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  bottomRowPhone: {
    paddingTop: 6,
  },
  iconButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonCompact: {
    width: 40,
    height: 40,
  },
  iconButtonDanger: {
    borderColor: '#dc2626',
  },
  textButton: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textButtonCompact: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPrimary: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  textButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
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
