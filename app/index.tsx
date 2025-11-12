import React, { useRef } from 'react';
import { View, StyleSheet, SafeAreaView, useWindowDimensions, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import DrawingCanvas from '../components/Canvas/DrawingCanvas';
import LeftPanel from '../components/Panels/LeftPanel';
import RightPanel from '../components/Panels/RightPanel';
import BottomPanel from '../components/Panels/BottomPanel';
import Toolbar from '../components/Tools/Toolbar';
import AnimationPanel from '../components/Animation/AnimationPanel';
import AnimationExport from '../components/Animation/AnimationExport';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const canvasRef = useRef<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        {/* Logo would go here */}
      </View>

      {/* Toolbar */}
      <Toolbar canvasRef={canvasRef} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Left Panel - Background Selection */}
        {isTablet && (
          <View style={styles.leftPanel}>
            <LeftPanel />
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <DrawingCanvas width={width - (isTablet ? 240 : 0)} height={height - 200} />
        </View>

        {/* Right Panel - Icons */}
        {isTablet && (
          <View style={styles.rightPanel}>
            <RightPanel />
          </View>
        )}
      </View>

      {/* Bottom Panel - Drawing Tools */}
      <View style={styles.bottomPanel}>
        <BottomPanel />
      </View>

      {/* Mobile Panels */}
      {!isTablet && (
        <>
          <View style={styles.mobileTopPanel}>
            <LeftPanel />
            <RightPanel />
          </View>
        </>
      )}

      {/* Animation Panel (Optional - can be toggled) */}
      {isTablet && (
        <View style={styles.animationPanel}>
          <AnimationPanel />
          <AnimationExport />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 60,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: 120,
    backgroundColor: '#000000',
    padding: 8,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  rightPanel: {
    width: 120,
    backgroundColor: '#000000',
    padding: 8,
  },
  bottomPanel: {
    backgroundColor: '#000000',
    padding: 8,
  },
  mobileTopPanel: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 8,
    zIndex: 10,
  },
  animationPanel: {
    position: 'absolute',
    top: 120,
    right: 120,
    width: 200,
    zIndex: 5,
  },
});

