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

interface WorkoutToSync {
  type: 'strength' | 'cardio' | 'running' | 'other';
  startDate: Date;
  endDate: Date;
  calories?: number;
  distance?: number; // meters
  duration: number; // seconds
}

interface UseHealthDataReturn {
  healthData: HealthData;
  isAvailable: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
  writeWorkout: (workout: WorkoutToSync) => Promise<boolean>;
  writeCalories: (calories: number, date?: Date) => Promise<boolean>;
  writeDistance: (meters: number, date?: Date) => Promise<boolean>;
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
        if (platform === 'ios' || platform === 'android') {
          setIsAvailable(true);
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
      // For iOS: HealthKit / For Android: Health Connect
      // Actual implementation requires native plugins
      if (platform === 'ios') {
        console.log('Requesting HealthKit permissions (read + write)...');
      } else if (platform === 'android') {
        console.log('Requesting Health Connect permissions (read + write)...');
      }

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
        localStorage.setItem('health_data', JSON.stringify(simulatedData));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync health data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, isNativePlatform, platform]);

  // Write workout data to Apple Health / Google Fit
  const writeWorkout = useCallback(async (workout: WorkoutToSync): Promise<boolean> => {
    if (!isAuthorized || !isNativePlatform) {
      console.log('Health write not available - storing locally only');
      // Store locally for when native sync becomes available
      const pendingWorkouts = JSON.parse(localStorage.getItem('pending_health_workouts') || '[]');
      pendingWorkouts.push({ ...workout, startDate: workout.startDate.toISOString(), endDate: workout.endDate.toISOString() });
      localStorage.setItem('pending_health_workouts', JSON.stringify(pendingWorkouts));
      return true;
    }

    try {
      if (platform === 'ios') {
        // HealthKit workout write
        console.log('Writing workout to HealthKit:', workout);
        // In production: Call native HealthKit plugin
        // await HealthKit.saveWorkout({ ... })
      } else if (platform === 'android') {
        // Health Connect workout write
        console.log('Writing workout to Health Connect:', workout);
        // In production: Call native Health Connect plugin
        // await HealthConnect.insertRecord({ ... })
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to write workout to health app');
      return false;
    }
  }, [isAuthorized, isNativePlatform, platform]);

  // Write calorie data to Apple Health / Google Fit
  const writeCalories = useCallback(async (calories: number, date?: Date): Promise<boolean> => {
    if (!isAuthorized || !isNativePlatform) {
      console.log('Health write not available - storing locally only');
      const pendingCalories = JSON.parse(localStorage.getItem('pending_health_calories') || '[]');
      pendingCalories.push({ calories, date: (date || new Date()).toISOString() });
      localStorage.setItem('pending_health_calories', JSON.stringify(pendingCalories));
      return true;
    }

    try {
      if (platform === 'ios') {
        console.log('Writing calories to HealthKit:', calories);
        // In production: await HealthKit.saveQuantitySample({ ... })
      } else if (platform === 'android') {
        console.log('Writing calories to Health Connect:', calories);
        // In production: await HealthConnect.insertRecord({ ... })
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to write calories to health app');
      return false;
    }
  }, [isAuthorized, isNativePlatform, platform]);

  // Write distance data to Apple Health / Google Fit
  const writeDistance = useCallback(async (meters: number, date?: Date): Promise<boolean> => {
    if (!isAuthorized || !isNativePlatform) {
      console.log('Health write not available - storing locally only');
      const pendingDistance = JSON.parse(localStorage.getItem('pending_health_distance') || '[]');
      pendingDistance.push({ meters, date: (date || new Date()).toISOString() });
      localStorage.setItem('pending_health_distance', JSON.stringify(pendingDistance));
      return true;
    }

    try {
      if (platform === 'ios') {
        console.log('Writing distance to HealthKit:', meters);
      } else if (platform === 'android') {
        console.log('Writing distance to Health Connect:', meters);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to write distance to health app');
      return false;
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
    writeWorkout,
    writeCalories,
    writeDistance,
  };
};
