import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migration...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await client.query(schema);

    console.log('✅ Database schema created successfully!\n');
    console.log('📊 Tables created:');
    console.log('  - users');
    console.log('  - circles');
    console.log('  - circle_members');
    console.log('  - payments');
    console.log('  - payouts');
    console.log('  - vouches');
    console.log('  - credit_history');
    console.log('  - risk_assessments');
    console.log('  - notifications\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`✅ Migration complete! ${result.rows.length} tables in database.\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
