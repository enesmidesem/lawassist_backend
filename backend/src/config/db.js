const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL bağlantısı başarılı.');
});

pool.on('error', (err) => {
  console.error('PostgreSQL bağlantı hatası:', err.message);
  process.exit(-1);
});

module.exports = pool;