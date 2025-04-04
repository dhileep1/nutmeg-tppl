
const { Pool } = require("pg");
require('dotenv').config();

// Create a connection pool for PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "myuser",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "tppl",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params)
};
