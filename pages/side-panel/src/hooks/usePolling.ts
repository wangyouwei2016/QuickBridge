import { useState, useEffect, useCallback, useRef } from 'react';
import { syncService, TransferItem, SyncStorage } from '@extension/sync-service';

export const usePolling = (address: string | null, enabled: boolean = true) => {
  const [items, setItems] = useState<TransferItem[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollInterval = 3000; // 3 seconds

  const fetchData = useCallback(async () => {
    if (!address) return;

    try {
      setError(null);
      const response = await syncService.file.list(address);

      if (response.success && response.data) {
        setItems(response.data.items);

        // Update history
        for (const item of response.data.items) {
          await SyncStorage.addToHistory(item);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMsg);
      console.error('Polling error:', err);
    }
  }, [address]);

  const startPolling = useCallback(() => {
    if (!address || !enabled) return;

    setIsPolling(true);

    // Fetch immediately
    fetchData();

    // Set up interval
    intervalRef.current = setInterval(fetchData, pollInterval);
  }, [address, enabled, fetchData]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (address && enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [address, enabled, startPolling, stopPolling]);

  return {
    items,
    isPolling,
    error,
    refresh,
    startPolling,
    stopPolling,
  };
};
