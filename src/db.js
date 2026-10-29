import pg from 'pg';
import 'dotenv/config';

const enLocal = process.env.DATABASE_URL?.includes('localhost');

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: enLocal ? false : { rejectUnauthorized: false },
});
