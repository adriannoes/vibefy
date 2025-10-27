export type ExperimentStatus = 'draft' | 'running' | 'completed' | 'cancelled';
export type ValidationMethod = 'a_b_test' | 'user_interview' | 'survey' | 'analytics' | 'prototype' | 'mvp';
export type HypothesisStatus = 'untested' | 'validated' | 'invalidated' | 'inconclusive';

export interface Hypothesis {
  id: string;
  product_id: string;
  title: string;
  statement: string; // "We believe [doing this] for [these people] will achieve [this outcome]"
  doing_this: string; // The action/change
  for_these_people: string; // Target audience
  will_achieve: string; // Expected outcome
  status: HypothesisStatus;
  confidence: number; // 0-100%
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Experiment {
  id: string;
  hypothesis_id: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  validation_method: ValidationMethod;
  success_criteria: string[];
  metrics: string[]; // What to measure
  target_audience?: string;
  sample_size?: number;
  duration_days?: number;
  start_date?: string;
  end_date?: string;
  results?: string; // Markdown
  learnings?: string; // Markdown
  next_steps?: string; // Markdown
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface ExperimentResult {
  id: string;
  experiment_id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  is_success: boolean;
  confidence_level: number; // 0-100%
  notes?: string;
  created_at: string;
  author_id: string;
}

export interface ExperimentParticipant {
  id: string;
  experiment_id: string;
  user_id?: string;
  session_id?: string; // For anonymous users
  variant: 'control' | 'treatment' | 'a' | 'b';
  joined_at: string;
  completed_at?: string;
}

export interface ValidationMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  template_questions?: string[];
  success_metrics?: string[];
  duration_estimate?: string;
}
