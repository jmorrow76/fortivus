import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';

// Check if running on native platform
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

// Haptic feedback utilities
export const haptics = {
  // Light tap - for button presses, selections
  light: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
  
  // Medium impact - for significant actions
  medium: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
  
  // Heavy impact - for major completions
  heavy: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
  
  // Success notification - for achievements, badges, PRs
  success: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
  
  // Warning notification
  warning: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
  
  // Error notification
  error: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
  
  // Selection changed - for toggles, pickers
  selectionChanged: async () => {
    if (isNativePlatform()) {
      try {
        await Haptics.selectionChanged();
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  },
};

// Native geolocation utilities
export const nativeGeolocation = {
  // Check if geolocation permissions are granted
  checkPermissions: async () => {
    if (!isNativePlatform()) {
      return { location: 'prompt' as const };
    }
    try {
      return await Geolocation.checkPermissions();
    } catch (e) {
      console.error('Failed to check geolocation permissions:', e);
      return { location: 'denied' as const };
    }
  },
  
  // Request geolocation permissions
  requestPermissions: async () => {
    if (!isNativePlatform()) {
      return { location: 'granted' as const };
    }
    try {
      return await Geolocation.requestPermissions();
    } catch (e) {
      console.error('Failed to request geolocation permissions:', e);
      return { location: 'denied' as const };
    }
  },
  
  // Get current position
  getCurrentPosition: async (options?: PositionOptions): Promise<Position | null> => {
    try {
      if (isNativePlatform()) {
        return await Geolocation.getCurrentPosition(options || {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      } else {
        // Fallback to web API
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
              coords: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                altitudeAccuracy: pos.coords.altitudeAccuracy,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              },
              timestamp: pos.timestamp,
            }),
            (err) => {
              console.error('Web geolocation error:', err);
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }
    } catch (e) {
      console.error('Failed to get current position:', e);
      return null;
    }
  },
  
  // Watch position with callback
  watchPosition: async (
    callback: (position: Position | null, error?: any) => void,
    options?: PositionOptions
  ): Promise<string | number> => {
    const watchOptions = options || {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };
    
    if (isNativePlatform()) {
      try {
        const watchId = await Geolocation.watchPosition(watchOptions, (position, err) => {
          if (err) {
            callback(null, err);
          } else {
            callback(position);
          }
        });
        return watchId;
      } catch (e) {
        console.error('Failed to watch position:', e);
        callback(null, e);
        return '';
      }
    } else {
      // Fallback to web API
      const watchId = navigator.geolocation.watchPosition(
        (pos) => callback({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          },
          timestamp: pos.timestamp,
        }),
        (err) => callback(null, err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return watchId;
    }
  },
  
  // Clear watch
  clearWatch: async (watchId: string | number) => {
    if (isNativePlatform() && typeof watchId === 'string') {
      try {
        await Geolocation.clearWatch({ id: watchId });
      } catch (e) {
        console.error('Failed to clear watch:', e);
      }
    } else if (typeof watchId === 'number') {
      navigator.geolocation.clearWatch(watchId);
    }
  },
};

export default { haptics, nativeGeolocation, isNativePlatform, getPlatform };
