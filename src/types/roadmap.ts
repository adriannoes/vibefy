export type RoadmapView = 'timeline' | 'quarterly' | 'now_next_later';
export type RoadmapItemType = 'feature' | 'initiative' | 'milestone' | 'epic';

export interface Roadmap {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  view_type: RoadmapView;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface RoadmapItem {
  id: string;
  roadmap_id: string;
  item_type: RoadmapItemType;
  item_id: string; // References feature_id, initiative_id, etc.
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  quarter?: string; // Q1 2024, Q2 2024, etc.
  category: 'now' | 'next' | 'later';
  dependencies?: string[]; // Array of other roadmap item IDs
  confidence: 'low' | 'medium' | 'high';
  business_value?: number; // 1-10 scale
  effort_estimate?: 'xs' | 's' | 'm' | 'l' | 'xl';
  created_at: string;
  updated_at: string;
}

export interface RoadmapDependency {
  id: string;
  from_item_id: string;
  to_item_id: string;
  dependency_type: 'blocks' | 'relates_to' | 'duplicates';
  created_at: string;
}

export interface RoadmapTimeline {
  id: string;
  roadmap_id: string;
  name: string;
  start_date: string;
  end_date: string;
  color?: string;
  created_at: string;
}

export interface RoadmapQuarter {
  id: string;
  roadmap_id: string;
  quarter: string; // Q1 2024
  year: number;
  start_date: string;
  end_date: string;
  goals?: string[];
  created_at: string;
}
