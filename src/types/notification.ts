export type NotificationType = 
  | "issue_assigned"
  | "issue_updated" 
  | "issue_commented"
  | "issue_mentioned"
  | "sprint_started"
  | "sprint_completed";

export type NotificationStatus = "unread" | "read";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    issue_id?: string;
    project_id?: string;
    sprint_id?: string;
    comment_id?: string;
    mentioned_by?: string;
  };
  status: NotificationStatus;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  issue_assigned: boolean;
  issue_updated: boolean;
  issue_commented: boolean;
  issue_mentioned: boolean;
  sprint_started: boolean;
  sprint_completed: boolean;
}
