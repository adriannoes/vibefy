import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  UserPlus, 
  Play, 
  CheckSquare,
  X
} from 'lucide-react';

interface NotificationListProps {
  onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'issue_assigned':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'issue_updated':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'issue_commented':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'issue_mentioned':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'sprint_started':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'sprint_completed':
      return <CheckSquare className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'issue_assigned':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    case 'issue_updated':
      return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
    case 'issue_commented':
      return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
    case 'issue_mentioned':
      return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
    case 'sprint_started':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    case 'sprint_completed':
      return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
    default:
      return 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
  }
};

export const NotificationList = ({ onClose }: NotificationListProps) => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'unread') {
      await markAsRead(notification.id);
    }
    onClose();
  };

  if (loading) {
    return (
      <Card className="w-80">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    notification.status === 'unread' 
                      ? getNotificationColor(notification.type)
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {notification.title}
                        </p>
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
