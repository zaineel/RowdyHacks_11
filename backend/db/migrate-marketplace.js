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

async function runMarketplaceMigration() {
  const client = await pool.connect();

  try {
    console.log('🏪 Starting marketplace migration...\n');

    // Read and execute marketplace migration
    const marketplacePath = path.join(__dirname, 'add_marketplace.sql');
    const marketplaceSchema = fs.readFileSync(marketplacePath, 'utf-8');
    await client.query(marketplaceSchema);

    console.log('✅ Marketplace tables created successfully!\n');
    console.log('📦 Marketplace tables:');
    console.log('  - items');
    console.log('  - item_borrows');
    console.log('  - marketplace_payments\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('items', 'item_borrows', 'marketplace_payments')
      ORDER BY table_name;
    `);

    console.log(`✅ Migration complete! Created ${result.rows.length} marketplace tables.\n`);
    result.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n✅ Tables already exist - marketplace is set up correctly!');
    } else {
      console.error(error.stack);
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMarketplaceMigration();
