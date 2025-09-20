import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealTimeSyncOptions {
  interval?: number; // Update interval in milliseconds
  enabled?: boolean; // Whether to enable real-time sync
}

export function useRealTimeSync(options: UseRealTimeSyncOptions = {}) {
  const queryClient = useQueryClient();
  const { interval = 30000, enabled = true } = options; // Default 30 seconds

  useEffect(() => {
    if (!enabled) return;

    const syncQueries = () => {
      // Invalidate all medication-related queries to keep data fresh
      queryClient.invalidateQueries({ queryKey: ['/api/medication-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    };

    const forceSyncQueries = () => {
      // Force refetch for immediate updates
      queryClient.refetchQueries({ queryKey: ['/api/medication-logs'] });
      queryClient.refetchQueries({ queryKey: ['/api/medications'] });
      queryClient.refetchQueries({ queryKey: ['/api/notifications'] });
    };

    // Initial sync
    syncQueries();

    // Set up periodic sync
    const intervalId = setInterval(syncQueries, interval);

    // Listen for cross-tab updates via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medication-update') {
        console.log('Cross-tab medication update detected, syncing...');
        forceSyncQueries();
      }
    };

    // Also sync when the window becomes visible (hot-reload like behavior)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncQueries();
      }
    };

    const handleFocus = () => {
      syncQueries();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient, interval, enabled]);
}