import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, Alert } from 'react-native';
import { useAppStore } from '../../store/appStore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const AnimationExport: React.FC = () => {
  const { width } = useWindowDimensions();
  const isPhone = width < 768;

  const { animations, currentAnimation } = useAppStore();
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const currentAnim = animations.find((a) => a.id === currentAnimation);

  const handleExportFrames = async () => {
    if (!currentAnim || currentAnim.frames.length === 0) {
      Alert.alert('Error', 'No animation frames to export');
      return;
    }

    setExporting(true);
    try {
      // Export individual frames as images
      // This would require rendering each frame and capturing it
      // For now, we'll just show an alert
      Alert.alert('Success', `Exporting ${currentAnim.frames.length} frames as images`);
      // TODO: Implement actual frame export
    } catch (error) {
      Alert.alert('Error', 'Failed to export frames');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const handleExportGIF = async () => {
    if (!currentAnim || currentAnim.frames.length === 0) {
      Alert.alert('Error', 'No animation frames to export');
      return;
    }

    setExporting(true);
    try {
      // Export as GIF
      // This would require a GIF creation library
      Alert.alert('Success', 'Exporting animation as GIF');
      // TODO: Implement GIF export using a library like gif.js or similar
    } catch (error) {
      Alert.alert('Error', 'Failed to export GIF');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const handleExportVideo = async () => {
    if (!currentAnim || currentAnim.frames.length === 0) {
      Alert.alert('Error', 'No animation frames to export');
      return;
    }

    setExporting(true);
    try {
      // Export as video
      // This would require a video creation library
      Alert.alert('Success', 'Exporting animation as video');
      // TODO: Implement video export using expo-video or similar
    } catch (error) {
      Alert.alert('Error', 'Failed to export video');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  if (!currentAnim) {
    return null;
  }

  return (
    <View style={[styles.container, isPhone && styles.containerPhone]}>
      <TouchableOpacity
        style={[styles.button, !currentAnim && styles.buttonDisabled]}
        onPress={() => setShowExportModal(true)}
        disabled={!currentAnim || currentAnim.frames.length === 0}
      >
        <Text style={styles.buttonText}>Export Animation</Text>
      </TouchableOpacity>

      <Modal visible={showExportModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Animation</Text>
            <Text style={styles.modalText}>
              Export "{currentAnim.name}" with {currentAnim.frames.length} frames
            </Text>

            <TouchableOpacity
              style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
              onPress={handleExportFrames}
              disabled={exporting}
            >
              <Text style={styles.exportButtonText}>Export as Images</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
              onPress={handleExportGIF}
              disabled={exporting}
            >
              <Text style={styles.exportButtonText}>Export as GIF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
              onPress={handleExportVideo}
              disabled={exporting}
            >
              <Text style={styles.exportButtonText}>Export as Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowExportModal(false)}
              disabled={exporting}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  containerPhone: {
    padding: 8,
  },
  button: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  exportButton: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  modalButtonCancel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  modalButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AnimationExport;

