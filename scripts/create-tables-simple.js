// Script simplificado para criar tabelas no Supabase
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const tables = [
  {
    name: 'user_profiles',
    sql: `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'developer', 'viewer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'organizations',
    sql: `
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'organization_members',
    sql: `
      CREATE TABLE IF NOT EXISTS organization_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(organization_id, user_id)
      );
    `
  },
  {
    name: 'projects',
    sql: `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        key TEXT UNIQUE NOT NULL,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'project_members',
    sql: `
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(project_id, user_id)
      );
    `
  },
  {
    name: 'issues',
    sql: `
      CREATE TABLE IF NOT EXISTS issues (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'completed', 'cancelled')),
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        issue_type TEXT DEFAULT 'task' CHECK (issue_type IN ('bug', 'feature', 'task', 'epic', 'story')),
        story_points INTEGER,
        business_value INTEGER CHECK (business_value >= 1 AND business_value <= 10),
        customer_segment TEXT,
        rice_score DECIMAL,
        okr_id UUID,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        assignee_id UUID REFERENCES user_profiles(id),
        reporter_id UUID REFERENCES user_profiles(id),
        parent_issue_id UUID REFERENCES issues(id),
        due_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'sprints',
    sql: `
      CREATE TABLE IF NOT EXISTS sprints (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'sprint_issues',
    sql: `
      CREATE TABLE IF NOT EXISTS sprint_issues (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
        issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(sprint_id, issue_id)
      );
    `
  },
  {
    name: 'comments',
    sql: `
      CREATE TABLE IF NOT EXISTS comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content TEXT NOT NULL,
        issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
        author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'attachments',
    sql: `
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        filename TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'notifications',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('issue_assigned', 'issue_updated', 'comment_added', 'sprint_started', 'deadline_approaching')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
        read_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'okrs',
    sql: `
      CREATE TABLE IF NOT EXISTS okrs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        quarter TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'key_results',
    sql: `
      CREATE TABLE IF NOT EXISTS key_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        okr_id UUID REFERENCES okrs(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        target_value DECIMAL,
        current_value DECIMAL,
        unit TEXT,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'customer_feedback',
    sql: `
      CREATE TABLE IF NOT EXISTS customer_feedback (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        source TEXT CHECK (source IN ('email', 'support', 'survey', 'interview', 'social', 'other')),
        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'closed')),
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
        customer_segment TEXT,
        tags TEXT[],
        votes INTEGER DEFAULT 0,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'hypotheses',
    sql: `
      CREATE TABLE IF NOT EXISTS hypotheses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        hypothesis_type TEXT CHECK (hypothesis_type IN ('problem_validation', 'solution_validation', 'market_validation', 'technical_validation')),
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'validated', 'invalidated', 'cancelled')),
        confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
        risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
        effort_level TEXT CHECK (effort_level IN ('low', 'medium', 'high')),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'experiments',
    sql: `
      CREATE TABLE IF NOT EXISTS experiments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        hypothesis_id UUID REFERENCES hypotheses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        experiment_type TEXT CHECK (experiment_type IN ('a_b_test', 'user_interview', 'survey', 'prototype_test', 'analytics_review')),
        status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'completed', 'failed', 'cancelled')),
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        success_criteria TEXT,
        results TEXT,
        created_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  }
];

async function createTables() {
  console.log('🚀 Starting table creation...');

  for (const table of tables) {
    try {
      console.log(`📝 Creating table: ${table.name}`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });

      if (error) {
        console.log(`⚠️  Failed to create ${table.name}: ${error.message}`);
      } else {
        console.log(`✅ Created table: ${table.name}`);
      }
    } catch (err) {
      console.log(`❌ Error creating ${table.name}: ${err.message}`);
    }
  }

  console.log('🎉 Table creation completed!');
}

async function testTables() {
  console.log('🔍 Testing table access...');

  const testTables = ['user_profiles', 'organizations', 'projects', 'issues', 'okrs'];

  for (const tableName of testTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Table ${tableName}: OK`);
      }
    } catch (err) {
      console.log(`❌ Table ${tableName}: ${err.message}`);
    }
  }
}

async function main() {
  await createTables();
  await testTables();
}

main().catch(console.error);
