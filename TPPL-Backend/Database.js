
const { Pool } = require("pg");
require("dotenv").config();

// Create a connection pool for PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "tppl_db",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Database connection successful");
    client.release();
    return true;
  } catch (err) {
    console.error("Database connection error:", err.message);
    return false;
  }
};

// Execute SQL script
const executeScript = async (script) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(script);
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Script execution error:", err.message);
    return false;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testConnection,
  executeScript,
  query: (text, params) => pool.query(text, params),
};
