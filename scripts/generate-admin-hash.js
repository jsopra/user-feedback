#!/usr/bin/env node

/**
 * Script para gerar hash bcrypt de senha para usuário admin
 * 
 * Uso:
 *   node scripts/generate-admin-hash.js "sua-senha-aqui"
 * 
 * Ou interativo:
 *   node scripts/generate-admin-hash.js
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const SALT_ROUNDS = 12;

async function generateHash(password) {
  if (!password || password.length < 8) {
    console.error('❌ Erro: A senha deve ter no mínimo 8 caracteres');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    console.log('\n✅ Hash gerado com sucesso!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Hash bcrypt (copie este valor):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(hash);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📝 Próximos passos:');
    console.log('1. Edite: scripts/migrations/20241001_005_seed_default_admin.sql');
    console.log('2. Descomente o bloco INSERT');
    console.log('3. Substitua "CHANGE_ME_HASH" pelo hash acima');
    console.log('4. Execute: pnpm migrate\n');
    
    console.log('⚠️  IMPORTANTE: Guarde a senha em local seguro!');
    console.log('🔒 Nunca commit o arquivo SQL com o hash para o repositório\n');
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error.message);
    process.exit(1);
  }
}

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Digite a senha para o usuário admin (mínimo 8 caracteres): ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  console.log('\n🔐 Gerador de Hash bcrypt para Usuário Admin\n');
  
  // Pegar senha da linha de comando ou prompt
  const password = process.argv[2] || await promptPassword();
  
  await generateHash(password);
}

main().catch(console.error);
