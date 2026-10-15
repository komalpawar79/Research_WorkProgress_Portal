import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Support both DATABASE_URL (URI) and discrete credentials
const connectionString = process.env.DATABASE_URL;

const isHostedDb =
  connectionString?.includes('neon.tech') ||
  connectionString?.includes('supabase.co') ||
  connectionString?.includes('pooler.supabase.com') ||
  connectionString?.includes('render.com') ||
  connectionString?.includes('railway.app') ||
  process.env.PGSSL === 'true';

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: isHostedDb ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'researchflow',
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      }
);

let isDbConnected = false;

/**
 * Test the PostgreSQL connection
 */
export async function testDbConnection(): Promise<{ connected: boolean; message: string; version?: string }> {
  // If no DATABASE_URL or discrete credentials provided, return informative notice
  if (!process.env.DATABASE_URL && !process.env.PGHOST && !process.env.PGPASSWORD) {
    console.log('ℹ️ PostgreSQL credentials not configured yet. Set DATABASE_URL in .env to connect.');
    return {
      connected: false,
      message: 'PostgreSQL credentials not configured yet. Provide DATABASE_URL or PGHOST in .env.',
    };
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version(), NOW() as current_time;');
    client.release();
    isDbConnected = true;
    console.log('✅ PostgreSQL connected successfully to:', pool.options.database || 'remote DB');
    return {
      connected: true,
      message: 'PostgreSQL connected successfully',
      version: result.rows[0]?.version,
    };
  } catch (err: any) {
    isDbConnected = false;
    console.error('⚠️ PostgreSQL connection failed:', err.message);
    return {
      connected: false,
      message: `PostgreSQL connection error: ${err.message}`,
    };
  }
}

/**
 * Execute query with automatic error logging and connection reuse
 */
export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB Query] (${duration}ms):`, text.trim().slice(0, 100));
    }
    return res;
  } catch (error: any) {
    console.error('[DB Query Error]:', error.message, 'Query:', text);
    throw error;
  }
}

export { isDbConnected };
