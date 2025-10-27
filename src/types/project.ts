export interface Organization {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
  created_at: string;
  owner_id: string;
}

export interface OrganizationMember {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  key: string; // e.g., "VBF"
  description?: string;
  avatar_url?: string;
  status: 'active' | 'archived';
  created_at: string;
  lead_id?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'lead' | 'developer' | 'viewer';
  added_at: string;
}
