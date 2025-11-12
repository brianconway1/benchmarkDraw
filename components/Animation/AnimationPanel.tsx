import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, ScrollView, TextInput } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { Animation, AnimationFrame } from '../../types';

const AnimationPanel: React.FC = () => {
  const { width } = useWindowDimensions();
  const isPhone = width < 768;

  const animations = useAppStore((state) => state.animations);
  const currentAnimation = useAppStore((state) => state.currentAnimation);
  const addAnimation = useAppStore((state) => state.addAnimation);
  const setCurrentAnimation = useAppStore((state) => state.setCurrentAnimation);
  const addFrame = useAppStore((state) => state.addFrame);
  const [showAnimationModal, setShowAnimationModal] = useState(false);
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [newAnimationName, setNewAnimationName] = useState('');

  const handleCreateAnimation = () => {
    if (newAnimationName.trim()) {
      const animation: Animation = {
        id: `animation-${Date.now()}`,
        name: newAnimationName,
        frames: [],
        loop: false,
      };
      addAnimation(animation);
      setCurrentAnimation(animation.id);
      setNewAnimationName('');
      setShowAnimationModal(false);
    }
  };

  const handleAddFrame = () => {
    if (currentAnimation) {
      const currentState = useAppStore.getState();
      const anim = currentState.animations.find((a) => a.id === currentAnimation);
      const frameNumber = anim ? anim.frames.length + 1 : 1;
      const frame: AnimationFrame = {
        id: `frame-${Date.now()}`,
        name: `Frame ${frameNumber}`,
        state: {
          background: currentState.background,
          players: [...currentState.players],
          cones: [...currentState.cones],
          goalPosts: [...currentState.goalPosts],
          balls: [...currentState.balls],
          lines: [...currentState.lines],
          selectedItems: new Set(),
          history: [],
          historyIndex: -1,
        },
        duration: 1000,
      };
      // Add frame to current animation
      const store = useAppStore.getState();
      if (store.currentAnimation) {
        const anims = store.animations.map((a) =>
          a.id === store.currentAnimation
            ? { ...a, frames: [...a.frames, frame] }
            : a
        );
        useAppStore.setState({ animations: anims });
      }
      setShowFrameModal(false);
    }
  };

  return (
    <View style={[styles.container, isPhone && styles.containerPhone]}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowAnimationModal(true)}
      >
        <Text style={styles.buttonText}>Create Animation</Text>
      </TouchableOpacity>

      {currentAnimation && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowFrameModal(true)}
        >
          <Text style={styles.buttonText}>Add Frame</Text>
        </TouchableOpacity>
      )}

      {animations.length > 0 && (
        <ScrollView style={styles.animationList}>
          {animations.map((animation) => (
            <TouchableOpacity
              key={animation.id}
              style={[
                styles.animationItem,
                currentAnimation === animation.id && styles.animationItemActive,
              ]}
              onPress={() => setCurrentAnimation(animation.id)}
            >
              <Text
                style={[
                  styles.animationItemText,
                  currentAnimation === animation.id && styles.animationItemTextActive,
                ]}
              >
                {animation.name} ({animation.frames.length} frames)
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create Animation Modal */}
      <Modal visible={showAnimationModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Animation</Text>
            <Text style={styles.modalInputLabel}>Animation Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newAnimationName}
              onChangeText={setNewAnimationName}
              placeholder="Enter animation name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAnimationModal(false);
                  setNewAnimationName('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCreateAnimation}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Frame Modal */}
      <Modal visible={showFrameModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Frame</Text>
            <Text style={styles.modalText}>
              This will capture the current canvas state as a frame in the animation.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowFrameModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddFrame}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Add Frame</Text>
              </TouchableOpacity>
            </View>
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
    maxHeight: 200,
  },
  containerPhone: {
    maxHeight: 150,
  },
  button: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  animationList: {
    maxHeight: 100,
  },
  animationItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  animationItemActive: {
    backgroundColor: '#000000',
  },
  animationItemText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 12,
  },
  animationItemTextActive: {
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
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  modalButtonConfirm: {
    backgroundColor: '#000000',
  },
  modalButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
  },
});

export default AnimationPanel;

