// Script para verificar se o banco de dados foi configurado corretamente
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
  'user_profiles',
  'organizations',
  'organization_members',
  'projects',
  'project_members',
  'issues',
  'sprints',
  'sprint_issues',
  'comments',
  'attachments',
  'notifications',
  'okrs',
  'key_results',
  'customer_feedback',
  'hypotheses',
  'experiments'
];

async function verifySetup() {
  console.log('🔍 Verifying Vibefy database setup...\n');

  let allGood = true;

  console.log('📊 Checking tables:');
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
        allGood = false;
      } else {
        console.log(`✅ ${tableName}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
      allGood = false;
    }
  }

  console.log('\n📈 Checking test data:');

  // Check organizations
  try {
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');

    if (!orgError && orgs && orgs.length > 0) {
      console.log(`✅ Organizations: ${orgs.length} records found`);
    } else {
      console.log(`❌ Organizations: No data found`);
      allGood = false;
    }
  } catch (err) {
    console.log(`❌ Organizations: ${err.message}`);
    allGood = false;
  }

  // Check projects
  try {
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*');

    if (!projError && projects && projects.length > 0) {
      console.log(`✅ Projects: ${projects.length} records found`);
    } else {
      console.log(`❌ Projects: No data found`);
      allGood = false;
    }
  } catch (err) {
    console.log(`❌ Projects: ${err.message}`);
    allGood = false;
  }

  // Check sprints
  try {
    const { data: sprints, error: sprintError } = await supabase
      .from('sprints')
      .select('*');

    if (!sprintError && sprints && sprints.length > 0) {
      console.log(`✅ Sprints: ${sprints.length} records found`);
    } else {
      console.log(`❌ Sprints: No data found`);
      allGood = false;
    }
  } catch (err) {
    console.log(`❌ Sprints: ${err.message}`);
    allGood = false;
  }

  // Check OKRs
  try {
    const { data: okrs, error: okrError } = await supabase
      .from('okrs')
      .select('*');

    if (!okrError && okrs && okrs.length > 0) {
      console.log(`✅ OKRs: ${okrs.length} records found`);
    } else {
      console.log(`❌ OKRs: No data found`);
      allGood = false;
    }
  } catch (err) {
    console.log(`❌ OKRs: ${err.message}`);
    allGood = false;
  }

  // Check customer feedback
  try {
    const { data: feedback, error: feedbackError } = await supabase
      .from('customer_feedback')
      .select('*');

    if (!feedbackError && feedback && feedback.length > 0) {
      console.log(`✅ Customer Feedback: ${feedback.length} records found`);
    } else {
      console.log(`❌ Customer Feedback: No data found`);
      allGood = false;
    }
  } catch (err) {
    console.log(`❌ Customer Feedback: ${err.message}`);
    allGood = false;
  }

  // Check hypotheses
  try {
    const { data: hypotheses, error: hypError } = await supabase
      .from('hypotheses')
      .select('*');

    if (!hypError && hypotheses && hypotheses.length > 0) {
      console.log(`✅ Hypotheses: ${hypotheses.length} records found`);
    } else {
      console.log(`❌ Hypotheses: No data found`);
      allGood = false;
    }
  } catch (err) {
    console.log(`❌ Hypotheses: ${err.message}`);
    allGood = false;
  }

  console.log('\n🎯 Setup Summary:');
  if (allGood) {
    console.log('✅ All tables and test data created successfully!');
    console.log('🚀 Vibefy is ready for testing with real data!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:5173');
    console.log('3. Create an admin user: npm run create:admin');
    console.log('4. Explore all the features!');
  } else {
    console.log('❌ Some tables or data are missing.');
    console.log('Please run the SQL script in Supabase Dashboard again.');
  }
}

verifySetup().catch(console.error);
