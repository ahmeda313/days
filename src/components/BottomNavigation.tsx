import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../assets/neon-palette';

export type TabType = 'home' | 'activities' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: '🏠' },
    { id: 'activities' as TabType, label: 'Activities', icon: '🔥' },
    { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.tabItemActive,
            ]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabIcon,
              activeTab === tab.id && styles.tabIconActive
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 50,
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    // Active state styling if needed
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  tabLabelActive: {
    color: colors.neonGreen,
    opacity: 1,
    fontWeight: '600',
  },
});