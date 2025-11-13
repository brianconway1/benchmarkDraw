import React, { useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, useWindowDimensions, StatusBar, ScrollView, Platform, TouchableWithoutFeedback } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useAppStore } from '../store/appStore';
import DrawingCanvas from '../components/Canvas/DrawingCanvas';
import LeftPanel from '../components/Panels/LeftPanel';
import RightPanel from '../components/Panels/RightPanel';
import BottomPanel from '../components/Panels/BottomPanel';
import Toolbar from '../components/Tools/Toolbar';
import MobileTabNavigation from '../components/Mobile/MobileTabNavigation';
import MobileBottomSheet from '../components/Mobile/MobileBottomSheet';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Better tablet detection: Check both width and height to avoid landscape phone being detected as tablet
  // iPad is 768px or more in portrait, but in landscape we need to check the smaller dimension
  const minDimension = Math.min(width, height);
  const isTablet = minDimension >= 768 || (Platform.OS === 'ios' && minDimension >= 600); // iPad mini is 768, but some might be 600+
  
  const isPhone = !isTablet;
  const canvasRef = useRef(null);
  const [activeMobileTab, setActiveMobileTab] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  
  // Reset bottom sheet on orientation change
  React.useEffect(() => {
    setBottomSheetVisible(false);
    setActiveMobileTab(null);
  }, [isLandscape]);

  const handleTabChange = (tab) => {
    if (activeMobileTab === tab && bottomSheetVisible) {
      // Close if same tab is tapped again
      setBottomSheetVisible(false);
      setActiveMobileTab(null);
      // Clear drop mode when closing tab
      useAppStore.getState().clearDropMode();
    } else {
      setActiveMobileTab(tab);
      setBottomSheetVisible(true);
      // Clear drop mode when switching to a different tab
      useAppStore.getState().clearDropMode();
    }
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
    setActiveMobileTab(null);
    // Don't clear drop mode here - let it persist so user can place icons
    // Drop mode will be cleared when user taps outside canvas or explicitly cancels
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
            <LeftPanel onBackgroundSelected={handleCloseBottomSheet} />
          </ScrollView>
        );
      case 'icons':
        return (
          <ScrollView 
            style={styles.mobilePanelScroll}
            contentContainerStyle={styles.mobilePanelScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <RightPanel onItemAdded={handleCloseBottomSheet} />
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
      default:
        return null;
    }
  };

  // Calculate canvas height accounting for orientation and device type
  const getCanvasHeight = () => {
    if (isTablet) {
      // Tablet: account for toolbar and bottom panel (no header)
      const toolbarHeight = isLandscape ? 40 : 50;
      const bottomPanelHeight = isLandscape ? 60 : 80;
      return height - toolbarHeight - bottomPanelHeight;
    }
    // Mobile: Toolbar + Tab Navigation (no header)
    const toolbarHeight = isLandscape ? 35 : 45;
    const tabNavHeight = isLandscape ? 40 : 50;
    return height - toolbarHeight - tabNavHeight;
  };

  // Adjust canvas width for landscape
  const getCanvasWidth = () => {
    if (isTablet) {
      return width - 240; // Side panels (120px each)
    }
    return width; // Full width on mobile
  };

  // Clear drop mode when tapping outside canvas (on panels/toolbars)
  const clearDropMode = useAppStore((state) => state.clearDropMode);
  
  // Clear drop mode when any area outside canvas is tapped
  const handleOutsideCanvasTap = () => {
    const store = useAppStore.getState();
    if (store.dropMode) {
      clearDropMode();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      
      {/* Toolbar - At top of screen */}
      <TouchableWithoutFeedback onPress={handleOutsideCanvasTap}>
        <View>
          <Toolbar canvasRef={canvasRef} />
        </View>
      </TouchableWithoutFeedback>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Left Panel - Background Selection (Tablet only) */}
        {isTablet && (
          <TouchableWithoutFeedback onPress={handleOutsideCanvasTap}>
            <View style={styles.leftPanel}>
              <LeftPanel />
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Canvas */}
        <View style={styles.canvasContainer}>
          <DrawingCanvas 
            width={getCanvasWidth()} 
            height={getCanvasHeight()} 
            isLandscape={isLandscape}
          />
        </View>

        {/* Right Panel - Icons (Tablet only) */}
        {isTablet && (
          <TouchableWithoutFeedback onPress={handleOutsideCanvasTap}>
            <View style={styles.rightPanel}>
              <RightPanel />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>

      {/* Bottom Panel - Drawing Tools (Tablet only) */}
      {isTablet && (
        <TouchableWithoutFeedback onPress={handleOutsideCanvasTap}>
          <View style={styles.bottomPanel}>
            <BottomPanel />
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Mobile Tab Navigation - Always visible on mobile, but no tab should be active by default */}
      {isPhone && (
        <TouchableWithoutFeedback onPress={handleOutsideCanvasTap}>
          <View>
            <MobileTabNavigation 
              activeTab={bottomSheetVisible && activeMobileTab ? activeMobileTab : null} 
              onTabChange={handleTabChange} 
            />
          </View>
        </TouchableWithoutFeedback>
      )}
      
      {/* Bottom Sheet Modal for Mobile Panels - Only visible when a tab is selected */}
      {isPhone && (
        <MobileBottomSheet
          visible={bottomSheetVisible}
          onClose={handleCloseBottomSheet}
          snapPoints={isLandscape ? [0.25, 0.35] : [0.3, 0.4]}
        >
          {bottomSheetVisible && activeMobileTab && renderMobilePanelContent()}
        </MobileBottomSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    justifyContent: 'center',
    alignItems: 'center',
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
});
