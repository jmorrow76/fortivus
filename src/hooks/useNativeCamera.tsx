import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';

export interface CameraResult {
  dataUrl?: string;
  blob?: Blob;
  path?: string;
}

// Helper to detect iPad specifically
const isIPad = (): boolean => {
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios') return false;
  
  // Check for iPad user agent (works in WebView)
  const ua = navigator.userAgent || '';
  return /iPad/i.test(ua) || 
    // iPad on iOS 13+ reports as Mac
    (/Macintosh/i.test(ua) && 'ontouchend' in document);
};

export const useNativeCamera = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const isiPadDevice = isIPad();

  // Detect if user cancelled - comprehensive patterns for all iOS devices
  const isCancellation = (errorMessage: string): boolean => {
    const cancelPatterns = [
      'cancel', 'Cancel', 'CANCEL',
      'user', 'User', 'USER',
      'dismiss', 'Dismiss', 'DISMISS',
      'no image', 'No image', 'NO IMAGE',
      'no photo', 'No photo', 'NO PHOTO',
      'popover', 'Popover', 'POPOVER',
      'interrupted', 'Interrupted',
      'aborted', 'Aborted',
    ];
    const lowerMessage = errorMessage.toLowerCase();
    return cancelPatterns.some(pattern => lowerMessage.includes(pattern.toLowerCase()));
  };

  // Check and request camera permissions with iPad support
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNative) return true; // Web doesn't need explicit permissions

    try {
      let permissions: PermissionStatus;
      
      try {
        permissions = await Camera.checkPermissions();
      } catch (checkErr) {
        console.warn('[Camera] Permission check failed, continuing:', checkErr);
        return true; // Let camera API handle it
      }
      
      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      // Request permissions if not granted - wrap in try-catch for iPad
      try {
        const requested = await Camera.requestPermissions({
          permissions: ['camera', 'photos'],
        });
        return requested.camera === 'granted' || requested.photos === 'granted';
      } catch (reqErr) {
        console.warn('[Camera] Permission request warning:', reqErr);
        return true; // Proceed anyway - camera will request as needed
      }
    } catch (err) {
      console.error('[Camera] Permission error:', err);
      return true; // Proceed and let camera API handle it
    }
  }, [isNative]);

  // Get camera options with iPad-specific settings
  const getCameraOptions = useCallback((source: CameraSource) => {
    const baseOptions = {
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source,
      correctOrientation: true,
      webUseInput: true,
    };

    // iPad-specific: MUST use popover presentation to prevent crashes
    if (platform === 'ios') {
      return {
        ...baseOptions,
        presentationStyle: 'popover' as const,
        // Additional iPad safety
        ...(isiPadDevice && {
          popoverOptions: {
            x: Math.floor(window.innerWidth / 2),
            y: Math.floor(window.innerHeight / 2),
          },
        }),
      };
    }

    return baseOptions;
  }, [platform, isiPadDevice]);

  // Take a photo using the camera with iPad crash prevention
  const takePhoto = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      await checkPermissions();

      const options = {
        ...getCameraOptions(CameraSource.Camera),
        saveToGallery: false,
      };

      console.log('[Camera] Taking photo with options:', JSON.stringify(options));

      let photo;
      try {
        photo = await Camera.getPhoto(options);
      } catch (cameraErr: unknown) {
        const errMsg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr);
        console.log('[Camera] getPhoto error:', errMsg);
        
        if (isCancellation(errMsg)) {
          setLoading(false);
          setError(null);
          return null;
        }
        throw cameraErr;
      }

      if (photo?.dataUrl) {
        const response = await fetch(photo.dataUrl);
        const blob = await response.blob();
        
        return {
          dataUrl: photo.dataUrl,
          blob,
          path: photo.path,
        };
      }

      return null;
    } catch (err: unknown) {
      console.error('[Camera] Take photo error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (isCancellation(errorMessage)) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, getCameraOptions]);

  // Pick a photo from the gallery with iPad support
  const pickFromGallery = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      await checkPermissions();

      const options = getCameraOptions(CameraSource.Photos);
      console.log('[Camera] Picking from gallery with options:', JSON.stringify(options));

      let photo;
      try {
        photo = await Camera.getPhoto(options);
      } catch (cameraErr: unknown) {
        const errMsg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr);
        console.log('[Camera] getPhoto error:', errMsg);
        
        if (isCancellation(errMsg)) {
          setLoading(false);
          setError(null);
          return null;
        }
        throw cameraErr;
      }

      if (photo?.dataUrl) {
        const response = await fetch(photo.dataUrl);
        const blob = await response.blob();
        
        return {
          dataUrl: photo.dataUrl,
          blob,
          path: photo.path,
        };
      }

      return null;
    } catch (err: unknown) {
      console.error('[Camera] Pick photo error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (isCancellation(errorMessage)) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, getCameraOptions]);

  // Show prompt to choose between camera and gallery - iPad safe version
  const getPhotoWithPrompt = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      await checkPermissions();

      const options = {
        ...getCameraOptions(CameraSource.Prompt),
        promptLabelHeader: 'Choose Photo Source',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'Photo Library',
        promptLabelPicture: 'Camera',
      };

      console.log('[Camera] Prompting with options:', JSON.stringify(options));

      let photo;
      try {
        photo = await Camera.getPhoto(options);
      } catch (cameraErr: unknown) {
        const errMsg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr);
        console.log('[Camera] getPhoto prompt error:', errMsg);
        
        if (isCancellation(errMsg)) {
          setLoading(false);
          setError(null);
          return null;
        }
        throw cameraErr;
      }

      if (photo?.dataUrl) {
        const response = await fetch(photo.dataUrl);
        const blob = await response.blob();
        
        return {
          dataUrl: photo.dataUrl,
          blob,
          path: photo.path,
        };
      }

      return null;
    } catch (err: unknown) {
      console.error('[Camera] Get photo error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (isCancellation(errorMessage)) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, getCameraOptions]);

  return {
    isNative,
    loading,
    error,
    takePhoto,
    pickFromGallery,
    getPhotoWithPrompt,
    checkPermissions,
  };
};
