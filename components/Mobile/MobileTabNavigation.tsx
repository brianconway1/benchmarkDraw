import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

export type TabType = 'background' | 'icons' | 'drawing' | 'tools';

interface MobileTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const MobileTabNavigation: React.FC<MobileTabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 375;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'background', label: 'Background', icon: '🎨' },
    { id: 'icons', label: 'Icons', icon: '👥' },
    { id: 'drawing', label: 'Draw', icon: '✏️' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive,
            isSmallPhone && styles.tabSmall,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          {!isSmallPhone && (
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
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
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

