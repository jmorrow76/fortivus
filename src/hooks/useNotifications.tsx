import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface NotificationPreferences {
  id: string;
  checkin_reminder: boolean;
  streak_alert: boolean;
  reminder_time: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching notification preferences:', error);
    } else if (data) {
      setPreferences(data);
    }
    setLoading(false);
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: 'Notifications enabled',
          description: 'You will receive reminders for daily check-ins.'
        });
        return true;
      } else {
        toast({
          title: 'Permission denied',
          description: 'Enable notifications in your browser settings.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const savePreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        ...prefs
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive'
      });
      return;
    }

    setPreferences(data);
    toast({
      title: 'Preferences saved',
      description: 'Your notification settings have been updated.'
    });
  };

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;

    try {
      new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

  const checkAndNotifyStreak = useCallback(async () => {
    if (!user || permission !== 'granted' || !preferences?.streak_alert) return;

    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak, last_checkin_date')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = streak.last_checkin_date;

    if (lastCheckin !== today && streak.current_streak > 0) {
      showNotification('🔥 Protect your streak!', {
        body: `You have a ${streak.current_streak}-day streak. Check in today to keep it going!`,
        tag: 'streak-reminder'
      });
    }
  }, [user, permission, preferences, showNotification]);

  const scheduleReminderCheck = useCallback(() => {
    if (!preferences?.checkin_reminder || permission !== 'granted') return;

    // Check every hour if it's time to remind
    const checkTime = () => {
      const now = new Date();
      const [hours, minutes] = preferences.reminder_time.split(':').map(Number);
      
      if (now.getHours() === hours && now.getMinutes() < 5) {
        checkAndNotifyStreak();
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60 * 60 * 1000); // Check hourly
    
    return () => clearInterval(interval);
  }, [preferences, permission, checkAndNotifyStreak]);

  useEffect(() => {
    if (preferences && permission === 'granted') {
      return scheduleReminderCheck();
    }
  }, [preferences, permission, scheduleReminderCheck]);

  return {
    preferences,
    permission,
    loading,
    requestPermission,
    savePreferences,
    showNotification,
    checkAndNotifyStreak
  };
}
