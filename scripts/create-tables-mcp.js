// Script para criar tabelas usando MCP do Supabase diretamente
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

// Tabelas a serem criadas em ordem
const tables = [
  // 1. User profiles
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
  // 2. Organizations
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
  }
];

async function createTables() {
  console.log('🚀 Starting table creation...\n');

  for (const table of tables) {
    try {
      console.log(`📝 Creating table: ${table.name}`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });

      if (error) {
        console.log(`❌ Failed to create ${table.name}: ${error.message}`);
      } else {
        console.log(`✅ Created table: ${table.name}`);
      }
    } catch (err) {
      console.log(`❌ Error creating ${table.name}: ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Table creation completed!');
}

async function testTables() {
  console.log('🔍 Testing table access...');

  const testTables = ['user_profiles', 'organizations'];

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

  // Criar dados de teste
  console.log('\n📝 Creating test data...');
  await createTestData();
}

async function createTestData() {
  try {
    // Criar perfil do usuário admin (se necessário)
    // Nota: O perfil será criado automaticamente quando o usuário fizer login
    // ou pode ser criado usando o script create-admin-user.js

    if (profileError) {
      console.log(`❌ Failed to create user profile: ${profileError.message}`);
    } else {
      console.log('✅ Created user profile');
    }

    // Criar organização
    const { error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Vibefy Corp',
        description: 'Product management platform company'
      });

    if (orgError) {
      console.log(`❌ Failed to create organization: ${orgError.message}`);
    } else {
      console.log('✅ Created organization');
    }

  } catch (err) {
    console.log(`❌ Error creating test data: ${err.message}`);
  }
}

main().catch(console.error);
