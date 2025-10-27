export type IssueType = 'story' | 'task' | 'bug' | 'epic';
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';

export interface Issue {
  id: string;
  project_id: string;
  issue_number: number; // Auto-increment per project (VBF-1, VBF-2...)
  title: string;
  description?: string; // Markdown
  issue_type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  story_points?: number;
  assignee_id?: string;
  reporter_id: string;
  parent_issue_id?: string; // For sub-tasks
  // Product Management context
  feature_id?: string; // Link to product feature
  product_id?: string; // Link to product
  business_value?: number; // 1-10 scale
  customer_segment?: string;
  rice_score?: number; // Calculated RICE score
  okr_id?: string; // Link to OKR
  created_at: string;
  updated_at: string;
  due_date?: string;
}

export interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string; // For threading
}

export interface Attachment {
  id: string;
  issue_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface IssueHistory {
  id: string;
  issue_id: string;
  changed_by: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_at: string;
}

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string; // Hex color
  description?: string;
}

export interface IssueLabel {
  issue_id: string;
  label_id: string;
}
