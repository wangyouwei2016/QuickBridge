import { syncService, SyncStorage } from '@extension/sync-service';
import { useState, useEffect, useCallback } from 'react';
import type { TransferItem } from '@extension/sync-service';

export interface SyncServiceState {
  currentAddress: string | null;
  recentAddresses: string[];
  transferHistory: TransferItem[];
  isLoading: boolean;
  error: string | null;
}

export const useSyncService = () => {
  const [state, setState] = useState<SyncServiceState>({
    currentAddress: null,
    recentAddresses: [],
    transferHistory: [],
    isLoading: false,
    error: null,
  });

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      // 每次打开插件都清除当前地址，回到初始界面
      await SyncStorage.setCurrentAddress(null);

      const syncState = await SyncStorage.get();
      setState(prev => ({
        ...prev,
        currentAddress: null, // 强制设置为 null
        recentAddresses: syncState.recentAddresses,
        transferHistory: syncState.transferHistory,
      }));
    };

    loadState();

    // Listen for storage changes
    SyncStorage.onChange(syncState => {
      setState(prev => ({
        ...prev,
        currentAddress: syncState.currentAddress,
        recentAddresses: syncState.recentAddresses,
        transferHistory: syncState.transferHistory,
      }));
    });
  }, []);

  const generateRandomAddress = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await syncService.address.generateRandom();
      if (response.success && response.data) {
        await SyncStorage.setCurrentAddress(response.data.address);
        return response.data.address;
      }
      throw new Error(response.error || 'Failed to generate address');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMsg }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const createCustomAddress = useCallback(async (address: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await syncService.address.createCustom(address);
      if (response.success && response.data) {
        await SyncStorage.setCurrentAddress(response.data.address);
        return response.data.address;
      }
      throw new Error(response.error || 'Failed to create address');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMsg }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const joinAddress = useCallback(async (address: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await syncService.address.checkStatus(address);
      if (response.success && response.data?.exists) {
        await SyncStorage.setCurrentAddress(address);
        return address;
      }
      throw new Error('Address not found');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMsg }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const leaveAddress = useCallback(async () => {
    await SyncStorage.setCurrentAddress(null);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    generateRandomAddress,
    createCustomAddress,
    joinAddress,
    leaveAddress,
    clearError,
  };
};
