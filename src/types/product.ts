export type ProductStatus = 'planning' | 'active' | 'maintenance' | 'sunset' | 'archived';
export type ProductTier = 'free' | 'premium' | 'enterprise';

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: ProductStatus;
  tier: ProductTier;
  avatar_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
  owner_id: string; // Product Manager
}

export interface Feature {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  status: 'idea' | 'discovery' | 'planned' | 'in_development' | 'testing' | 'released' | 'deprecated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  business_value?: number; // 1-10 scale
  customer_segment?: string;
  success_metrics?: string[];
  rice_score?: number; // Calculated RICE score
  reach?: number; // RICE: Reach (1-10)
  impact?: number; // RICE: Impact (1-3)
  confidence?: number; // RICE: Confidence (0-100%)
  effort?: number; // RICE: Effort (1-10)
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Initiative {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  strategic_goal?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface FeatureInitiative {
  feature_id: string;
  initiative_id: string;
}

export interface ProductMember {
  id: string;
  product_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'contributor' | 'viewer';
  added_at: string;
}
