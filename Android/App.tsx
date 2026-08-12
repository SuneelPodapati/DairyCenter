import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppContext } from './src/services';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#388e3c',
  },
};

function AppContent() {
  const { loading } = useAppContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <StatusBar style="auto" />
          <AppContent />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
