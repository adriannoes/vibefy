export type PrioritizationMethod = 'rice' | 'value_effort' | 'moscow' | 'kano' | 'custom';
export type ValueLevel = 'low' | 'medium' | 'high' | 'critical';
export type EffortLevel = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface RICEScore {
  reach: number; // 1-10 (number of people affected)
  impact: number; // 1-3 (impact per person)
  confidence: number; // 0-100% (confidence in estimates)
  effort: number; // 1-10 (person-months of effort)
  score: number; // Calculated: (Reach × Impact × Confidence) ÷ Effort
}

export interface ValueEffortMatrix {
  value: ValueLevel;
  effort: EffortLevel;
  quadrant: 'quick_wins' | 'major_projects' | 'fill_ins' | 'questionable';
}

export interface PrioritizationScore {
  id: string;
  item_id: string; // Can be feature_id, issue_id, etc.
  item_type: 'feature' | 'issue' | 'initiative';
  method: PrioritizationMethod;
  rice_score?: RICEScore;
  value_effort?: ValueEffortMatrix;
  custom_score?: number;
  rank: number; // Overall ranking
  created_at: string;
  updated_at: string;
  scorer_id: string;
}

export interface PrioritizationSession {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  method: PrioritizationMethod;
  participants: string[]; // Array of user IDs
  items: string[]; // Array of item IDs being prioritized
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface PrioritizationVote {
  id: string;
  session_id: string;
  item_id: string;
  user_id: string;
  score: number; // 1-10 or custom scale
  reasoning?: string;
  created_at: string;
}

export interface PrioritizationResult {
  item_id: string;
  average_score: number;
  median_score: number;
  consensus_level: 'high' | 'medium' | 'low';
  disagreement_reasons: string[];
  final_rank: number;
}
