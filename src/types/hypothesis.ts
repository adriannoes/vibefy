export type HypothesisStatus = 'draft' | 'proposed' | 'approved' | 'in_experiment' | 'validated' | 'invalidated' | 'cancelled';
export type HypothesisPriority = 'low' | 'medium' | 'high' | 'critical';
export type HypothesisType = 'problem_validation' | 'solution_validation' | 'market_validation' | 'technical_validation';

export interface Hypothesis {
  id: string;
  product_id: string;
  title: string;
  description: string;
  type: HypothesisType;
  status: HypothesisStatus;
  priority: HypothesisPriority;

  // Hypothesis statement components
  problem_statement: string;
  solution_statement: string;
  expected_outcome: string;
  success_criteria: string[];

  // Validation
  confidence_level: number; // 1-10 scale
  risk_level: number; // 1-10 scale
  effort_estimate: number; // Story points or days

  // Relationships
  linked_features?: string[]; // Feature IDs
  linked_roadmap_items?: string[]; // Roadmap item IDs
  linked_okrs?: string[]; // OKR IDs
  linked_feedback?: string[]; // Feedback IDs

  // Experiment tracking
  experiments: Experiment[];

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  validated_at?: string;
}

export type ExperimentStatus = 'planned' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ExperimentType = 'a_b_test' | 'feature_flag' | 'survey' | 'user_interview' | 'usability_test' | 'prototype' | 'mvp' | 'other';

export interface Experiment {
  id: string;
  hypothesis_id: string;
  title: string;
  description: string;
  type: ExperimentType;
  status: ExperimentStatus;

  // Experiment design
  methodology: string;
  sample_size?: number;
  duration_days?: number;
  control_group?: string;
  test_group?: string;

  // Success metrics
  primary_metric: string;
  secondary_metrics: string[];
  success_threshold: string;

  // Results
  results?: ExperimentResult;
  conclusion?: string;
  learnings?: string[];
  next_steps?: string[];

  // Timeline
  start_date?: string;
  end_date?: string;
  actual_end_date?: string;

  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExperimentResult {
  primary_metric_value: number;
  secondary_metrics_values: Record<string, number>;
  statistical_significance?: number;
  confidence_interval?: {
    lower: number;
    upper: number;
  };
  p_value?: number;
  effect_size?: number;
  data_quality_score?: number; // 1-10 scale
}

export interface HypothesisTemplate {
  id: string;
  name: string;
  type: HypothesisType;
  template: {
    problem_statement: string;
    solution_statement: string;
    success_criteria: string[];
  };
  description: string;
}

// Predefined templates for common hypothesis types
export const HYPOTHESIS_TEMPLATES: HypothesisTemplate[] = [
  {
    id: 'problem-validation',
    name: 'Problem Validation',
    type: 'problem_validation',
    template: {
      problem_statement: 'We believe that [target customers] are experiencing [specific problem] when [specific situation].',
      solution_statement: 'We will know we are right when [measurable validation criteria].',
      success_criteria: [
        'User interviews confirm the problem exists',
        'Usage analytics show the problem pattern',
        'Customer feedback mentions this specific issue'
      ]
    },
    description: 'Validate that a real problem exists for your target customers'
  },
  {
    id: 'solution-validation',
    name: 'Solution Validation',
    type: 'solution_validation',
    template: {
      problem_statement: 'We believe that [proposed solution] will solve [specific problem] for [target customers].',
      solution_statement: 'We will know we are right when [proposed solution] achieves [specific outcome].',
      success_criteria: [
        'Users successfully complete the desired task',
        'User satisfaction scores meet target',
        'Usage metrics show engagement improvement'
      ]
    },
    description: 'Validate that your proposed solution actually solves the problem'
  },
  {
    id: 'market-validation',
    name: 'Market Validation',
    type: 'market_validation',
    template: {
      problem_statement: 'We believe there is a market of [market size] for [product/service] among [target segment].',
      solution_statement: 'We will know we are right when [market validation metrics] show [specific results].',
      success_criteria: [
        'Market research confirms demand',
        'Competitor analysis shows market gap',
        'Customer willingness to pay is validated'
      ]
    },
    description: 'Validate market demand and opportunity size'
  },
  {
    id: 'technical-validation',
    name: 'Technical Validation',
    type: 'technical_validation',
    template: {
      problem_statement: 'We believe that [technical approach] can achieve [technical goal] with [constraints].',
      solution_statement: 'We will know we are right when [technical validation] proves feasibility.',
      success_criteria: [
        'Technical prototype demonstrates feasibility',
        'Performance benchmarks are met',
        'Scalability requirements are satisfied'
      ]
    },
    description: 'Validate technical feasibility and constraints'
  }
];

export interface HypothesisValidationMetrics {
  total_hypotheses: number;
  validated_hypotheses: number;
  invalidated_hypotheses: number;
  in_progress_hypotheses: number;
  validation_rate: number;
  average_validation_time: number; // in days
  top_validated_types: Array<{
    type: HypothesisType;
    count: number;
    success_rate: number;
  }>;
}

export interface ExperimentMetrics {
  total_experiments: number;
  completed_experiments: number;
  running_experiments: number;
  success_rate: number;
  average_duration: number; // in days
  top_experiment_types: Array<{
    type: ExperimentType;
    count: number;
    success_rate: number;
  }>;
}
