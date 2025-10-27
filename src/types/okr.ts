export type OKRStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type OKRLevel = 'company' | 'team' | 'individual';
export type KeyResultType = 'percentage' | 'number' | 'boolean' | 'currency';

export interface Objective {
  id: string;
  organization_id?: string;
  product_id?: string;
  team_id?: string;
  user_id?: string; // For individual OKRs
  level: OKRLevel;
  title: string;
  description?: string;
  status: OKRStatus;
  quarter: string; // Q1 2024
  year: number;
  confidence: number; // 0-100%
  progress: number; // 0-100% (calculated from key results)
  parent_objective_id?: string; // For cascading OKRs
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description?: string;
  type: KeyResultType;
  target_value: number;
  current_value: number;
  unit?: string; // %, $, users, etc.
  status: OKRStatus;
  confidence: number; // 0-100%
  progress: number; // 0-100% (calculated from current/target)
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface OKRUpdate {
  id: string;
  objective_id?: string;
  key_result_id?: string;
  content: string;
  confidence?: number;
  progress?: number;
  current_value?: number;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface OKRCheckIn {
  id: string;
  objective_id: string;
  content: string;
  confidence: number;
  progress: number;
  blockers?: string;
  next_actions?: string;
  created_at: string;
  author_id: string;
}

export interface OKRHealth {
  objective_id: string;
  status: 'on_track' | 'at_risk' | 'off_track';
  last_updated: string;
  confidence_trend: 'increasing' | 'stable' | 'decreasing';
  progress_trend: 'ahead' | 'on_track' | 'behind';
}
