import React, { useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, useWindowDimensions, StatusBar, ScrollView } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import DrawingCanvas from '../components/Canvas/DrawingCanvas';
import LeftPanel from '../components/Panels/LeftPanel';
import RightPanel from '../components/Panels/RightPanel';
import BottomPanel from '../components/Panels/BottomPanel';
import Toolbar from '../components/Tools/Toolbar';
import AnimationPanel from '../components/Animation/AnimationPanel';
import AnimationExport from '../components/Animation/AnimationExport';
import MobileTabNavigation, { TabType } from '../components/Mobile/MobileTabNavigation';
import MobileBottomSheet from '../components/Mobile/MobileBottomSheet';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const canvasRef = useRef<any>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<TabType | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const handleTabChange = (tab: TabType) => {
    if (activeMobileTab === tab && bottomSheetVisible) {
      // Close if same tab is tapped again
      setBottomSheetVisible(false);
      setActiveMobileTab(null);
    } else {
      setActiveMobileTab(tab);
      setBottomSheetVisible(true);
    }
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
    setActiveMobileTab(null);
  };

  const renderMobilePanelContent = () => {
    switch (activeMobileTab) {
      case 'background':
        return (
          <ScrollView 
            style={styles.mobilePanelScroll}
            contentContainerStyle={styles.mobilePanelScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <LeftPanel />
          </ScrollView>
        );
      case 'icons':
        return (
          <ScrollView 
            style={styles.mobilePanelScroll}
            contentContainerStyle={styles.mobilePanelScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <RightPanel />
          </ScrollView>
        );
      case 'drawing':
        return (
          <ScrollView 
            style={styles.mobilePanelScroll}
            contentContainerStyle={styles.mobilePanelScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <BottomPanel />
          </ScrollView>
        );
      case 'tools':
        return (
          <ScrollView 
            style={styles.mobilePanelScroll}
            contentContainerStyle={styles.mobilePanelScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.mobileToolsContainer}>
              <Toolbar canvasRef={canvasRef} compact />
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  // Calculate canvas height accounting for mobile tabs
  const getCanvasHeight = () => {
    if (isTablet) {
      return height - 200; // Header + Toolbar + BottomPanel
    }
    // Mobile: Header + Toolbar + Tab Navigation
    return height - 60 - (width < 375 ? 40 : 50) - 50;
  };

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
        {/* Left Panel - Background Selection (Tablet only) */}
        {isTablet && (
          <View style={styles.leftPanel}>
            <LeftPanel />
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <DrawingCanvas 
            width={width - (isTablet ? 240 : 0)} 
            height={getCanvasHeight()} 
          />
        </View>

        {/* Right Panel - Icons (Tablet only) */}
        {isTablet && (
          <View style={styles.rightPanel}>
            <RightPanel />
          </View>
        )}
      </View>

      {/* Bottom Panel - Drawing Tools (Tablet only) */}
      {isTablet && (
        <View style={styles.bottomPanel}>
          <BottomPanel />
        </View>
      )}

      {/* Mobile Tab Navigation */}
      {!isTablet && (
        <>
          <MobileTabNavigation activeTab={activeMobileTab || 'background'} onTabChange={handleTabChange} />
          
          {/* Bottom Sheet Modal for Mobile Panels */}
          <MobileBottomSheet
            visible={bottomSheetVisible}
            onClose={handleCloseBottomSheet}
            snapPoints={[0.5, 0.75, 0.9]}
          >
            {renderMobilePanelContent()}
          </MobileBottomSheet>
        </>
      )}

      {/* Animation Panel (Tablet only - Optional - can be toggled) */}
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
  mobilePanelScroll: {
    flex: 1,
    width: '100%',
  },
  mobilePanelScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mobileToolsContainer: {
    paddingVertical: 8,
  },
  animationPanel: {
    position: 'absolute',
    top: 120,
    right: 120,
    width: 200,
    zIndex: 5,
  },
});

