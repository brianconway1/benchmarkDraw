import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

export type TabType = 'background' | 'icons' | 'drawing';

interface MobileTabNavigationProps {
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
}

const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isSmallPhone = Math.min(width, height) < 375;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'background', label: 'Background', icon: '🎨' },
    { id: 'icons', label: 'Icons', icon: '👥' },
    { id: 'drawing', label: 'Draw', icon: '✏️' },
  ];

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive,
            (isSmallPhone || isLandscape) && styles.tabSmall,
            isLandscape && styles.tabLandscape,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[styles.tabIcon, isLandscape && styles.tabIconLandscape]}>{tab.icon}</Text>
          {!isSmallPhone && !isLandscape && (
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  containerLandscape: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: '#000000',
  },
  tabSmall: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  tabLandscape: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginHorizontal: 1,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabIconLandscape: {
    fontSize: 18,
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
});

export default MobileTabNavigation;

