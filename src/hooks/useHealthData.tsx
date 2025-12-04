import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface HealthData {
  steps: number;
  heartRate: number | null;
  sleepHours: number | null;
  activeCalories: number | null;
  distance: number | null;
  lastSynced: Date | null;
}

interface UseHealthDataReturn {
  healthData: HealthData;
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
}

const defaultHealthData: HealthData = {
  steps: 0,
  heartRate: null,
  sleepHours: null,
  activeCalories: null,
  distance: null,
  lastSynced: null,
};

export const useHealthData = (): UseHealthDataReturn => {
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNativePlatform = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    const checkAvailability = async () => {
      if (!isNativePlatform) {
        setIsAvailable(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if running on iOS or Android
        if (platform === 'ios' || platform === 'android') {
          setIsAvailable(true);
          // Check if we have stored authorization
          const storedAuth = localStorage.getItem('healthkit_authorized');
          if (storedAuth === 'true') {
            setIsAuthorized(true);
          }
        }
      } catch (err) {
        console.error('Health availability check failed:', err);
        setError('Failed to check health data availability');
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [isNativePlatform, platform]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform) {
      setError('Health data is only available on native platforms');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For iOS: HealthKit
      // For Android: Health Connect (Google Fit successor)
      // This is a placeholder - actual implementation requires native plugins
      
      if (platform === 'ios') {
        // Request HealthKit permissions
        // In a real implementation, you'd call the native HealthKit plugin here
        console.log('Requesting HealthKit permissions...');
      } else if (platform === 'android') {
        // Request Health Connect permissions  
        // In a real implementation, you'd call the Health Connect plugin here
        console.log('Requesting Health Connect permissions...');
      }

      // Simulate successful authorization for demo
      localStorage.setItem('healthkit_authorized', 'true');
      setIsAuthorized(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to request health permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNativePlatform, platform]);

  const syncHealthData = useCallback(async (): Promise<void> => {
    if (!isAuthorized || !isNativePlatform) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // This is placeholder logic - in production you'd call the native health plugins
      // For now, we'll simulate fetching data
      
      if (platform === 'ios' || platform === 'android') {
        // Simulated health data - replace with actual native calls
        const simulatedData: HealthData = {
          steps: Math.floor(Math.random() * 10000) + 2000,
          heartRate: Math.floor(Math.random() * 30) + 60,
          sleepHours: Math.round((Math.random() * 3 + 5) * 10) / 10,
          activeCalories: Math.floor(Math.random() * 500) + 200,
          distance: Math.round((Math.random() * 8 + 2) * 10) / 10,
          lastSynced: new Date(),
        };

        setHealthData(simulatedData);
        
        // Store in localStorage for persistence
        localStorage.setItem('health_data', JSON.stringify(simulatedData));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync health data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, isNativePlatform, platform]);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('health_data');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setHealthData({
          ...parsed,
          lastSynced: parsed.lastSynced ? new Date(parsed.lastSynced) : null,
        });
      } catch (e) {
        console.error('Failed to parse cached health data');
      }
    }
  }, []);

  // Auto-sync when authorized
  useEffect(() => {
    if (isAuthorized && isNativePlatform) {
      syncHealthData();
    }
  }, [isAuthorized, isNativePlatform, syncHealthData]);

  return {
    healthData,
    isAvailable,
    isAuthorized,
    isLoading,
    error,
    requestPermissions,
    syncHealthData,
  };
};
