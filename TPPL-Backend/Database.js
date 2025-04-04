const { Client } = require("pg");

const client = new Client({
  user: "myuser",
  host: "localhost",
  database: "tppl",
  password: "password",
  port: 5432,
});

client.connect();
client.query("SELECT * FROM my_table;", (err, res) => {
  console.log(err ? err.stack : res.rows);
  client.end();
});
