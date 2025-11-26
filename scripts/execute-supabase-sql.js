// Script para executar SQL no Supabase via API REST
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase - usar variáveis de ambiente
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_ID || !ACCESS_TOKEN) {
  console.error('❌ Missing required environment variables');
  console.error('Please set the following variables in your .env file:');
  console.error('- SUPABASE_PROJECT_ID');
  console.error('- SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

async function executeSQL(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

function parseSQLCommands(sqlContent) {
  // Dividir por ponto e vírgula, removendo comentários e linhas vazias
  const commands = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    .map(cmd => cmd.replace(/--.*$/gm, '').trim()) // Remover comentários inline
    .filter(cmd => cmd.length > 0);

  return commands;
}

async function main() {
  try {
    console.log('🚀 Iniciando criação do schema Vibefy...\n');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, '..', 'supabase-setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Parsear comandos SQL
    const commands = parseSQLCommands(sqlContent);
    console.log(`📝 Encontrados ${commands.length} comandos SQL para executar\n`);

    let successCount = 0;
    let errorCount = 0;

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      try {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        const result = await executeSQL(command);

        if (result.error) {
          console.log(`❌ Comando ${i + 1} falhou: ${result.error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ Comando ${i + 1} falhou: ${error.message}`);
        errorCount++;
      }

      // Pequena pausa entre comandos para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Resultado da execução:`);
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Schema criado com sucesso!');
      console.log('🔍 Executando verificação...');

      // Executar verificação
      const verifyScript = path.join(__dirname, 'verify-setup.js');
      const { spawn } = await import('child_process');

      const verifyProcess = spawn('node', [verifyScript], {
        stdio: 'inherit',
        cwd: path.dirname(__dirname)
      });

      await new Promise((resolve, reject) => {
        verifyProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Verification failed with code ${code}`));
          }
        });
        verifyProcess.on('error', reject);
      });

    } else {
      console.log('\n⚠️ Alguns comandos falharam. Verifique os logs acima.');
      console.log('💡 Você pode executar comandos individuais novamente no Supabase Dashboard.');
    }

  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    process.exit(1);
  }
}

main();
