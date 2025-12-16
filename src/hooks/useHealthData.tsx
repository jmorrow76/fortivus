import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { haptics } from './useNativeFeatures';

interface HealthData {
  steps: number;
  heartRate: number | null;
  sleepHours: number | null;
  activeCalories: number | null;
  distance: number | null; // in km
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

/**
 * Health Data Hook
 * 
 * This hook provides a unified interface for health data that:
 * - On web: Stores data locally and returns unavailable status
 * - On iOS: Will use native HealthKit via Swift bridge (requires native setup)
 * 
 * For iOS HealthKit integration, add the following to your native iOS project:
 * 1. Enable HealthKit capability in Xcode
 * 2. Add Info.plist entries for NSHealthShareUsageDescription and NSHealthUpdateUsageDescription
 * 3. Implement native Swift plugin for HealthKit communication
 */
export const useHealthData = (): UseHealthDataReturn => {
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNativePlatform = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  // Check availability on mount
  useEffect(() => {
    // HealthKit is only available on iOS native
    if (isNativePlatform && platform === 'ios') {
      // Check if native HealthKit plugin is available
      const plugins = (Capacitor as any).Plugins;
      if (plugins?.HealthKit) {
        setIsAvailable(true);
        const storedAuth = localStorage.getItem('healthkit_authorized');
        if (storedAuth === 'true') {
          setIsAuthorized(true);
        }
      } else {
        // Native plugin not configured - will need native setup
        setIsAvailable(false);
        console.log('HealthKit native plugin not available. Configure in native iOS project.');
      }
    } else {
      setIsAvailable(false);
    }
  }, [isNativePlatform, platform]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform || platform !== 'ios') {
      setError('HealthKit is only available on iOS devices');
      return false;
    }

    const plugins = (Capacitor as any).Plugins;
    if (!plugins?.HealthKit) {
      setError('HealthKit native plugin not configured');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await plugins.HealthKit.requestAuthorization({
        read: ['stepCount', 'heartRate', 'sleepAnalysis', 'activeEnergyBurned', 'distanceWalkingRunning', 'workout'],
        write: ['activeEnergyBurned', 'distanceWalkingRunning', 'workout'],
      });

      localStorage.setItem('healthkit_authorized', 'true');
      setIsAuthorized(true);
      haptics.success();
      return true;
    } catch (err: any) {
      console.error('HealthKit authorization failed:', err);
      setError(err.message || 'Failed to request HealthKit permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNativePlatform, platform]);

  const syncHealthData = useCallback(async (): Promise<void> => {
    const plugins = (Capacitor as any).Plugins;
    
    if (!isAuthorized || !plugins?.HealthKit) {
      // Load from local cache only
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const result = await plugins.HealthKit.queryHealthData({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        types: ['stepCount', 'heartRate', 'sleepAnalysis', 'activeEnergyBurned', 'distanceWalkingRunning'],
      });

      const newHealthData: HealthData = {
        steps: result?.steps || 0,
        heartRate: result?.heartRate || null,
        sleepHours: result?.sleepHours || null,
        activeCalories: result?.activeCalories || null,
        distance: result?.distance || null,
        lastSynced: new Date(),
      };

      setHealthData(newHealthData);
      localStorage.setItem('health_data', JSON.stringify(newHealthData));
      haptics.light();
    } catch (err: any) {
      console.error('HealthKit sync failed:', err);
      setError(err.message || 'Failed to sync health data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized]);

  // Write workout - stores locally for later sync if not on iOS
  const writeWorkout = useCallback(async (workout: WorkoutToSync): Promise<boolean> => {
    const plugins = (Capacitor as any).Plugins;
    
    // Store locally for sync later if not on iOS
    if (!isAuthorized || !plugins?.HealthKit) {
      const pendingWorkouts = JSON.parse(localStorage.getItem('pending_health_workouts') || '[]');
      pendingWorkouts.push({
        ...workout,
        startDate: workout.startDate.toISOString(),
        endDate: workout.endDate.toISOString(),
      });
      localStorage.setItem('pending_health_workouts', JSON.stringify(pendingWorkouts));
      return true;
    }

    try {
      await plugins.HealthKit.saveWorkout({
        type: workout.type,
        startDate: workout.startDate.toISOString(),
        endDate: workout.endDate.toISOString(),
        duration: workout.duration,
        calories: workout.calories || 0,
        distance: workout.distance || 0,
      });

      haptics.success();
      return true;
    } catch (err: any) {
      console.error('Failed to write workout to HealthKit:', err);
      setError(err.message || 'Failed to write workout');
      return false;
    }
  }, [isAuthorized]);

  // Write calories - stores locally for later sync if not on iOS
  const writeCalories = useCallback(async (calories: number, date?: Date): Promise<boolean> => {
    const plugins = (Capacitor as any).Plugins;
    
    if (!isAuthorized || !plugins?.HealthKit) {
      const pendingCalories = JSON.parse(localStorage.getItem('pending_health_calories') || '[]');
      pendingCalories.push({ calories, date: (date || new Date()).toISOString() });
      localStorage.setItem('pending_health_calories', JSON.stringify(pendingCalories));
      return true;
    }

    try {
      const sampleDate = date || new Date();
      await plugins.HealthKit.saveCalories({
        value: calories,
        date: sampleDate.toISOString(),
      });
      return true;
    } catch (err: any) {
      console.error('Failed to write calories:', err);
      setError(err.message || 'Failed to write calories');
      return false;
    }
  }, [isAuthorized]);

  // Write distance - stores locally for later sync if not on iOS
  const writeDistance = useCallback(async (meters: number, date?: Date): Promise<boolean> => {
    const plugins = (Capacitor as any).Plugins;
    
    if (!isAuthorized || !plugins?.HealthKit) {
      const pendingDistance = JSON.parse(localStorage.getItem('pending_health_distance') || '[]');
      pendingDistance.push({ meters, date: (date || new Date()).toISOString() });
      localStorage.setItem('pending_health_distance', JSON.stringify(pendingDistance));
      return true;
    }

    try {
      const sampleDate = date || new Date();
      await plugins.HealthKit.saveDistance({
        value: meters,
        date: sampleDate.toISOString(),
      });
      return true;
    } catch (err: any) {
      console.error('Failed to write distance:', err);
      setError(err.message || 'Failed to write distance');
      return false;
    }
  }, [isAuthorized]);

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
    if (isAuthorized && isAvailable) {
      syncHealthData();
    }
  }, [isAuthorized, isAvailable, syncHealthData]);

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
