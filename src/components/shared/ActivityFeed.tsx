import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Tag
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'commented' | 'status_changed' | 'assigned' | 'labeled';
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  description: string;
  timestamp: string;
  metadata?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    assignee?: string;
    label?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'status_changed':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      case 'assigned':
        return <User className="h-4 w-4 text-cyan-500" />;
      case 'labeled':
        return <Tag className="h-4 w-4 text-pink-500" />;
      default:
        return <Edit className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4 p-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getInitials(activity.user.name)}
                  </AvatarFallback>
                </Avatar>
                {index < activities.length - 1 && (
                  <div className="w-px h-6 bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="font-medium text-sm">{activity.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {activity.description}
                  </span>
                </div>
                
                {activity.metadata && (
                  <div className="ml-6 space-y-1">
                    {activity.metadata.field && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{activity.metadata.field}:</span>
                        {activity.metadata.oldValue && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.oldValue}
                            </Badge>
                            <ArrowRight className="h-3 w-3" />
                          </>
                        )}
                        {activity.metadata.newValue && (
                          <Badge variant="default" className="text-xs">
                            {activity.metadata.newValue}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {activity.metadata.assignee && (
                      <div className="text-xs text-muted-foreground">
                        Assigned to <span className="font-medium">{activity.metadata.assignee}</span>
                      </div>
                    )}
                    
                    {activity.metadata.label && (
                      <div className="text-xs text-muted-foreground">
                        Added label <Badge variant="secondary" className="text-xs">
                          {activity.metadata.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
