import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface CameraResult {
  dataUrl?: string;
  blob?: Blob;
  path?: string;
}

export const useNativeCamera = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  // Check and request camera permissions with iPad support
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNative) return true; // Web doesn't need explicit permissions

    try {
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      // Request permissions if not granted
      const requested = await Camera.requestPermissions({
        permissions: ['camera', 'photos'],
      });

      return requested.camera === 'granted' && requested.photos === 'granted';
    } catch (err) {
      console.error('[Camera] Permission check error:', err);
      // On iPad, permission errors might occur differently - don't treat as fatal
      return true; // Proceed and let camera API handle it
    }
  }, [isNative]);

  // Take a photo using the camera with iPad crash prevention
  const takePhoto = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions first - wrapped for safety
      try {
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
          throw new Error('Camera permission denied. Please enable camera access in Settings.');
        }
      } catch (permErr) {
        console.warn('[Camera] Permission check warning:', permErr);
        // Continue anyway - camera API will handle actual permissions
      }

      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true,
        // iPad-specific: ensure proper presentation
        presentationStyle: platform === 'ios' ? 'popover' : undefined,
      });

      if (photo.dataUrl) {
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
      
      // Handle user cancellation gracefully - multiple patterns for iOS/iPad
      const cancelPatterns = ['cancelled', 'canceled', 'User cancelled', 'dismissed', 'No image', 'popover'];
      if (cancelPatterns.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()))) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, platform]);

  // Pick a photo from the gallery with iPad support
  const pickFromGallery = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions first - wrapped for safety
      try {
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
          throw new Error('Photo library permission denied. Please enable access in Settings.');
        }
      } catch (permErr) {
        console.warn('[Camera] Permission check warning:', permErr);
        // Continue anyway
      }

      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        correctOrientation: true,
        // iPad-specific: ensure proper presentation
        presentationStyle: platform === 'ios' ? 'popover' : undefined,
      });

      if (photo.dataUrl) {
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
      
      const cancelPatterns = ['cancelled', 'canceled', 'User cancelled', 'dismissed', 'No image', 'popover'];
      if (cancelPatterns.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()))) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, platform]);

  // Show prompt to choose between camera and gallery - iPad safe version
  const getPhotoWithPrompt = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions first - with graceful handling for iPad
      try {
        await checkPermissions();
      } catch (permErr) {
        console.warn('[Camera] Permission check warning:', permErr);
        // Continue - camera API will request as needed
      }

      // Wrap the camera call in try-catch for iPad crash prevention
      let photo;
      try {
        photo = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
          promptLabelHeader: 'Choose Photo Source',
          promptLabelCancel: 'Cancel',
          promptLabelPhoto: 'Photo Library',
          promptLabelPicture: 'Camera',
          correctOrientation: true,
          webUseInput: true,
          // iPad-specific: popover presentation prevents crashes
          presentationStyle: platform === 'ios' ? 'popover' : undefined,
        });
      } catch (cameraErr: unknown) {
        console.error('[Camera] Camera.getPhoto error:', cameraErr);
        const errMsg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr);
        
        // Comprehensive cancellation detection for iOS/iPadOS
        const cancelPatterns = [
          'cancel', 'Cancel', 'user', 'User', 'dismissed', 'Dismissed',
          'no image', 'No image', 'No photo', 'popover', 'Popover'
        ];
        
        if (cancelPatterns.some(pattern => errMsg.includes(pattern))) {
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
      
      // Final cancellation check
      const cancelPatterns = ['cancelled', 'canceled', 'User cancelled', 'dismissed', 'No image', 'popover'];
      if (cancelPatterns.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()))) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, platform]);

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
