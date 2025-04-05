import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  password: "pgAdmin4",
  host: "localhost",
  port: 5432,
  database: "tppl",
});

export { pool, Pool };