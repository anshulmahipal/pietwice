/**
 * Stallion Configuration
 * 
 * Configure your Stallion API key and other settings here.
 * Get your API key from https://stalliontech.io
 */

module.exports = {
  // Your Stallion API key (get from https://stalliontech.io)
  apiKey: process.env.STALLION_API_KEY || '',
  
  // App name/identifier
  appName: 'pietwice',
  
  // Platform-specific configurations
  ios: {
    // iOS bundle identifier
    bundleId: 'com.anotherwhy.pietwice',
  },
  
  android: {
    // Android package name
    packageName: 'com.anotherwhy.pietwice',
  },
  
  // Update check settings
  checkOnLaunch: true,
  checkInterval: 3600000, // Check every hour (in milliseconds)
  
  // Update installation settings
  installMode: 'IMMEDIATE', // Options: IMMEDIATE, ON_NEXT_RESTART, ON_NEXT_RESUME
  mandatoryInstallMode: 'IMMEDIATE',
  
  // Rollback settings
  rollbackTimeout: 86400000, // 24 hours in milliseconds
};
