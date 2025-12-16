import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { haptics } from './useNativeFeatures';

// HealthKit types
interface HealthKitSample {
  uuid: string;
  value: number;
  unit: string;
  startDate: string;
  endDate: string;
  sourceName: string;
  sourceBundleId: string;
}

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

// Read permissions for HealthKit
const READ_PERMISSIONS = [
  'stepCount',
  'heartRate', 
  'sleepAnalysis',
  'activeEnergyBurned',
  'distanceWalkingRunning',
  'workout',
];

// Write permissions for HealthKit  
const WRITE_PERMISSIONS = [
  'activeEnergyBurned',
  'distanceWalkingRunning',
  'workout',
];

export const useHealthData = (): UseHealthDataReturn => {
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [HealthKit, setHealthKit] = useState<any>(null);

  const isNativePlatform = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  // Dynamically import HealthKit on iOS
  useEffect(() => {
    const loadHealthKit = async () => {
      if (isNativePlatform && platform === 'ios') {
        try {
          const { CapacitorHealthkit } = await import('capacitor-healthkit');
          setHealthKit(CapacitorHealthkit);
          setIsAvailable(true);
          
          // Check if already authorized
          const storedAuth = localStorage.getItem('healthkit_authorized');
          if (storedAuth === 'true') {
            setIsAuthorized(true);
          }
        } catch (err) {
          console.error('Failed to load HealthKit:', err);
          setIsAvailable(false);
        }
      } else {
        setIsAvailable(false);
      }
      setIsLoading(false);
    };

    loadHealthKit();
  }, [isNativePlatform, platform]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform || platform !== 'ios') {
      setError('HealthKit is only available on iOS devices');
      return false;
    }

    if (!HealthKit) {
      setError('HealthKit not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await HealthKit.requestAuthorization({
        all: [],
        read: READ_PERMISSIONS,
        write: WRITE_PERMISSIONS,
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
  }, [isNativePlatform, platform, HealthKit]);

  const syncHealthData = useCallback(async (): Promise<void> => {
    if (!isAuthorized || !HealthKit) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Start of today

      // Query steps
      let steps = 0;
      try {
        const stepsResult = await HealthKit.queryHKitSampleType({
          sampleName: 'stepCount',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 0,
        });
        steps = stepsResult?.resultData?.reduce((sum: number, s: HealthKitSample) => sum + s.value, 0) || 0;
      } catch (e) {
        console.log('Steps query failed:', e);
      }

      // Query heart rate (most recent)
      let heartRate: number | null = null;
      try {
        const hrResult = await HealthKit.queryHKitSampleType({
          sampleName: 'heartRate',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 1,
        });
        if (hrResult?.resultData?.length > 0) {
          heartRate = Math.round(hrResult.resultData[0].value);
        }
      } catch (e) {
        console.log('Heart rate query failed:', e);
      }

      // Query active calories
      let activeCalories: number | null = null;
      try {
        const calResult = await HealthKit.queryHKitSampleType({
          sampleName: 'activeEnergyBurned',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 0,
        });
        activeCalories = Math.round(calResult?.resultData?.reduce((sum: number, s: HealthKitSample) => sum + s.value, 0) || 0);
      } catch (e) {
        console.log('Calories query failed:', e);
      }

      // Query distance
      let distance: number | null = null;
      try {
        const distResult = await HealthKit.queryHKitSampleType({
          sampleName: 'distanceWalkingRunning',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 0,
        });
        const totalMeters = distResult?.resultData?.reduce((sum: number, s: HealthKitSample) => sum + s.value, 0) || 0;
        distance = Math.round((totalMeters / 1000) * 10) / 10; // Convert to km
      } catch (e) {
        console.log('Distance query failed:', e);
      }

      // Query sleep (last night)
      let sleepHours: number | null = null;
      try {
        const sleepStart = new Date();
        sleepStart.setDate(sleepStart.getDate() - 1);
        sleepStart.setHours(20, 0, 0, 0); // 8pm yesterday
        
        const sleepResult = await HealthKit.queryHKitSampleType({
          sampleName: 'sleepAnalysis',
          startDate: sleepStart.toISOString(),
          endDate: endDate.toISOString(),
          limit: 0,
        });
        
        if (sleepResult?.resultData?.length > 0) {
          // Sum up sleep duration
          let totalSleepMs = 0;
          for (const sample of sleepResult.resultData) {
            const start = new Date(sample.startDate).getTime();
            const end = new Date(sample.endDate).getTime();
            totalSleepMs += (end - start);
          }
          sleepHours = Math.round((totalSleepMs / (1000 * 60 * 60)) * 10) / 10;
        }
      } catch (e) {
        console.log('Sleep query failed:', e);
      }

      const newHealthData: HealthData = {
        steps,
        heartRate,
        sleepHours,
        activeCalories,
        distance,
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
  }, [isAuthorized, HealthKit]);

  // Write workout to HealthKit
  const writeWorkout = useCallback(async (workout: WorkoutToSync): Promise<boolean> => {
    // Store locally for sync later if not on iOS
    if (!isAuthorized || !HealthKit) {
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
      // Map workout type to HealthKit activity type
      const activityTypeMap: Record<string, number> = {
        running: 37, // HKWorkoutActivityType.running
        strength: 50, // HKWorkoutActivityType.traditionalStrengthTraining  
        cardio: 25, // HKWorkoutActivityType.highIntensityIntervalTraining
        other: 3000, // HKWorkoutActivityType.other
      };

      await HealthKit.saveWorkout({
        activityType: activityTypeMap[workout.type] || 3000,
        startDate: workout.startDate.toISOString(),
        endDate: workout.endDate.toISOString(),
        duration: workout.duration,
        totalEnergyBurned: workout.calories || 0,
        totalDistance: workout.distance || 0,
      });

      haptics.success();
      return true;
    } catch (err: any) {
      console.error('Failed to write workout to HealthKit:', err);
      setError(err.message || 'Failed to write workout');
      return false;
    }
  }, [isAuthorized, HealthKit]);

  // Write calories to HealthKit
  const writeCalories = useCallback(async (calories: number, date?: Date): Promise<boolean> => {
    if (!isAuthorized || !HealthKit) {
      const pendingCalories = JSON.parse(localStorage.getItem('pending_health_calories') || '[]');
      pendingCalories.push({ calories, date: (date || new Date()).toISOString() });
      localStorage.setItem('pending_health_calories', JSON.stringify(pendingCalories));
      return true;
    }

    try {
      const sampleDate = date || new Date();
      await HealthKit.saveQuantitySample({
        sampleName: 'activeEnergyBurned',
        value: calories,
        unit: 'kcal',
        startDate: sampleDate.toISOString(),
        endDate: sampleDate.toISOString(),
      });
      return true;
    } catch (err: any) {
      console.error('Failed to write calories:', err);
      setError(err.message || 'Failed to write calories');
      return false;
    }
  }, [isAuthorized, HealthKit]);

  // Write distance to HealthKit
  const writeDistance = useCallback(async (meters: number, date?: Date): Promise<boolean> => {
    if (!isAuthorized || !HealthKit) {
      const pendingDistance = JSON.parse(localStorage.getItem('pending_health_distance') || '[]');
      pendingDistance.push({ meters, date: (date || new Date()).toISOString() });
      localStorage.setItem('pending_health_distance', JSON.stringify(pendingDistance));
      return true;
    }

    try {
      const sampleDate = date || new Date();
      await HealthKit.saveQuantitySample({
        sampleName: 'distanceWalkingRunning',
        value: meters,
        unit: 'm',
        startDate: sampleDate.toISOString(),
        endDate: sampleDate.toISOString(),
      });
      return true;
    } catch (err: any) {
      console.error('Failed to write distance:', err);
      setError(err.message || 'Failed to write distance');
      return false;
    }
  }, [isAuthorized, HealthKit]);

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
    if (isAuthorized && HealthKit) {
      syncHealthData();
    }
  }, [isAuthorized, HealthKit, syncHealthData]);

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
