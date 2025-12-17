import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorPurchases, Offerings, PurchaserInfo, Package } from 'capacitor-purchases';

// Apple IAP Product IDs - these must match what you configure in App Store Connect
export const APPLE_IAP_PRODUCTS = {
  monthly: 'com.fortivus.elite.monthly',
  yearly: 'com.fortivus.elite.yearly',
};

// RevenueCat API Key - replace with your actual key from RevenueCat dashboard
const REVENUECAT_API_KEY = 'appl_YOUR_REVENUECAT_API_KEY';

export const useAppleIAP = () => {
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNativeIOS, setIsNativeIOS] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [offerings, setOfferings] = useState<Offerings | null>(null);

  // Initialize RevenueCat/Purchases
  useEffect(() => {
    const initPurchases = async () => {
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      const isIOS = platform === 'ios' && isNative;
      setIsNativeIOS(isIOS);

      if (!isIOS) return;

      try {
        // Enable debug logs
        await CapacitorPurchases.setDebugLogsEnabled({ enabled: true });
        
        // Setup with RevenueCat API key
        await CapacitorPurchases.setup({
          apiKey: REVENUECAT_API_KEY,
        });
        
        setIsConfigured(true);
        console.log('[IAP] Purchases configured successfully');

        // Fetch available offerings
        const { offerings: offeringsResult } = await CapacitorPurchases.getOfferings();
        if (offeringsResult) {
          setOfferings(offeringsResult);
          console.log('[IAP] Offerings fetched:', offeringsResult);
        }
      } catch (err) {
        console.error('[IAP] Failed to configure purchases:', err);
        // If configuration fails (e.g., no API key), we'll fall back to showing an error
        setError('In-app purchases not configured');
      }
    };

    initPurchases();
  }, []);

  // Purchase a subscription
  const purchaseSubscription = useCallback(async (productId: string): Promise<boolean> => {
    if (!isNativeIOS) {
      console.log('[IAP] Not on native iOS, use web checkout');
      return false;
    }

    if (!isConfigured || !offerings) {
      setError('In-app purchases are being set up. Please try again in a moment.');
      return false;
    }

    setPurchasing(true);
    setError(null);

    try {
      // Find the package for this product
      const currentOffering = offerings.current;
      if (!currentOffering) {
        throw new Error('No offerings available');
      }

      // Get the package - try to match by identifier
      let packageToPurchase: Package | undefined;
      
      if (productId.includes('monthly')) {
        packageToPurchase = currentOffering.monthly || currentOffering.availablePackages?.find(
          (p: Package) => p.identifier?.includes('monthly') || p.product?.identifier?.includes('monthly')
        );
      } else if (productId.includes('yearly') || productId.includes('annual')) {
        packageToPurchase = currentOffering.annual || currentOffering.availablePackages?.find(
          (p: Package) => p.identifier?.includes('yearly') || p.identifier?.includes('annual') || 
                         p.product?.identifier?.includes('yearly') || p.product?.identifier?.includes('annual')
        );
      }

      if (!packageToPurchase) {
        // Fall back to first available package
        packageToPurchase = currentOffering.availablePackages?.[0];
      }

      if (!packageToPurchase) {
        throw new Error('No subscription package available');
      }

      console.log('[IAP] Purchasing package:', packageToPurchase.identifier);
      
      const { purchaserInfo } = await CapacitorPurchases.purchasePackage({
        identifier: packageToPurchase.identifier,
        offeringIdentifier: packageToPurchase.offeringIdentifier,
      });
      
      // Check if purchase was successful
      const entitlements = purchaserInfo?.entitlements?.active || {};
      const hasElite = Object.keys(entitlements).some(
        key => key.toLowerCase().includes('elite') || key.toLowerCase().includes('premium')
      );

      if (hasElite || purchaserInfo?.activeSubscriptions?.length > 0) {
        console.log('[IAP] Purchase successful');
        return true;
      }

      console.log('[IAP] Purchase completed but no elite entitlement found');
      return false;
    } catch (err: unknown) {
      console.error('[IAP] Purchase error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Handle user cancellation gracefully
      if (errorMessage.includes('cancelled') || errorMessage.includes('canceled') || errorMessage.includes('userCancelled')) {
        setError(null);
        return false;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [isNativeIOS, isConfigured, offerings]);

  // Restore previous purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNativeIOS) return false;
    if (!isConfigured) {
      setError('In-app purchases are being set up. Please try again in a moment.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { purchaserInfo } = await CapacitorPurchases.restoreTransactions();
      
      // Check if user has any active entitlements
      const entitlements = purchaserInfo?.entitlements?.active || {};
      const hasElite = Object.keys(entitlements).some(
        key => key.toLowerCase().includes('elite') || key.toLowerCase().includes('premium')
      );

      if (hasElite || purchaserInfo?.activeSubscriptions?.length > 0) {
        console.log('[IAP] Restore successful');
        return true;
      }

      console.log('[IAP] No active entitlements found');
      return false;
    } catch (err: unknown) {
      console.error('[IAP] Restore error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isNativeIOS, isConfigured]);

  // Get purchaser info
  const getCustomerInfo = useCallback(async (): Promise<PurchaserInfo | null> => {
    if (!isNativeIOS || !isConfigured) return null;

    try {
      const { purchaserInfo } = await CapacitorPurchases.getPurchaserInfo();
      return purchaserInfo;
    } catch (err) {
      console.error('[IAP] Failed to get purchaser info:', err);
      return null;
    }
  }, [isNativeIOS, isConfigured]);

  return {
    isNativeIOS,
    isConfigured,
    loading,
    purchasing,
    error,
    offerings,
    purchaseSubscription,
    restorePurchases,
    getCustomerInfo,
  };
};
