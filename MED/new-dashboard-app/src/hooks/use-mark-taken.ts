import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { IMedicationLog } from "@/lib/models";
import { useRef, useCallback } from "react";
import { notificationActionManager } from "@/lib/notification-action-manager";
import { NotificationService } from "@/lib/notification-service";

interface MarkTakenParams {
  medicationId: string;
  scheduledTime: string;
  date?: string;
}

export function useMarkTaken() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const pendingRequests = useRef<Set<string>>(new Set());
  const notificationService = NotificationService.getInstance();

  const checkIfAlreadyTaken = useCallback((medicationId: string, scheduledTime: string, date: string): boolean => {
    // Check all relevant queries for existing log entries
    const logDate = date || new Date().toISOString().split('T')[0];
    
    // Check today's logs
    const todayLogs = queryClient.getQueryData(['/api/medication-logs', logDate]) as IMedicationLog[] | undefined;
    if (todayLogs?.some(log => 
      log.medicationId === medicationId && 
      log.scheduledTime === scheduledTime && 
      log.taken === true &&
      (log.date === logDate || log.logDate?.toISOString().split('T')[0] === logDate)
    )) {
      return true;
    }

    // Check all logs query
    const allLogs = queryClient.getQueryData(['/api/medication-logs']) as IMedicationLog[] | undefined;
    if (allLogs?.some(log => 
      log.medicationId === medicationId && 
      log.scheduledTime === scheduledTime && 
      log.taken === true &&
      (log.date === logDate || log.logDate?.toISOString().split('T')[0] === logDate)
    )) {
      return true;
    }

    return false;
  }, [queryClient]);

  const markTakenMutation = useMutation({
    mutationFn: async ({ medicationId, scheduledTime, date }: MarkTakenParams) => {
      const logDate = date || new Date().toISOString().split('T')[0];
      const requestKey = `${medicationId}-${scheduledTime}-${logDate}`;
      
      // Check if this request is already pending
      if (pendingRequests.current.has(requestKey)) {
        console.log('Request already pending for:', requestKey);
        throw new Error('Request already in progress');
      }

      // Check if already taken
      if (checkIfAlreadyTaken(medicationId, scheduledTime, logDate)) {
        console.log('Medication already marked as taken:', requestKey);
        toast({
          title: "Already taken",
          description: "This medication has already been marked as taken for today.",
          variant: "default",
        });
        throw new Error('Already taken');
      }

      // Add to pending requests
      pendingRequests.current.add(requestKey);
      
      try {
        const response = await fetch('/api/medication-logs/mark-taken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicationId,
            scheduledTime,
            date: logDate,
            takenAt: new Date().toISOString(),
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to mark medication as taken: ${errorText}`);
        }
        
        return response.json();
      } finally {
        // Always remove from pending requests
        pendingRequests.current.delete(requestKey);
        // Release the action lock after a short delay
        setTimeout(() => {
          notificationActionManager.releaseAction(medicationId, scheduledTime, logDate);
        }, 2000);
      }
    },
    
    onMutate: async ({ medicationId, scheduledTime, date }) => {
      const logDate = date || new Date().toISOString().split('T')[0];
      
      // Double-check if already taken before optimistic update
      if (checkIfAlreadyTaken(medicationId, scheduledTime, logDate)) {
        throw new Error('Already taken - preventing optimistic update');
      }
      
      // Cancel any outgoing refetches for all related queries
      await queryClient.cancelQueries({ queryKey: ['/api/medication-logs'] });
      await queryClient.cancelQueries({ queryKey: ['/api/medications'] });

      // Snapshot the previous values for rollback
      const previousLogsToday = queryClient.getQueryData(['/api/medication-logs', logDate]);
      const previousLogsAll = queryClient.getQueryData(['/api/medication-logs']);
      const previousMedications = queryClient.getQueryData(['/api/medications']);

      // Create the new log entry
      const newLog: IMedicationLog = {
        id: `temp-${Date.now()}`,
        userId: 'current-user',
        medicationId,
        takenAt: new Date(),
        scheduledTime,
        logDate: new Date(logDate),
        date: logDate,
        taken: true,
        dismissed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Optimistically update all related queries
      
      // Update today's logs
      queryClient.setQueryData(['/api/medication-logs', logDate], (old: IMedicationLog[] = []) => {
        const filtered = old.filter(log => 
          !(log.medicationId === medicationId && log.scheduledTime === scheduledTime)
        );
        return [...filtered, newLog];
      });

      // Update all logs query (if exists)
      queryClient.setQueryData(['/api/medication-logs'], (old: IMedicationLog[] = []) => {
        if (!old) return [newLog];
        const filtered = old.filter(log => 
          !(log.medicationId === medicationId && log.scheduledTime === scheduledTime && 
            (log.logDate?.toISOString().split('T')[0] === logDate || log.date === logDate))
        );
        return [...filtered, newLog];
      });

      // Invalidate all date-specific medication log queries to trigger refetch
      // This ensures all schedule views update instantly
      const queryCache = queryClient.getQueryCache();
      queryCache.getAll().forEach(query => {
        if (query.queryKey[0] === '/api/medication-logs' && query.queryKey.length > 1) {
          queryClient.setQueryData(query.queryKey, (old: IMedicationLog[] = []) => {
            const filtered = old.filter(log => 
              !(log.medicationId === medicationId && log.scheduledTime === scheduledTime && 
                (log.logDate?.toISOString().split('T')[0] === logDate || log.date === logDate))
            );
            return [...filtered, newLog];
          });
        }
      });

      return { previousLogsToday, previousLogsAll, previousMedications, logDate };
    },
    
    onError: (err, variables, context) => {
      const { medicationId, scheduledTime, date } = variables;
      const logDate = date || new Date().toISOString().split('T')[0];
      
      // Release the action lock
      notificationActionManager.releaseAction(medicationId, scheduledTime, logDate);
      
      // Rollback all optimistic updates on error
      if (context?.previousLogsToday) {
        queryClient.setQueryData(['/api/medication-logs', context.logDate], context.previousLogsToday);
      }
      if (context?.previousLogsAll) {
        queryClient.setQueryData(['/api/medication-logs'], context.previousLogsAll);
      }
      if (context?.previousMedications) {
        queryClient.setQueryData(['/api/medications'], context.previousMedications);
      }
      
      // Only show error toast if not already taken
      if (!err.message.includes('Already taken')) {
        toast({
          title: "Error",
          description: "Failed to mark medication as taken. Please try again.",
          variant: "destructive",
        });
      }
    },
    
    onSuccess: (data, variables) => {
      // Stop overdue reminders for this medication
      const { medicationId, scheduledTime, date } = variables;
      const logDate = date || new Date().toISOString().split('T')[0];
      notificationService.stopOverdueReminderLoop(medicationId, scheduledTime, logDate);
      
      // Note: We don't release the lock here immediately to prevent rapid successive calls
      // The lock will auto-expire in 10 seconds, which should be sufficient
      
      // Broadcast update to other tabs/windows
      if (typeof window !== 'undefined') {
        localStorage.setItem('medication-update', JSON.stringify({
          type: 'MEDICATION_TAKEN',
          timestamp: Date.now(),
        }));
        // Remove the item to trigger storage event
        localStorage.removeItem('medication-update');
      }
      
      // Invalidate all medication-related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/medication-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      
      // Also invalidate any cached notification queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Force immediate refetch to ensure all components update
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/medication-logs'] });
        queryClient.refetchQueries({ queryKey: ['/api/medications'] });
      }, 100);
      
      toast({
        title: "Medication marked as taken",
        description: "Great job staying on track with your medication!",
      });
    },
  });

  const markTaken = useCallback((params: MarkTakenParams) => {
    const { medicationId, scheduledTime, date } = params;
    const logDate = date || new Date().toISOString().split('T')[0];
    
    // Check if action is already locked (to prevent race conditions from notifications)
    if (notificationActionManager.isActionLocked(medicationId, scheduledTime, logDate)) {
      console.log('Action locked, skipping duplicate request');
      return;
    }
    
    // Final check before mutation
    if (checkIfAlreadyTaken(medicationId, scheduledTime, logDate)) {
      toast({
        title: "Already taken",
        description: "This medication has already been marked as taken for this time.",
        variant: "default",
      });
      return;
    }
    
    // Lock the action
    if (!notificationActionManager.tryLockAction(medicationId, scheduledTime, logDate)) {
      console.log('Failed to acquire lock, action already in progress');
      return;
    }
    
    markTakenMutation.mutate(params);
  }, [markTakenMutation, checkIfAlreadyTaken, toast]);

  return {
    markTaken,
    isLoading: markTakenMutation.isPending,
    isError: markTakenMutation.isError,
    error: markTakenMutation.error
  };
}