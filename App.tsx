import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
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
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.safeArea}>
          <HomeScreen />
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
});