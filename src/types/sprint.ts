export type SprintStatus = 'planned' | 'active' | 'completed';

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: SprintStatus;
  created_at: string;
}

export interface IssueSprint {
  issue_id: string;
  sprint_id: string;
}
