import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { pool, testDbConnection } from '../config/db.js';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDatabaseExists() {
  const targetDb = process.env.PGDATABASE || 'researchflow';
  const connectionString = process.env.DATABASE_URL;

  // If using remote pooler or cloud URL, assume database already created in cloud dashboard
  if (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
    return;
  }

  const maintenanceClient = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await maintenanceClient.connect();
    const checkRes = await maintenanceClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [targetDb]
    );

    if (checkRes.rowCount === 0) {
      console.log(`🔨 Database "${targetDb}" does not exist yet. Creating it now...`);
      await maintenanceClient.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`✅ Database "${targetDb}" created successfully!`);
    } else {
      console.log(`ℹ️ Database "${targetDb}" exists.`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Note on DB check via maintenance client: ${err.message}`);
  } finally {
    try {
      await maintenanceClient.end();
    } catch {}
  }
}

async function initDatabase() {
  console.log('🔄 Ensuring target database exists...');
  await ensureDatabaseExists();

  console.log('🔄 Checking PostgreSQL connection...');
  const test = await testDbConnection();

  if (!test.connected) {
    console.error('\n❌ Could not connect to PostgreSQL!');
    console.error('👉 Make sure you have set DATABASE_URL (or PGHOST, PGUSER, PGPASSWORD) in your backend/.env file.');
    console.error(`Details: ${test.message}\n`);
    process.exit(1);
  }

  const schemaPath = path.resolve(__dirname, '../db/schema.sql');
  console.log(`📄 Reading schema from: ${schemaPath}`);
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('🚀 Running schema migrations & initial seed data...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ PostgreSQL Schema & Seed Data applied successfully!');

    // Show summary counts
    const usersCount = await client.query('SELECT COUNT(*) FROM users;');
    const projCount = await client.query('SELECT COUNT(*) FROM projects;');
    const chCount = await client.query('SELECT COUNT(*) FROM chapters;');
    const payCount = await client.query('SELECT COUNT(*) FROM payments;');

    console.log('\n📊 Database Status:');
    console.log(` - Users:    ${usersCount.rows[0].count}`);
    console.log(` - Projects: ${projCount.rows[0].count}`);
    console.log(` - Chapters: ${chCount.rows[0].count}`);
    console.log(` - Payments: ${payCount.rows[0].count}`);
    console.log('\n✨ Database is fully ready to use!');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to run migration:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
