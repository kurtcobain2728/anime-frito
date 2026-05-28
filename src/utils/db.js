const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'animefrito_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'animefrito_db',
  password: process.env.DB_PASSWORD || 'animefrito_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
