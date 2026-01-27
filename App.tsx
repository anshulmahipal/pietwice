import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {setNavigationRef} from './src/utils/navigationUtils';
import {Provider} from 'react-redux';
import store from './src/redux/store';
import MainStack from './src/navigation/MainStack';
import {LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from './src/context/ThemeContext';
import {SheetProvider} from 'react-native-actions-sheet';
import './src/sheets/sheets';
import useStallionUpdate from './src/hooks/useStallionUpdate';
import logger from './src/utils/logger';

const AppContent = () => {
  const {checkForUpdates, isUpdateAvailable, isDownloading, isInstalling, error} =
    useStallionUpdate();

  useEffect(() => {
    // Check for updates on app start (only in production)
    if (!__DEV__) {
      checkForUpdates();
    } else {
      logger.info('Stallion update check skipped in development mode');
    }
  }, [checkForUpdates]);

  useEffect(() => {
    if (error) {
      logger.error('Stallion update error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (isUpdateAvailable) {
      logger.info('Stallion update available');
    }
    if (isDownloading) {
      logger.info('Stallion update downloading...');
    }
    if (isInstalling) {
      logger.info('Stallion update installing...');
    }
  }, [isUpdateAvailable, isDownloading, isInstalling]);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <SheetProvider>
            <NavigationContainer ref={setNavigationRef}>
              <MainStack />
            </NavigationContainer>
          </SheetProvider>
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

const App = () => {
  LogBox.ignoreAllLogs();

  return <AppContent />;
};

export default App;
