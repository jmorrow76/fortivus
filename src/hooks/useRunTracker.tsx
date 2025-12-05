import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

interface RunSession {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  avg_pace_seconds_per_km: number | null;
  calories_burned: number | null;
  route_coordinates: Coordinate[] | null;
  notes: string | null;
  created_at: string;
}

interface ActiveRun {
  startTime: Date;
  coordinates: Coordinate[];
  distance: number;
  duration: number;
  currentPace: number;
}

interface UseRunTrackerReturn {
  isTracking: boolean;
  activeRun: ActiveRun | null;
  currentPosition: Coordinate | null;
  runHistory: RunSession[];
  isLoading: boolean;
  error: string | null;
  startRun: () => Promise<void>;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: (notes?: string) => Promise<RunSession | null>;
  isPaused: boolean;
  fetchRunHistory: () => Promise<void>;
}

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Calculate total distance from coordinates array
const calculateTotalDistance = (coordinates: Coordinate[]): number => {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += calculateDistance(coordinates[i - 1], coordinates[i]);
  }
  return total;
};

// Estimate calories burned (rough estimate based on distance and average weight)
const estimateCalories = (distanceMeters: number): number => {
  // Roughly 60 calories per km for average person
  return Math.round((distanceMeters / 1000) * 60);
};

