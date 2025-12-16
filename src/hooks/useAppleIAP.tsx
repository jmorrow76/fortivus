import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Apple IAP Product IDs - these must match what you configure in App Store Connect
export const APPLE_IAP_PRODUCTS = {
  monthly: 'com.fortivus.elite.monthly',
  yearly: 'com.fortivus.elite.yearly',
};

export const useAppleIAP = () => {
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNativeIOS, setIsNativeIOS] = useState(false);

  // Check if we're running as a native iOS app
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    setIsNativeIOS(platform === 'ios' && isNative);
  }, []);

  // Purchase a subscription - placeholder that will be implemented natively
  const purchaseSubscription = useCallback(async (productId: string): Promise<boolean> => {
    if (!isNativeIOS) {
      // On web, this shouldn't be called - redirect to Stripe
      console.log('[IAP] Not on native iOS, use web checkout');
      return false;
    }

    setPurchasing(true);
    setError(null);

    try {
      // This will be handled by native code
      // For now, we'll use a custom event to communicate with the native layer
      const event = new CustomEvent('iap-purchase-request', {
        detail: { productId }
      });
      window.dispatchEvent(event);
      
      // Wait for response (native layer will handle this)
      return new Promise((resolve) => {
        const handler = (e: Event) => {
          const customEvent = e as CustomEvent;
          window.removeEventListener('iap-purchase-response', handler);
          setPurchasing(false);
          resolve(customEvent.detail?.success || false);
        };
        window.addEventListener('iap-purchase-response', handler);
        
        // Timeout after 2 minutes
        setTimeout(() => {
          window.removeEventListener('iap-purchase-response', handler);
          setPurchasing(false);
          setError('Purchase timed out');
          resolve(false);
        }, 120000);
      });
    } catch (err: unknown) {
      console.error('[IAP] Purchase error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      setPurchasing(false);
      return false;
    }
  }, [isNativeIOS]);

  // Restore previous purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNativeIOS) return false;

    setLoading(true);
    setError(null);

    try {
      const event = new CustomEvent('iap-restore-request');
      window.dispatchEvent(event);
      
      return new Promise((resolve) => {
        const handler = (e: Event) => {
          const customEvent = e as CustomEvent;
          window.removeEventListener('iap-restore-response', handler);
          setLoading(false);
          resolve(customEvent.detail?.success || false);
        };
        window.addEventListener('iap-restore-response', handler);
        
        setTimeout(() => {
          window.removeEventListener('iap-restore-response', handler);
          setLoading(false);
          setError('Restore timed out');
          resolve(false);
        }, 60000);
      });
    } catch (err: unknown) {
      console.error('[IAP] Restore error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore purchases';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [isNativeIOS]);

  return {
    isNativeIOS,
    loading,
    purchasing,
    error,
    purchaseSubscription,
    restorePurchases,
  };
};
