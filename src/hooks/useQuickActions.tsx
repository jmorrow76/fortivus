import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// Hook to handle iOS Quick Actions and deep links
export const useQuickActions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only set up listeners on native platforms
    if (!Capacitor.isNativePlatform()) {
      // For web, check URL params for PWA shortcuts
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      
      if (action === 'start') {
        // Handle PWA shortcut action parameter
        const path = window.location.pathname;
        if (path === '/running') {
          // Auto-start run mode could be triggered here
          console.log('Quick action: Start Run');
        } else if (path === '/workouts') {
          // Auto-start workout mode could be triggered here
          console.log('Quick action: Start Workout');
        }
      }
      return;
    }

    // Handle app URL open events (deep links and quick actions)
    const handleAppUrlOpen = (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);
      const path = url.pathname;
      
      // Handle quick action deep links
      if (path.includes('start-run') || url.searchParams.get('action') === 'start-run') {
        navigate('/running');
      } else if (path.includes('start-workout') || url.searchParams.get('action') === 'start-workout') {
        navigate('/workouts');
      } else if (path.includes('daily-checkin') || url.searchParams.get('action') === 'checkin') {
        navigate('/daily-checkin');
      } else if (path) {
        // General deep link handling
        navigate(path);
      }
    };

    // Listen for app URL open events
    App.addListener('appUrlOpen', handleAppUrlOpen);

    // Check if app was launched with a URL
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleAppUrlOpen({ url: result.url });
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};

// Siri Shortcuts configuration for iOS
export const siriShortcuts = {
  startRun: {
    persistentIdentifier: 'com.fortivus.start-run',
    title: 'Start Run',
    suggestedInvocationPhrase: 'Start my run',
    userInfo: { action: 'start-run' },
  },
  startWorkout: {
    persistentIdentifier: 'com.fortivus.start-workout',
    title: 'Start Workout',
    suggestedInvocationPhrase: 'Start my workout',
    userInfo: { action: 'start-workout' },
  },
  dailyCheckin: {
    persistentIdentifier: 'com.fortivus.daily-checkin',
    title: 'Daily Check-in',
    suggestedInvocationPhrase: 'Check in with Fortivus',
    userInfo: { action: 'checkin' },
  },
};

export default useQuickActions;
