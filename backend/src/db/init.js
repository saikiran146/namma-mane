import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function init() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('✅ Schema created');
    await pool.query(seed);
    console.log('✅ Seed data inserted');
    console.log('✅ Database initialized successfully');
    console.log('\nAdmin credentials:');
    console.log('  Email: admin@namma-mane.com');
    console.log('  Password: admin123');
  } catch (err) {
    console.error('❌ DB init failed:', err.message);
  } finally {
    await pool.end();
  }
}

init();
