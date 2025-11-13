import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { BackgroundType } from '../../types';

const LeftPanel: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const minDimension = Math.min(width, height);
  const isTablet = minDimension >= 768;
  const isPhone = !isTablet;
  const background = useAppStore((state) => state.background);
  const setBackground = useAppStore((state) => state.setBackground);

  const backgrounds: { type: BackgroundType; label: string }[] = [
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
              flexDirection: 'row',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 4,
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
      {backgrounds.map((bg) => (
        <TouchableOpacity
          key={bg.type}
          style={[
            styles.button,
            background === bg.type && styles.buttonActive,
            isPhone && styles.buttonPhone,
          ]}
          onPress={() => setBackground(bg.type)}
        >
          <Text
            style={[
              styles.buttonText,
              background === bg.type && styles.buttonTextActive,
              isPhone && styles.buttonTextPhone,
            ]}
          >
            {bg.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#000000',
  },
  buttonPhone: {
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextPhone: {
    fontSize: 12,
  },
});

export default LeftPanel;

