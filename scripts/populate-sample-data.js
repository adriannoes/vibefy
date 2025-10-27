// Script para popular dados de exemplo no banco de dados Supabase
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function populateSampleData() {
  console.log('🚀 Starting sample data population...');

  try {
    // 1. Create test organization
    console.log('📁 Creating organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Vibefy Corp',
        description: 'Product management platform company'
      })
      .select()
      .single();

    if (orgError) {
      console.log('⚠️  Organization might already exist:', orgError.message);
    } else {
      console.log('✅ Organization created:', org?.name);
    }

    // 2. Create test project
    console.log('📂 Creating project...');
    const { data: project, error: projError } = await supabase
      .from('projects')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Vibefy Platform',
        description: 'Main product development',
        key: 'VBF',
        organization_id: '550e8400-e29b-41d4-a716-446655440000'
      })
      .select()
      .single();

    if (projError) {
      console.log('⚠️  Project might already exist:', projError.message);
    } else {
      console.log('✅ Project created:', project?.name);
    }

    // 3. Create test user profile (if doesn't exist)
    console.log('👤 Creating user profile...');
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .upsert({
        id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        email: 'admin@example.com',
        full_name: 'Adriano Silva',
        role: 'admin'
      })
      .select()
      .single();

    if (userError) {
      console.log('⚠️  User profile might already exist:', userError.message);
    } else {
      console.log('✅ User profile created:', user?.full_name);
    }

    // 4. Add user to organization
    console.log('🔗 Adding user to organization...');
    const { error: orgMemberError } = await supabase
      .from('organization_members')
      .upsert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        role: 'owner'
      });

    if (orgMemberError) {
      console.log('⚠️  Organization membership might already exist:', orgMemberError.message);
    } else {
      console.log('✅ User added to organization');
    }

    // 5. Add user to project
    console.log('🔗 Adding user to project...');
    const { error: projMemberError } = await supabase
      .from('project_members')
      .upsert({
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        role: 'owner'
      });

    if (projMemberError) {
      console.log('⚠️  Project membership might already exist:', projMemberError.message);
    } else {
      console.log('✅ User added to project');
    }

    // 6. Create sample issues
    console.log('🎫 Creating issues...');
    const sampleIssues = [
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        title: 'Set up project structure',
        description: 'Initialize the project with all necessary configurations',
        status: 'completed',
        priority: 'high',
        issue_type: 'task',
        story_points: 5,
        business_value: 8,
        customer_segment: 'enterprise',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        reporter_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        title: 'Design kanban board UI',
        description: 'Create mockups for the main board interface',
        status: 'in_progress',
        priority: 'high',
        issue_type: 'story',
        story_points: 8,
        business_value: 9,
        customer_segment: 'enterprise',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        assignee_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        reporter_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        title: 'Implement drag and drop',
        description: 'Add drag and drop functionality to task cards',
        status: 'todo',
        priority: 'medium',
        issue_type: 'task',
        story_points: 13,
        business_value: 7,
        customer_segment: 'consumer',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        reporter_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440017',
        title: 'Add task filtering',
        description: 'Implement filters for tasks by priority and assignee',
        status: 'backlog',
        priority: 'low',
        issue_type: 'task',
        story_points: 3,
        business_value: 5,
        customer_segment: 'enterprise',
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        reporter_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    for (const issue of sampleIssues) {
      const { error: issueError } = await supabase
        .from('issues')
        .upsert(issue);

      if (issueError) {
        console.log(`⚠️  Issue "${issue.title}" might already exist:`, issueError.message);
      } else {
        console.log(`✅ Issue created: ${issue.title}`);
      }
    }

    // 7. Create sample sprints
    console.log('🏃 Creating sprints...');
    const sampleSprints = [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Sprint 1 - Q1 2024',
        description: 'Initial development sprint',
        status: 'completed',
        start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        project_id: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Sprint 2 - Q1 2024',
        description: 'Feature development sprint',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
        project_id: '550e8400-e29b-41d4-a716-446655440001'
      }
    ];

    for (const sprint of sampleSprints) {
      const { error: sprintError } = await supabase
        .from('sprints')
        .upsert(sprint);

      if (sprintError) {
        console.log(`⚠️  Sprint "${sprint.name}" might already exist:`, sprintError.message);
      } else {
        console.log(`✅ Sprint created: ${sprint.name}`);
      }
    }

    // 8. Create sample OKRs
    console.log('🎯 Creating OKRs...');
    const { error: okrError } = await supabase
      .from('okrs')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Improve User Experience',
        description: 'Enhance overall user satisfaction and engagement',
        quarter: 'Q1 2024',
        status: 'active',
        progress: 75,
        confidence: 80,
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        owner_id: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf'
      });

    if (okrError) {
      console.log('⚠️  OKR might already exist:', okrError.message);
    } else {
      console.log('✅ OKR created: Improve User Experience');
    }

    // 9. Create sample key results
    console.log('📈 Creating key results...');
    const { error: kr1Error } = await supabase
      .from('key_results')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440005',
        okr_id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Increase User Satisfaction Score',
        description: 'Measure user satisfaction through surveys',
        target_value: 4.5,
        current_value: 4.2,
        unit: 'rating',
        progress: 85
      });

    const { error: kr2Error } = await supabase
      .from('key_results')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440006',
        okr_id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Reduce Support Tickets',
        description: 'Decrease number of support requests',
        target_value: 50,
        current_value: 35,
        unit: 'tickets',
        progress: 70
      });

    if (kr1Error || kr2Error) {
      console.log('⚠️  Key results might already exist');
    } else {
      console.log('✅ Key results created');
    }

    // 10. Create sample feedback
    console.log('💬 Creating customer feedback...');
    const { error: fb1Error } = await supabase
      .from('customer_feedback')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440007',
        title: 'Dark mode request',
        description: 'Users are requesting dark mode support for better experience',
        source: 'survey',
        status: 'new',
        priority: 'medium',
        sentiment: 'positive',
        customer_segment: 'consumer',
        tags: ['ui', 'accessibility'],
        votes: 12,
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        created_by: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf'
      });

    const { error: fb2Error } = await supabase
      .from('customer_feedback')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440008',
        title: 'Performance issues',
        description: 'Application is slow on mobile devices',
        source: 'support',
        status: 'in_progress',
        priority: 'high',
        sentiment: 'negative',
        customer_segment: 'mobile',
        tags: ['performance', 'mobile'],
        votes: 8,
        project_id: '550e8400-e29b-41d4-a716-446655440001',
        created_by: 'b024b0ac-02c4-4314-94b0-74fe5497ddaf'
      });

    if (fb1Error || fb2Error) {
      console.log('⚠️  Customer feedback might already exist');
    } else {
      console.log('✅ Customer feedback created');
    }

    console.log('🎉 Sample data population completed successfully!');
    console.log('');
    console.log('📋 Test Data Summary:');
    console.log('- ✅ 1 Organization (Vibefy Corp)');
    console.log('- ✅ 1 Project (Vibefy Platform)');
    console.log('- ✅ 1 User Profile (admin@example.com)');
    console.log('- ✅ 4 Sample Issues');
    console.log('- ✅ 2 Sample Sprints');
    console.log('- ✅ 1 Sample OKR with 2 Key Results');
    console.log('- ✅ 2 Sample Customer Feedback items');
    console.log('');
    console.log('🚀 You can now test the application with real data!');
    console.log('Login with: admin@example.com');

  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    process.exit(1);
  }
}

populateSampleData();
