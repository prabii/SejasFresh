/**
 * Notification System Validation Script
 * Run this to verify all notification components are properly integrated
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export const validateNotificationSystem = async () => {
  const results = {
    deviceCheck: false,
    permissionCheck: false,
    tokenGeneration: false,
    localNotification: false,
    channelSetup: false,
    errors: [] as string[]
  };

  try {
    // 1. Device Check
    if (Device.isDevice) {
      results.deviceCheck = true;
      console.log('✅ Running on physical device');
    } else {
      results.errors.push('❌ Running on simulator/emulator - push notifications require physical device');
    }

    // 2. Permission Check
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') {
      results.permissionCheck = true;
      console.log('✅ Notification permissions granted');
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        results.permissionCheck = true;
        console.log('✅ Notification permissions granted after request');
      } else {
        results.errors.push('❌ Notification permissions denied');
      }
    }

    // 3. Token Generation (only on physical device)
    if (Device.isDevice && results.permissionCheck) {
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id' // Replace with your actual project ID
        });
        if (token.data) {
          results.tokenGeneration = true;
          console.log('✅ Push token generated:', token.data.substring(0, 20) + '...');
        }
      } catch (error) {
        results.errors.push(`❌ Token generation failed: ${error}`);
      }
    }

    // 4. Local Notification Test
    if (results.permissionCheck) {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'System Validation ✅',
            body: 'Your notification system is working correctly!',
            data: { test: true },
          },
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1 
          },
        });
        
        if (notificationId) {
          results.localNotification = true;
          console.log('✅ Local notification scheduled:', notificationId);
        }
      } catch (error) {
        results.errors.push(`❌ Local notification failed: ${error}`);
      }
    }

    // 5. Channel Setup Check (Android)
    if (Device.osName === 'Android') {
      try {
        const channels = await Notifications.getNotificationChannelsAsync();
        if (channels.length > 0) {
          results.channelSetup = true;
          console.log('✅ Notification channels configured:', channels.map(c => c.name).join(', '));
        } else {
          results.errors.push('❌ No notification channels found');
        }
      } catch (error) {
        results.errors.push(`❌ Channel check failed: ${error}`);
      }
    } else {
      results.channelSetup = true; // iOS doesn't use channels
      console.log('✅ iOS - channels not required');
    }

  } catch (error) {
    results.errors.push(`❌ Validation failed: ${error}`);
  }

  // Summary
  const passed = Object.values(results).filter(v => v === true).length;
  const total = 5;
  
  console.log('\n📊 NOTIFICATION SYSTEM VALIDATION SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Device Check: ${results.deviceCheck ? '✅' : '❌'}`);
  console.log(`Permissions: ${results.permissionCheck ? '✅' : '❌'}`);
  console.log(`Token Generation: ${results.tokenGeneration ? '✅' : '❌'}`);
  console.log(`Local Notifications: ${results.localNotification ? '✅' : '❌'}`);
  console.log(`Channel Setup: ${results.channelSetup ? '✅' : '❌'}`);
  console.log('═'.repeat(50));
  console.log(`Overall Score: ${passed}/${total} (${Math.round((passed/total)*100)}%)`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    results.errors.forEach(error => console.log(error));
  }
  
  if (passed === total) {
    console.log('\n🎉 CONGRATULATIONS! Your notification system is fully functional!');
  } else if (passed >= 3) {
    console.log('\n⚠️  Your notification system is mostly working, but some features may be limited.');
  } else {
    console.log('\n❌ Your notification system needs attention. Please review the setup guide.');
  }
  
  return results;
};

// Usage example:
// validateNotificationSystem().then(results => {
//   console.log('Validation complete:', results);
// });

export default validateNotificationSystem;