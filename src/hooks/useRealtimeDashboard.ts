import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Dashboard, DashboardWidget } from '@/types/dashboard';
import type { CustomerFeedback } from '@/types/feedback';

interface RealtimeConfig {
  dashboardId?: string;
  enabled?: boolean;
  refreshInterval?: number; // in seconds
  notifyOnChanges?: boolean;
}

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  activeSubscriptions: string[];
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

interface RealtimeNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
  autoClose?: boolean;
  duration?: number;
}

export const useRealtimeDashboard = (config: RealtimeConfig = {}) => {
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<any[]>([]);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    activeSubscriptions: [],
    connectionQuality: 'offline',
  });

  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  // Connection quality monitoring
  const updateConnectionQuality = useCallback(() => {
    const now = Date.now();
    const lastUpdate = status.lastUpdate?.getTime() || 0;
    const timeSinceUpdate = now - lastUpdate;

    let quality: RealtimeStatus['connectionQuality'] = 'offline';

    if (status.isConnected) {
      if (timeSinceUpdate < 5000) quality = 'excellent'; // < 5s
      else if (timeSinceUpdate < 15000) quality = 'good'; // < 15s
      else quality = 'poor'; // > 15s
    }

    setStatus(prev => ({ ...prev, connectionQuality: quality }));
  }, [status.isConnected, status.lastUpdate]);

  // Add notification
  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications

    // Auto-close if specified
    if (newNotification.autoClose && newNotification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, newNotification.duration);
    }

    return newNotification.id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Subscribe to feedback changes
  const subscribeToFeedback = useCallback(() => {
    if (!config.enabled) return;

    console.log('🔄 useRealtimeDashboard: Subscribing to feedback changes...');

    const feedbackSubscription = supabase
      .channel('feedback-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'customer_feedback',
      }, (payload) => {
        console.log('📡 useRealtimeDashboard: Feedback change detected:', payload);

        // Update connection status
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          lastUpdate: new Date(),
        }));

        // Invalidate and refetch feedback queries
        queryClient.invalidateQueries({ queryKey: ['feedback'] });

        // Add to pending updates
        setPendingUpdates(prev => new Set([...prev, 'feedback']));

        // Create notification based on event type
        let notificationType: RealtimeNotification['type'] = 'info';
        let title = 'Feedback atualizado';
        let message = 'Os dados de feedback foram atualizados automaticamente.';

        switch (payload.eventType) {
          case 'INSERT':
            notificationType = 'success';
            title = 'Novo feedback recebido';
            message = `Novo feedback foi adicionado ao sistema.`;
            break;
          case 'UPDATE':
            notificationType = 'info';
            title = 'Feedback atualizado';
            message = `Um feedback existente foi modificado.`;
            break;
          case 'DELETE':
            notificationType = 'warning';
            title = 'Feedback removido';
            message = `Um feedback foi removido do sistema.`;
            break;
        }

        if (config.notifyOnChanges) {
          addNotification({
            type: notificationType,
            title,
            message,
            autoClose: true,
            duration: 5000,
            data: payload,
          });
        }
      })
      .subscribe((status) => {
        console.log('🔌 useRealtimeDashboard: Feedback subscription status:', status);
        setStatus(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          activeSubscriptions: status === 'SUBSCRIBED'
            ? [...prev.activeSubscriptions.filter(s => s !== 'feedback'), 'feedback']
            : prev.activeSubscriptions.filter(s => s !== 'feedback'),
        }));
      });

    subscriptionsRef.current.push(feedbackSubscription);
    return feedbackSubscription;
  }, [config.enabled, config.notifyOnChanges, queryClient, addNotification]);

  // Subscribe to issues changes
  const subscribeToIssues = useCallback(() => {
    if (!config.enabled) return;

    console.log('🔄 useRealtimeDashboard: Subscribing to issues changes...');

    const issuesSubscription = supabase
      .channel('issues-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'issues',
      }, (payload) => {
        console.log('📡 useRealtimeDashboard: Issues change detected:', payload);

        // Update connection status
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          lastUpdate: new Date(),
        }));

        // Invalidate and refetch issues queries
        queryClient.invalidateQueries({ queryKey: ['issues'] });

        // Add to pending updates
        setPendingUpdates(prev => new Set([...prev, 'issues']));

        if (config.notifyOnChanges) {
          addNotification({
            type: 'info',
            title: 'Issue atualizada',
            message: 'Uma tarefa ou issue foi modificada.',
            autoClose: true,
            duration: 3000,
            data: payload,
          });
        }
      })
      .subscribe((status) => {
        setStatus(prev => ({
          ...prev,
          activeSubscriptions: status === 'SUBSCRIBED'
            ? [...prev.activeSubscriptions.filter(s => s !== 'issues'), 'issues']
            : prev.activeSubscriptions.filter(s => s !== 'issues'),
        }));
      });

    subscriptionsRef.current.push(issuesSubscription);
    return issuesSubscription;
  }, [config.enabled, config.notifyOnChanges, queryClient, addNotification]);

  // Subscribe to sprints changes
  const subscribeToSprints = useCallback(() => {
    if (!config.enabled) return;

    const sprintsSubscription = supabase
      .channel('sprints-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sprints',
      }, (payload) => {
        console.log('📡 useRealtimeDashboard: Sprints change detected:', payload);

        // Update connection status
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          lastUpdate: new Date(),
        }));

        // Invalidate and refetch sprints queries
        queryClient.invalidateQueries({ queryKey: ['sprints'] });

        // Add to pending updates
        setPendingUpdates(prev => new Set([...prev, 'sprints']));

        if (config.notifyOnChanges) {
          addNotification({
            type: 'info',
            title: 'Sprint atualizada',
            message: 'Uma sprint foi modificada.',
            autoClose: true,
            duration: 3000,
            data: payload,
          });
        }
      })
      .subscribe((status) => {
        setStatus(prev => ({
          ...prev,
          activeSubscriptions: status === 'SUBSCRIBED'
            ? [...prev.activeSubscriptions.filter(s => s !== 'sprints'), 'sprints']
            : prev.activeSubscriptions.filter(s => s !== 'sprints'),
        }));
      });

    subscriptionsRef.current.push(sprintsSubscription);
    return sprintsSubscription;
  }, [config.enabled, config.notifyOnChanges, queryClient, addNotification]);

  // Periodic refresh fallback
  const setupPeriodicRefresh = useCallback(() => {
    if (!config.refreshInterval || config.refreshInterval <= 0) return;

    console.log(`🔄 useRealtimeDashboard: Setting up periodic refresh every ${config.refreshInterval}s`);

    refreshTimerRef.current = setInterval(() => {
      console.log('🔄 useRealtimeDashboard: Periodic refresh triggered');

      // Invalidate all dashboard-related queries
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
      }));

      if (config.notifyOnChanges) {
        addNotification({
          type: 'info',
          title: 'Dados atualizados',
          message: 'Dashboard atualizado automaticamente.',
          autoClose: true,
          duration: 2000,
        });
      }
    }, config.refreshInterval * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [config.refreshInterval, config.notifyOnChanges, queryClient, addNotification]);

  // Manual refresh
  const refreshData = useCallback(async () => {
    console.log('🔄 useRealtimeDashboard: Manual refresh triggered');

    try {
      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feedback'] }),
        queryClient.invalidateQueries({ queryKey: ['issues'] }),
        queryClient.invalidateQueries({ queryKey: ['sprints'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);

      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
      }));

      addNotification({
        type: 'success',
        title: 'Dados atualizados',
        message: 'Dashboard atualizado com sucesso.',
        autoClose: true,
        duration: 2000,
      });

      // Clear pending updates
      setPendingUpdates(new Set());
    } catch (error) {
      console.error('Failed to refresh data:', error);
      addNotification({
        type: 'error',
        title: 'Erro na atualização',
        message: 'Falha ao atualizar os dados do dashboard.',
        autoClose: false,
      });
    }
  }, [queryClient, addNotification]);

  // Initialize subscriptions
  useEffect(() => {
    if (!config.enabled) return;

    console.log('🚀 useRealtimeDashboard: Initializing real-time subscriptions...');

    // Subscribe to all relevant tables
    subscribeToFeedback();
    subscribeToIssues();
    subscribeToSprints();

    // Setup periodic refresh as fallback
    const cleanupPeriodic = setupPeriodicRefresh();

    // Initial connection check
    const checkConnection = () => {
      setStatus(prev => ({
        ...prev,
        isConnected: subscriptionsRef.current.some(sub => sub.state === 'joined'),
      }));
    };

    checkConnection();

    return () => {
      console.log('🛑 useRealtimeDashboard: Cleaning up subscriptions...');

      // Cleanup subscriptions
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current = [];

      // Cleanup periodic refresh
      cleanupPeriodic?.();
    };
  }, [config.enabled, subscribeToFeedback, subscribeToIssues, subscribeToSprints, setupPeriodicRefresh]);

  // Update connection quality periodically
  useEffect(() => {
    if (!config.enabled) return;

    const qualityCheckInterval = setInterval(updateConnectionQuality, 10000); // Check every 10 seconds

    return () => clearInterval(qualityCheckInterval);
  }, [config.enabled, updateConnectionQuality]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }

      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
    };
  }, []);

  return {
    // Status
    status,
    notifications,
    pendingUpdates: Array.from(pendingUpdates),

    // Actions
    refreshData,
    addNotification,
    removeNotification,
    clearNotifications,

    // Utilities
    isOnline: status.isConnected && status.connectionQuality !== 'offline',
    hasPendingUpdates: pendingUpdates.size > 0,
  };
};
