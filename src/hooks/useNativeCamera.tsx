import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

export interface CameraResult {
  dataUrl?: string;
  blob?: Blob;
  path?: string;
}

export const useNativeCamera = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  // Check and request camera permissions
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
      return false;
    }
  }, [isNative]);

  // Take a photo using the camera
  const takePhoto = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied. Please enable camera access in Settings.');
      }

      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true,
      });

      if (photo.dataUrl) {
        // Convert data URL to blob for upload
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to take photo';
      
      // Handle user cancellation gracefully
      if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || errorMessage.includes('User cancelled')) {
        setError(null);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions]);

  // Pick a photo from the gallery
  const pickFromGallery = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error('Photo library permission denied. Please enable access in Settings.');
      }

      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        correctOrientation: true,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to pick photo';
      
      if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || errorMessage.includes('User cancelled')) {
        setError(null);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions]);

  // Show prompt to choose between camera and gallery
  const getPhotoWithPrompt = useCallback(async (): Promise<CameraResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions first - with detailed error handling
      let hasPermission = false;
      try {
        hasPermission = await checkPermissions();
      } catch (permErr) {
        console.error('[Camera] Permission check failed:', permErr);
        throw new Error('Unable to access camera permissions. Please check Settings > Privacy > Camera.');
      }
      
      if (!hasPermission) {
        throw new Error('Camera/Photo permission denied. Please enable access in Settings > Privacy > Camera.');
      }

      // Wrap the camera call in its own try-catch for better error isolation
      let photo;
      try {
        photo = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt, // Shows action sheet with Camera/Photo Library options
          promptLabelHeader: 'Choose Photo Source',
          promptLabelCancel: 'Cancel',
          promptLabelPhoto: 'Photo Library',
          promptLabelPicture: 'Camera',
          correctOrientation: true,
          webUseInput: true, // Fallback for web
        });
      } catch (cameraErr: unknown) {
        console.error('[Camera] Camera.getPhoto error:', cameraErr);
        const errMsg = cameraErr instanceof Error ? cameraErr.message : String(cameraErr);
        
        // Check for various cancellation patterns (iOS can return different messages)
        if (errMsg.includes('cancel') || 
            errMsg.includes('Cancel') || 
            errMsg.includes('User') || 
            errMsg.includes('dismissed') ||
            errMsg.includes('No image') ||
            errMsg === 'No photo selected') {
          setLoading(false);
          return null; // User cancelled - not an error
        }
        
        throw cameraErr; // Re-throw if it's a real error
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
      
      // Final check for cancellation patterns
      if (errorMessage.includes('cancelled') || 
          errorMessage.includes('canceled') || 
          errorMessage.includes('User cancelled') ||
          errorMessage.includes('dismissed') ||
          errorMessage.includes('No image')) {
        setError(null);
        setLoading(false);
        return null;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkPermissions]);

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
