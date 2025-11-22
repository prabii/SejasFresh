// Temporary module declarations to satisfy TypeScript in the editor
// These are minimal shims — when you run `npm install` the real types will apply
declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module 'expo-device' {
  const Device: any;
  export = Device;
}

// Lightweight shim for expo-notifications used in the editor. This provides the
// specific members referenced across the codebase so the TypeScript server
// stops reporting "Cannot find namespace 'Notifications'". It's temporary and
// will be superseded by the real @types when you run `npm install`.
declare module 'expo-notifications' {
  export const AndroidImportance: {
    DEFAULT: number;
    MAX: number;
    HIGH: number;
    LOW: number;
    MIN: number;
    NONE: number;
    [key: string]: number;
  };

  export const SchedulableTriggerInputTypes: {
    TIME_INTERVAL: string;
    DATE?: string;
    [key: string]: string | undefined;
  };

  export type Notification = any;
  export type NotificationResponse = any;
  export type NotificationPermissionsStatus = any;
  export type Subscription = { remove: () => void };

  export function setNotificationHandler(handler: any): void;
  export function setNotificationChannelAsync(channelId: string, options: any): Promise<void>;
  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function requestPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function getExpoPushTokenAsync(options?: any): Promise<{ data: string }>;
  export function scheduleNotificationAsync(options: any): Promise<string>;
  export function cancelScheduledNotificationAsync(id: string): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function addNotificationReceivedListener(listener: (notification: Notification) => void): Subscription;
  export function addNotificationResponseReceivedListener(listener: (response: NotificationResponse) => void): Subscription;
  export function setNotificationChannelAsync(channelId: string, options: any): Promise<void>;

  // Keep export as namespace-like default to match `import * as Notifications from 'expo-notifications'` usage
  const Notifications: {
    AndroidImportance: typeof AndroidImportance;
    SchedulableTriggerInputTypes: typeof SchedulableTriggerInputTypes;
    setNotificationHandler: typeof setNotificationHandler;
    setNotificationChannelAsync: typeof setNotificationChannelAsync;
    getPermissionsAsync: typeof getPermissionsAsync;
    requestPermissionsAsync: typeof requestPermissionsAsync;
    getExpoPushTokenAsync: typeof getExpoPushTokenAsync;
    scheduleNotificationAsync: typeof scheduleNotificationAsync;
    cancelScheduledNotificationAsync: typeof cancelScheduledNotificationAsync;
    cancelAllScheduledNotificationsAsync: typeof cancelAllScheduledNotificationsAsync;
    addNotificationReceivedListener: typeof addNotificationReceivedListener;
    addNotificationResponseReceivedListener: typeof addNotificationResponseReceivedListener;
  };

  export = Notifications;
}

// Add any other temporary shims here if the editor complains
