// Script para criar usuário administrador no Supabase
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing required environment variables.');
  console.error('Please set the following variables in your .env file:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('- ADMIN_EMAIL');
  console.error('- ADMIN_PASSWORD');
  console.error('- ADMIN_NAME (optional)');
  process.exit(1);
}

// Usar service role key para criar usuário
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Criar usuário no auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: ADMIN_NAME,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authData.user?.id);

    // Criar perfil do usuário (opcional - pode falhar se a tabela não existir)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: ADMIN_EMAIL,
          full_name: ADMIN_NAME,
          avatar_url: null,
          role: 'admin'
        });

      if (profileError) {
        console.log('⚠️  Note: Could not create user profile (table may not exist yet):', profileError.message);
        console.log('✅ User can still login with auth credentials');
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (profileError) {
      console.log('⚠️  Note: Could not create user profile (table may not exist yet)');
      console.log('✅ User can still login with auth credentials');
    }

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log('Password: [HIDDEN FOR SECURITY]');
    console.log('Role: admin');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
