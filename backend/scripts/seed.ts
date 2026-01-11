import { createConnection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seed() {
  const connection = await createConnection({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'nightwatch',
    password: process.env.DB_PASSWORD || 'nightwatch123',
    database: process.env.DB_NAME || 'nightwatch_db',
    multipleStatements: true, // Allow multiple SQL statements in one query
  });

  console.log('🌱 Connected to database. Starting seed process...');

  const scripts = [
    'setup-database.sql',
    'seed-data.sql',
    'seed-logs.sql'
  ];

  for (const scriptName of scripts) {
    const filePath = path.join(__dirname, scriptName);
    if (fs.existsSync(filePath)) {
      console.log(`\n📄 Executing ${scriptName}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await connection.query(sql);
      console.log(`✅ ${scriptName} executed successfully.`);
    } else {
      console.warn(`⚠️ Warning: ${scriptName} not found. Skipping.`);
    }
  }

  console.log('\n✨ Database setup and seeding completed!');
  await connection.close();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
