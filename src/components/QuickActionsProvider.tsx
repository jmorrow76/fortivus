import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

// Component to handle quick actions and deep links
export const QuickActionsProvider = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle URL params for PWA shortcuts
    const urlParams = new URLSearchParams(location.search);
    const action = urlParams.get('action');
    
    if (action === 'start') {
      // Clean up the URL
      const cleanPath = location.pathname;
      window.history.replaceState({}, '', cleanPath);
    }

    // Set up native listeners only on native platforms
    if (Capacitor.isNativePlatform()) {
      const setupNativeListeners = async () => {
        try {
          const { App } = await import('@capacitor/app');
          
          // Handle app URL open events (deep links and quick actions)
          App.addListener('appUrlOpen', (event) => {
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
              navigate(path);
            }
          });

          // Check if app was launched with a URL
          const launchUrl = await App.getLaunchUrl();
          if (launchUrl?.url) {
            const url = new URL(launchUrl.url);
            const path = url.pathname;
            
            if (path.includes('start-run')) {
              navigate('/running');
            } else if (path.includes('start-workout')) {
              navigate('/workouts');
            } else if (path.includes('daily-checkin')) {
              navigate('/daily-checkin');
            }
          }
        } catch (error) {
          console.log('Native quick actions not available:', error);
        }
      };

      setupNativeListeners();
    }
  }, [navigate, location]);

  return null;
};

export default QuickActionsProvider;
