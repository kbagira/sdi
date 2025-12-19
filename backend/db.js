const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Students",
  password: "1234",
  port: 5432,
});

pool.connect()
  .then(() => console.log("DB connected ✅"))
  .catch(err => console.error("DB connection error:", err));

module.exports = pool;
