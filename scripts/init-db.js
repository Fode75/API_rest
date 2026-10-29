import fs from 'node:fs';
import { pool } from '../src/db.js';

const sql = fs.readFileSync(new URL('../sql/schema.sql', import.meta.url), 'utf8');

try {
  await pool.query(sql);
  console.log('Table tickets prête');
} catch (err) {
  console.error('Échec :', err.code, err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
