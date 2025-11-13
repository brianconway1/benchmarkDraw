import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView, Modal } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { DrawingMode } from '../../types';
import Svg, { Line, Path, Rect } from 'react-native-svg';

const BottomPanel: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const minDimension = Math.min(width, height);
  const isPhone = minDimension < 768;

  const { lineConfig, setLineConfig, boxConfig, setBoxConfig } = useAppStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLineSettings, setShowLineSettings] = useState(false);

  const lineModes: { mode: DrawingMode; label: string }[] = [
    { mode: 'cursor', label: 'Cursor' },
    { mode: 'straight', label: 'Straight' },
    { mode: 'curve', label: 'Curved' },
    { mode: 'free', label: 'Free Draw' },
    { mode: 'rectangle', label: 'Rectangle' },
  ];

  const dashPatterns = [
    { name: 'Solid', value: [] },
    { name: 'Dashed', value: [8, 8] },
    { name: 'Dotted', value: [2, 6] },
    { name: 'Dash-Dot', value: [16, 8, 4, 8] },
  ];

  const arrowOptions = [
    { name: 'None', start: false, end: false },
    { name: 'Start', start: true, end: false },
    { name: 'End', start: false, end: true },
    { name: 'Both', start: true, end: true },
  ];

  const handleModeChange = (mode: DrawingMode) => {
    setLineConfig({ mode });
  };

  const handleThicknessChange = (thickness: number) => {
    setLineConfig({ thickness });
  };

  const handleDashChange = (dash: number[]) => {
    setLineConfig({ dash });
  };

  const handleArrowChange = (arrowStart: boolean, arrowEnd: boolean) => {
    setLineConfig({ arrowStart, arrowEnd });
  };

  const handleColorChange = (color: string) => {
    if (lineConfig.mode === 'rectangle') {
      setBoxConfig({ strokeColor: color });
    } else {
      setLineConfig({ color });
    }
  };

  const handleFillChange = (filled: boolean) => {
    if (lineConfig.mode === 'rectangle') {
      setBoxConfig({ filled });
    }
  };

  const handleFillColorChange = (fillColor: string) => {
    if (lineConfig.mode === 'rectangle') {
      setBoxConfig({ fillColor });
    }
  };

  return (
    <View
      style={[
        styles.container,
        isPhone
          ? {
              flexDirection: 'column',
              paddingVertical: 20,
              paddingHorizontal: 16,
            }
          : {
              flexDirection: 'row',
              paddingVertical: 12,
              paddingHorizontal: 16,
            },
      ]}
    >
      {isPhone && (
        <Text style={styles.modalTitle}>Drawing Tools</Text>
      )}
      
      {/* Line Mode Selection - Always visible on mobile */}
      <View style={[
        styles.section,
        isPhone && styles.sectionPhone
      ]}>
        {!isPhone && <Text style={styles.sectionTitle}>Line Mode</Text>}
        <View style={[
          styles.buttonGroup,
          isPhone && styles.pillsContainer
        ]}>
          {lineModes.map(({ mode, label }) => (
            <TouchableOpacity
              key={mode}
              style={[
                isPhone ? styles.pill : styles.modeButton,
                lineConfig.mode === mode && (isPhone ? styles.pillActive : styles.modeButtonActive),
              ]}
              onPress={() => handleModeChange(mode)}
            >
              <Text
                style={[
                  isPhone ? styles.pillText : styles.modeButtonText,
                  lineConfig.mode === mode && (isPhone ? styles.pillTextActive : styles.modeButtonTextActive),
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal={!isPhone}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Thickness Slider */}
        {lineConfig.mode !== 'cursor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thickness: {lineConfig.thickness}px</Text>
            <View style={styles.buttonGroup}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((thickness) => (
                <TouchableOpacity
                  key={thickness}
                  style={[
                    styles.thicknessButton,
                    lineConfig.thickness === thickness && styles.thicknessButtonActive,
                  ]}
                  onPress={() => handleThicknessChange(thickness)}
                >
                  <View
                    style={[
                      styles.thicknessIndicator,
                      {
                        width: thickness * 2,
                        height: thickness * 2,
                        borderRadius: thickness,
                        backgroundColor: lineConfig.color,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Dash Pattern */}
        {lineConfig.mode !== 'cursor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dash Pattern</Text>
            <View style={styles.buttonGroup}>
              {dashPatterns.map((pattern) => (
                <TouchableOpacity
                  key={pattern.name}
                  style={[
                    styles.dashButton,
                    lineConfig.dash.join(',') === pattern.value.join(',') && styles.dashButtonActive,
                  ]}
                  onPress={() => handleDashChange(pattern.value)}
                >
                  <Text
                    style={[
                      styles.dashButtonText,
                      lineConfig.dash.join(',') === pattern.value.join(',') && styles.dashButtonTextActive,
                    ]}
                  >
                    {pattern.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Arrow Options */}
        {(lineConfig.mode === 'straight' || lineConfig.mode === 'curve') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arrows</Text>
            <View style={styles.buttonGroup}>
              {arrowOptions.map((option) => (
                <TouchableOpacity
                  key={option.name}
                  style={[
                    styles.arrowButton,
                    lineConfig.arrowStart === option.start &&
                      lineConfig.arrowEnd === option.end &&
                      styles.arrowButtonActive,
                  ]}
                  onPress={() => handleArrowChange(option.start, option.end)}
                >
                  <Text
                    style={[
                      styles.arrowButtonText,
                      lineConfig.arrowStart === option.start &&
                        lineConfig.arrowEnd === option.end &&
                        styles.arrowButtonTextActive,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Rectangle Fill Options */}
        {lineConfig.mode === 'rectangle' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fill</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.fillButton,
                  !boxConfig.filled && styles.fillButtonActive,
                ]}
                onPress={() => handleFillChange(false)}
              >
                <Text
                  style={[
                    styles.fillButtonText,
                    !boxConfig.filled && styles.fillButtonTextActive,
                  ]}
                >
                  Outline
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.fillButton,
                  boxConfig.filled && styles.fillButtonActive,
                ]}
                onPress={() => handleFillChange(true)}
              >
                <Text
                  style={[
                    styles.fillButtonText,
                    boxConfig.filled && styles.fillButtonTextActive,
                  ]}
                >
                  Filled
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Color Picker Button */}
        {lineConfig.mode !== 'cursor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <TouchableOpacity
              style={[styles.colorButton, { backgroundColor: lineConfig.color }]}
              onPress={() => setShowColorPicker(true)}
            >
              <Text style={styles.colorButtonText}>Select Color</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Color</Text>
            <View style={styles.colorGrid}>
              {[
                '#2563eb',
                '#dc2626',
                '#16a34a',
                '#ca8a04',
                '#9333ea',
                '#ea580c',
                '#db2777',
                '#6b7280',
                '#000000',
                '#FFFFFF',
              ].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => {
                    handleColorChange(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    borderTopWidth: 2,
    borderTopColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  section: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  sectionPhone: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  modeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  modeButtonActive: {
    backgroundColor: '#000000',
  },
  modeButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginVertical: 6,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  thicknessButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  thicknessButtonActive: {
    backgroundColor: '#000000',
  },
  thicknessIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dashButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  dashButtonActive: {
    backgroundColor: '#000000',
  },
  dashButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  dashButtonTextActive: {
    color: '#FFFFFF',
  },
  arrowButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  arrowButtonActive: {
    backgroundColor: '#000000',
  },
  arrowButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  arrowButtonTextActive: {
    color: '#FFFFFF',
  },
  fillButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  fillButtonActive: {
    backgroundColor: '#000000',
  },
  fillButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 12,
  },
  fillButtonTextActive: {
    color: '#FFFFFF',
  },
  colorButton: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  colorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000000',
    margin: 8,
  },
  closeButton: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default BottomPanel;

