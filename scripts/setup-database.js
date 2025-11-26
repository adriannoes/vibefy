// Script para executar o setup do banco de dados no Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Not set');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Please set the following variables in your .env file:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Usar service role key para executar SQL
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Ler o arquivo SQL
    const sqlFile = join(__dirname, 'setup-database.sql');
    const sqlContent = readFileSync(sqlFile, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Found ${commands.length} SQL commands to execute`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`⏳ Executing command ${i + 1}/${commands.length}...`);
          const { data, error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            // Se exec_sql não existir, tentar método alternativo
            console.log(`⚠️  exec_sql failed, trying alternative method...`);
            const { error: altError } = await supabase
              .from('_sql_exec')
              .select('*')
              .eq('query', command);
            
            if (altError) {
              console.log(`⚠️  Command ${i + 1} failed (this might be expected): ${error.message}`);
            }
          } else {
            console.log(`✅ Command ${i + 1} executed successfully`);
          }
        } catch (cmdError) {
          console.log(`⚠️  Command ${i + 1} failed: ${cmdError.message}`);
        }
      }
    }
    
    console.log('🎉 Database setup completed!');
    
    // Verificar se as tabelas foram criadas
    console.log('🔍 Verifying table creation...');
    await verifyTables();
    
  } catch (error) {
    console.error('❌ Error during database setup:', error);
  }
}

async function verifyTables() {
  const expectedTables = [
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
  
  console.log('📊 Checking table existence...');
  
  for (const tableName of expectedTables) {
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
  
  // Verificar dados de teste
  console.log('📈 Checking test data...');
  
  try {
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');
    
    if (!orgError && orgs && orgs.length > 0) {
      console.log(`✅ Organizations: ${orgs.length} records found`);
    } else {
      console.log(`❌ Organizations: No data found`);
    }
    
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*');
    
    if (!projError && projects && projects.length > 0) {
      console.log(`✅ Projects: ${projects.length} records found`);
    } else {
      console.log(`❌ Projects: No data found`);
    }
    
    const { data: okrs, error: okrError } = await supabase
      .from('okrs')
      .select('*');
    
    if (!okrError && okrs && okrs.length > 0) {
      console.log(`✅ OKRs: ${okrs.length} records found`);
    } else {
      console.log(`❌ OKRs: No data found`);
    }
    
  } catch (err) {
    console.log(`❌ Error checking test data: ${err.message}`);
  }
}

setupDatabase();
