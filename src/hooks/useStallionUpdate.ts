import {useEffect, useState} from 'react';
import Stallion from 'react-native-stallion';
import logger from '../utils/logger';

interface UpdateInfo {
  isUpdateAvailable: boolean;
  isDownloading: boolean;
  isInstalling: boolean;
  currentVersion: string;
  updateVersion: string | null;
  error: Error | null;
}

const useStallionUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isUpdateAvailable: false,
    isDownloading: false,
    isInstalling: false,
    currentVersion: '',
    updateVersion: null,
    error: null,
  });

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      logger.info('Checking for Stallion updates...');
      const updateAvailable = await Stallion.checkForUpdate();
      
      if (updateAvailable) {
        logger.info('Update available, downloading...');
        setUpdateInfo(prev => ({
          ...prev,
          isUpdateAvailable: true,
          isDownloading: true,
        }));

        await downloadAndInstall();
      } else {
        logger.info('No updates available');
        setUpdateInfo(prev => ({
          ...prev,
          isUpdateAvailable: false,
        }));
      }
    } catch (error) {
      logger.error('Error checking for updates:', error);
      setUpdateInfo(prev => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const downloadAndInstall = async () => {
    try {
      logger.info('Downloading update...');
      await Stallion.downloadUpdate();

      logger.info('Update downloaded, installing...');
      setUpdateInfo(prev => ({
        ...prev,
        isDownloading: false,
        isInstalling: true,
      }));

      await Stallion.installUpdate();
      
      logger.info('Update installed successfully');
      setUpdateInfo(prev => ({
        ...prev,
        isInstalling: false,
        isUpdateAvailable: false,
      }));
    } catch (error) {
      logger.error('Error downloading/installing update:', error);
      setUpdateInfo(prev => ({
        ...prev,
        isDownloading: false,
        isInstalling: false,
        error: error as Error,
      }));
    }
  };

  const getCurrentVersion = async () => {
    try {
      const version = await Stallion.getCurrentVersion();
      setUpdateInfo(prev => ({
        ...prev,
        currentVersion: version,
      }));
      return version;
    } catch (error) {
      logger.error('Error getting current version:', error);
      return null;
    }
  };

  return {
    ...updateInfo,
    checkForUpdates,
    downloadAndInstall,
    getCurrentVersion,
  };
};

export default useStallionUpdate;
