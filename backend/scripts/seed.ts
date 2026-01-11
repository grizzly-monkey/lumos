// scripts/seed.ts
import mariadb from 'mariadb';
import { config } from 'dotenv';

const BATCH_SIZE = 1000;

// (Include helper functions for generating random data as in the original prompt)
// e.g., generateRealisticTimestamp, createMetric, createIncident, etc.

async function seed() {
  config({ path: '.env' });

  const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });

  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Database connection successful.');

    // Check and seed databases
    const [dbRows] = await conn.query('SELECT COUNT(*) as count FROM databases');
    if (dbRows.count === 0) {
      console.log('Seeding databases...');
      const dbNames = ['Orders', 'Products', 'Users', 'Analytics'];
      await conn.batch('INSERT INTO databases (name) VALUES (?)', dbNames.map(name => [name]));
      console.log(`✅ Inserted ${dbNames.length} databases.`);
    } else {
      console.log('☑️ Databases table already seeded.');
    }
    
    // ... (Add similar logic for incidents, metrics, and actions) ...
    // Use batch insertion for metrics for performance.
    
    console.log('🎉 Sample data loading complete!');

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

seed();
