export type FeedbackSource = 'manual' | 'email' | 'intercom' | 'zendesk' | 'slack' | 'survey' | 'api';
export type FeedbackStatus = 'new' | 'in_review' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackSentiment = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

export interface CustomerFeedback {
  id: string;
  product_id: string;
  title: string;
  content: string;
  source: FeedbackSource;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  sentiment: FeedbackSentiment;
  customer_email?: string;
  customer_name?: string;
  customer_segment?: string;
  feature_request?: boolean;
  bug_report?: boolean;
  general_feedback?: boolean;
  votes: number;
  tags: string[];
  linked_features?: string[]; // Array of feature IDs
  linked_issues?: string[]; // Array of issue IDs
  created_at: string;
  updated_at: string;
  author_id?: string; // If manually created
}

export interface FeedbackTheme {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  color: string;
  feedback_count: number;
  created_at: string;
  updated_at: string;
}

export interface FeedbackInsight {
  theme: string;
  count: number;
  sentiment_breakdown: {
    very_positive: number;
    positive: number;
    neutral: number;
    negative: number;
    very_negative: number;
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  top_features: string[];
}

export interface FeedbackVote {
  id: string;
  feedback_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface FeedbackResponse {
  id: string;
  feedback_id: string;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}
