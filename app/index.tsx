import React, { useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, useWindowDimensions, StatusBar, ScrollView, Platform } from 'react-native';
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
  const isLandscape = width > height;
  
  // Better tablet detection: Check both width and height to avoid landscape phone being detected as tablet
  // iPad is 768px or more in portrait, but in landscape we need to check the smaller dimension
  const minDimension = Math.min(width, height);
  const isTablet = minDimension >= 768 || (Platform.OS === 'ios' && minDimension >= 600); // iPad mini is 768, but some might be 600+
  
  const isPhone = !isTablet;
  const canvasRef = useRef<any>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<TabType | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  
  // Reset bottom sheet on orientation change
  React.useEffect(() => {
    setBottomSheetVisible(false);
    setActiveMobileTab(null);
  }, [isLandscape]);

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
      // Tablet: account for header, toolbar, and bottom panel
      const headerHeight = 60;
      const toolbarHeight = isLandscape ? 40 : 50;
      const bottomPanelHeight = isLandscape ? 60 : 80;
      return height - headerHeight - toolbarHeight - bottomPanelHeight;
    }
    // Mobile: Header + Toolbar + Tab Navigation
    const headerHeight = 60;
    const toolbarHeight = isLandscape ? 35 : 45;
    const tabNavHeight = isLandscape ? 40 : 50;
    return height - headerHeight - toolbarHeight - tabNavHeight;
  };

  // Adjust canvas width for landscape
  const getCanvasWidth = () => {
    if (isTablet) {
      return width - 240; // Side panels (120px each)
    }
    return width; // Full width on mobile
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
            width={getCanvasWidth()} 
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

      {/* Mobile Tab Navigation - Always visible on mobile, but no tab should be active by default */}
      {isPhone && (
        <MobileTabNavigation 
          activeTab={bottomSheetVisible && activeMobileTab ? activeMobileTab : null} 
          onTabChange={handleTabChange} 
        />
      )}
      
      {/* Bottom Sheet Modal for Mobile Panels - Only visible when a tab is selected */}
      {isPhone && (
        <MobileBottomSheet
          visible={bottomSheetVisible}
          onClose={handleCloseBottomSheet}
          snapPoints={isLandscape ? [0.4, 0.6, 0.8] : [0.5, 0.75, 0.9]}
        >
          {bottomSheetVisible && activeMobileTab && renderMobilePanelContent()}
        </MobileBottomSheet>
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

