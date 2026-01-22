import 'dotenv/config';
import { executeQuery } from './client.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetTursoDatabase() {
  console.log('⚠️  RESETTING TURSO DATABASE - ALL DATA WILL BE LOST');
  console.log('');

  // Drop all tables in reverse order (respecting foreign keys)
  const tablesToDrop = [
    'notifications',
    'mail_drafts',
    'evaluations',
    'next_steps',
    'application_jobs',
    'applications',
    'candidate_documents',
    'candidates',
    'jobs',
    'users'
  ];

  console.log('🗑️  Dropping old tables...');
  for (const table of tablesToDrop) {
    try {
      await executeQuery(`DROP TABLE IF EXISTS ${table}`);
      console.log(`  ✓ Dropped table: ${table}`);
    } catch (error) {
      console.log(`  → Could not drop ${table}: ${error.message}`);
    }
  }

  // Drop indexes
  console.log('');
  console.log('🗑️  Dropping old indexes...');
  const indexesToDrop = [
    'idx_applications_candidate',
    'idx_evaluations_application_job',
    'idx_documents_candidate',
    'idx_notifications_user_read'
  ];

  for (const index of indexesToDrop) {
    try {
      await executeQuery(`DROP INDEX IF EXISTS ${index}`);
      console.log(`  ✓ Dropped index: ${index}`);
    } catch (error) {
      console.log(`  → Could not drop ${index}: ${error.message}`);
    }
  }

  // Read and execute new schema
  console.log('');
  console.log('📋 Creating new schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf-8');

  // Split schema into individual statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await executeQuery(statement);
      // Extract table/index name from statement
      const match = statement.match(/CREATE (?:TABLE|INDEX) (?:IF NOT EXISTS )?(\w+)/i);
      if (match) {
        console.log(`  ✓ Created: ${match[1]}`);
      }
    } catch (error) {
      console.error(`  ✗ Error executing statement: ${error.message}`);
      console.error(`  Statement: ${statement.substring(0, 100)}...`);
    }
  }

  console.log('');
  console.log('✅ Turso database has been reset with the new simplified schema');
  console.log('');
  console.log('Next step: Run `npm run seed` to populate with test data');
}

resetTursoDatabase().catch(error => {
  console.error('❌ Error resetting database:', error);
  process.exit(1);
});
