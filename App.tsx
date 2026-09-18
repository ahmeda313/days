import React, { useState } from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { ActivityListScreen } from './src/screens/ActivityListScreen';
import { ActivityDetailScreen } from './src/screens/ActivityDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomNavigation, TabType } from './src/components/BottomNavigation';
import { Activity } from './src/models/Activity';
import { colors } from './assets/neon-palette';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#fff', // Use white for borders/fonts, green only for boxes
    accent: colors.neonRed,
    error: colors.neonRed,
    background: colors.background,
    surface: '#111',
    text: '#fff',
    onSurface: '#fff',
    onSurfaceVariant: '#ccc',
    primaryContainer: '#222',
    onPrimaryContainer: '#fff',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleBackToActivities = () => {
    setSelectedActivity(null);
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setSelectedActivity(updatedActivity);
  };

  const renderContent = () => {
    if (selectedActivity) {
      return (
        <ActivityDetailScreen
          activity={selectedActivity}
          onBack={handleBackToActivities}
          onActivityUpdated={handleActivityUpdated}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'activities':
        return <ActivityListScreen onActivitySelect={handleActivitySelect} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {renderContent()}
            {!selectedActivity && (
              <BottomNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
          </View>
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
});