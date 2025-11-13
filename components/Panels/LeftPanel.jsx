import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useAppStore } from '../../store/appStore';

const LeftPanel = ({ onBackgroundSelected }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const minDimension = Math.min(width, height);
  const isTablet = minDimension >= 768;
  const isPhone = !isTablet;
  const background = useAppStore((state) => state.background);
  const setBackground = useAppStore((state) => state.setBackground);
  const clearDropMode = useAppStore((state) => state.clearDropMode);

  const backgrounds = [
    { type: 'pitch_full', label: 'Full Field' },
    { type: 'pitch_half', label: 'Half Field' },
    { type: 'pitch_blank', label: 'Blank' },
    { type: 'white', label: 'White' },
  ];

  return (
    <View
      style={[
        styles.container,
        isPhone
          ? {
              paddingVertical: 20,
              paddingHorizontal: 16,
            }
          : {
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: [{ translateY: -100 }],
              width: 120,
            },
      ]}
    >
      {isPhone && (
        <Text style={styles.modalTitle}>Select Background</Text>
      )}
      <View style={[
        styles.pillsContainer,
        isPhone && styles.pillsContainerPhone
      ]}>
        {backgrounds.map((bg) => (
          <TouchableOpacity
            key={bg.type}
            style={[
              styles.pill,
              background === bg.type && styles.pillActive,
              isPhone && styles.pillPhone,
            ]}
            onPress={() => {
              // Clear drop mode when background is selected
              const store = useAppStore.getState();
              if (store.dropMode) {
                clearDropMode();
              }
              setBackground(bg.type);
              // Close bottom sheet on mobile after selecting background
              if (isPhone && onBackgroundSelected) {
                onBackgroundSelected();
              }
            }}
          >
            <Text
              style={[
                styles.pillText,
                background === bg.type && styles.pillTextActive,
              ]}
            >
              {bg.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  pillsContainer: {
    flexDirection: 'column',
  },
  pillsContainerPhone: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
    marginVertical: 6,
  },
  pillActive: {
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  pillPhone: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    marginHorizontal: 6,
    marginVertical: 6,
  },
  pillText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});

export default LeftPanel;