export const useRunTracker = (): UseRunTrackerReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Coordinate | null>(null);
  const [runHistory, setRunHistory] = useState<RunSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pausedDurationRef = useRef<number>(0);

  // Award XP and check for running badges
  const awardRunXPAndBadges = useCallback(async (
    distanceMeters: number, 
    durationSeconds: number, 
    paceSecondsPerKm: number
  ) => {
    if (!user) return;

    // Calculate XP: base 25 + 10 per km
    const distanceKm = distanceMeters / 1000;
    const xpEarned = Math.round(25 + distanceKm * 10);

    // Update user streaks with XP
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('total_xp')
      .eq('user_id', user.id)
      .maybeSingle();

    if (streakData) {
      await supabase
        .from('user_streaks')
        .update({ total_xp: streakData.total_xp + xpEarned })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_streaks')
        .insert({ user_id: user.id, total_xp: xpEarned });
    }

    // Post to activity feed
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      activity_type: 'run_completed',
      xp_earned: xpEarned,
    });

    toast({
      title: `🏃 Run Complete! +${xpEarned} XP`,
      description: `You ran ${distanceKm.toFixed(2)} km in ${Math.floor(durationSeconds / 60)} minutes!`,
    });

    // Check for running badges
    await checkRunningBadges(distanceMeters, durationSeconds, paceSecondsPerKm);
  }, [user, toast]);

  const checkRunningBadges = async (
    distanceMeters: number, 
    durationSeconds: number, 
    paceSecondsPerKm: number,
    currentStreak: number = 0
  ) => {
    if (!user) return;

    // Get all badges, user badges, all runs, and running goals
    const [{ data: allBadges }, { data: userBadges }, { data: allRuns }, { data: goalData }] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
      supabase.from('running_sessions').select('distance_meters').eq('user_id', user.id),
      supabase.from('running_goals').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    ]);

    if (!allBadges) return;

    const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
    const totalRuns = (allRuns?.length || 0);
    const totalDistanceKm = (allRuns || []).reduce((sum, r) => sum + (r.distance_meters || 0), 0) / 1000;
    const currentDistanceKm = distanceMeters / 1000;
    const runStreak = goalData?.current_streak || currentStreak;

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      switch (badge.requirement_type) {
        // Running session count badges
        case 'running_sessions':
          shouldAward = totalRuns >= badge.requirement_value;
          break;
        // Single run distance badges (5K, 10K, half marathon, marathon)
        case 'running_distance_single':
          shouldAward = currentDistanceKm >= badge.requirement_value;
          break;
        // Running streak badges
        case 'running_streak':
          shouldAward = runStreak >= badge.requirement_value;
          break;
        // Total distance badges
        case 'running_total_distance':
          shouldAward = totalDistanceKm >= badge.requirement_value;
          break;
      }

      if (shouldAward) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id,
        });

        await supabase.from('activity_feed').insert({
          user_id: user.id,
          activity_type: 'badge_earned',
          badge_id: badge.id,
          xp_earned: badge.xp_value,
        });

        // Add badge XP
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('total_xp')
          .eq('user_id', user.id)
          .maybeSingle();

        if (streakData) {
          await supabase
            .from('user_streaks')
            .update({ total_xp: streakData.total_xp + badge.xp_value })
            .eq('user_id', user.id);
        }

        toast({
          title: '🏆 Badge Earned!',
          description: `You earned "${badge.name}"!`,
        });
      }
    }
  };

  // Update running streak
  const updateRunningStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get current running goal/streak data
    const { data: goalData } = await supabase
      .from('running_goals')
      .select('current_streak, longest_streak, last_run_date, streak_type')
      .eq('user_id', user.id)
      .maybeSingle();

    if (goalData) {
      let newStreak = goalData.current_streak;
      const lastDate = goalData.last_run_date;

      // Check if already ran today
      if (lastDate === today) {
        return; // Already counted for today
      }

      // Calculate new streak
      if (lastDate === yesterdayStr) {
        newStreak += 1; // Consecutive day
      } else if (!lastDate) {
        newStreak = 1; // First run
      } else {
        newStreak = 1; // Streak broken, start over
      }

      const longestStreak = Math.max(newStreak, goalData.longest_streak);

      await supabase
        .from('running_goals')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_run_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (newStreak > 1) {
        toast({
          title: `🔥 ${newStreak} Day Running Streak!`,
          description: newStreak === goalData.longest_streak + 1 
            ? "New personal record!" 
            : "Keep it up!",
        });
      }
    } else {
      // Create initial record
      await supabase.from('running_goals').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_run_date: today,
      });
    }
  };

  const fetchRunHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('running_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (fetchError) throw fetchError;
      
      // Parse route_coordinates from JSON
      const parsedData = (data || []).map(run => ({
        ...run,
        route_coordinates: run.route_coordinates as unknown as Coordinate[] | null
      }));
      
      setRunHistory(parsedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch run history');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRunHistory();
    }
  }, [user, fetchRunHistory]);

  const startRun = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);
    setIsTracking(true);
    setIsPaused(false);
    pausedDurationRef.current = 0;

    const startTime = new Date();
    setActiveRun({
      startTime,
      coordinates: [],
      distance: 0,
      duration: 0,
      currentPace: 0,
    });

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: Coordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        setCurrentPosition(newCoord);

        if (!isPaused) {
          setActiveRun((prev) => {
            if (!prev) return prev;
            
            const newCoords = [...prev.coordinates, newCoord];
            const newDistance = calculateTotalDistance(newCoords);
            const elapsedSeconds = (Date.now() - prev.startTime.getTime()) / 1000 - pausedDurationRef.current;
            
            // Calculate pace (seconds per km)
            const paceSecondsPerKm = newDistance > 0 
              ? (elapsedSeconds / (newDistance / 1000))
              : 0;

            return {
              ...prev,
              coordinates: newCoords,
              distance: newDistance,
              duration: elapsedSeconds,
              currentPace: paceSecondsPerKm,
            };
          });
        }
      },
      (geoError) => {
        setError(`Geolocation error: ${geoError.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Update duration every second
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setActiveRun((prev) => {
          if (!prev) return prev;
          const elapsedSeconds = (Date.now() - prev.startTime.getTime()) / 1000 - pausedDurationRef.current;
          return { ...prev, duration: elapsedSeconds };
        });
      }
    }, 1000);
  }, [isPaused]);

  const pauseRun = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeRun = useCallback(() => {
    if (activeRun) {
      const currentDuration = (Date.now() - activeRun.startTime.getTime()) / 1000;
      pausedDurationRef.current = currentDuration - activeRun.duration;
    }
    setIsPaused(false);
  }, [activeRun]);

  const stopRun = useCallback(async (notes?: string): Promise<RunSession | null> => {
    if (!user || !activeRun) return null;

    // Stop tracking
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsTracking(false);
    setIsPaused(false);

    const completedAt = new Date();
    const durationSeconds = Math.round(activeRun.duration);
    const distanceMeters = activeRun.distance;
    const avgPace = distanceMeters > 0 
      ? durationSeconds / (distanceMeters / 1000) 
      : 0;
    const calories = estimateCalories(distanceMeters);

    try {
      const { data, error: insertError } = await supabase
        .from('running_sessions')
        .insert([{
          user_id: user.id,
          started_at: activeRun.startTime.toISOString(),
          completed_at: completedAt.toISOString(),
          duration_seconds: durationSeconds,
          distance_meters: distanceMeters,
          avg_pace_seconds_per_km: avgPace,
          calories_burned: calories,
          route_coordinates: activeRun.coordinates as unknown as any,
          notes,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Award XP and check for badges
      await awardRunXPAndBadges(distanceMeters, durationSeconds, avgPace);
      
      // Update running streak
      await updateRunningStreak();

      setActiveRun(null);
      await fetchRunHistory();
      
      return {
        ...data,
        route_coordinates: data.route_coordinates as unknown as Coordinate[] | null
      };
    } catch (err: any) {
      setError(err.message || 'Failed to save run');
      return null;
    }
  }, [user, activeRun, fetchRunHistory, awardRunXPAndBadges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    activeRun,
    currentPosition,
    runHistory,
    isLoading,
    error,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    isPaused,
    fetchRunHistory,
  };
};
