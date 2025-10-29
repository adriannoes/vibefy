import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BellRing,
  Check,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealtimeNotification } from '@/hooks/useRealtimeDashboard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  notifications: RealtimeNotification[];
  onRemoveNotification: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

interface NotificationItemProps {
  notification: RealtimeNotification;
  onRemove: (id: string) => void;
  className?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  className
}) => {
  const getIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-orange-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border-l-4 bg-card hover:bg-muted/50 transition-colors",
        getBorderColor(notification.type),
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight">
            {notification.title}
          </h4>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.timestamp, {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => onRemove(notification.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {notification.message}
        </p>

        {notification.data && (
          <details className="mt-2">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Ver detalhes
            </summary>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-24">
              {JSON.stringify(notification.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onRemoveNotification,
  onClearAll,
  className
}) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread notifications (notifications from last 5 minutes)
  useEffect(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const unread = notifications.filter(n => n.timestamp.getTime() > fiveMinutesAgo).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Play sound for new notifications (if enabled)
  useEffect(() => {
    if (isSoundEnabled && notifications.length > 0) {
      // In a real app, you would play a notification sound here
      // For now, we'll just use console.log
      console.log('🔔 New notification received');
    }
  }, [notifications.length, isSoundEnabled]);

  const handleMarkAllAsRead = useCallback(() => {
    // In a real app, you would mark notifications as read in the backend
    console.log('✅ All notifications marked as read');
  }, []);

  const groupedNotifications = React.useMemo(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const groups = {
      recent: [] as RealtimeNotification[],
      today: [] as RealtimeNotification[],
      older: [] as RealtimeNotification[],
    };

    notifications.forEach(notification => {
      if (notification.timestamp >= oneHourAgo) {
        groups.recent.push(notification);
      } else if (notification.timestamp >= today) {
        groups.today.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <Card className={cn("w-80", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notificações
            <Badge variant="secondary" className="ml-auto">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação ainda
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              As notificações aparecerão aqui quando houver atualizações
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-80", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4 text-orange-500" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Notificações
            <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
              {notifications.length}
              {unreadCount > 0 && ` (${unreadCount} novo${unreadCount > 1 ? 's' : ''})`}
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? "Desabilitar som" : "Habilitar som"}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-3 w-3" />
              ) : (
                <VolumeX className="h-3 w-3" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleMarkAllAsRead}
              title="Marcar todas como lidas"
            >
              <Check className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={onClearAll}
              title="Limpar todas"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1">
            {/* Recent notifications */}
            {groupedNotifications.recent.length > 0 && (
              <>
                <div className="px-4 py-2 bg-muted/50">
                  <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Recentes
                  </h4>
                </div>
                {groupedNotifications.recent.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={onRemoveNotification}
                  />
                ))}
              </>
            )}

            {/* Today's notifications */}
            {groupedNotifications.today.length > 0 && (
              <>
                {groupedNotifications.recent.length > 0 && <Separator />}
                <div className="px-4 py-2 bg-muted/50">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Hoje
                  </h4>
                </div>
                {groupedNotifications.today.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={onRemoveNotification}
                  />
                ))}
              </>
            )}

            {/* Older notifications */}
            {groupedNotifications.older.length > 0 && (
              <>
                {(groupedNotifications.recent.length > 0 || groupedNotifications.today.length > 0) && (
                  <Separator />
                )}
                <div className="px-4 py-2 bg-muted/50">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Anteriores
                  </h4>
                </div>
                {groupedNotifications.older.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={onRemoveNotification}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
