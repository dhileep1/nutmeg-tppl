import express from "express";
import cors from "cors";
import { pool } from "./Database.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/leave", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leave_table;");
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});

app.patch("/leave/approve/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      `UPDATE leave_table SET status = 'Approved' where id=$1`,
      [id]
    );
    res.status(200).json({
      message: "Leave status updated successfully",
    });
  } catch (error) {
    console.log("Error while approving leave", error);
    res.status(500).json({ message: "failed" });
  }
});

app.patch("/leave/reject:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE leave_table SET status = 'Rejected' where id=$1`,
      [id]
    );
    res.status(200).json({
      message: "Leave status updated successfully",
    });
  } catch (error) {
    console.log("Error while rejecting leave", error);
    res.status(500).json({ message: "failed" });
  }
});

app.post("/newleave", async (req, res) => {
  const { user_id, leave_type, start_date, end_date, days, reason } = req.body;
  const key = leave_type.split(" ")[0].toLowerCase();
  console.log("Request Body", req.body);
  try {
    const query = `
  UPDATE leave_balance
  SET bal_json = jsonb_set(bal_json, ARRAY[$1]::text[], to_jsonb((bal_json->>$1)::int - $2))
  WHERE user_id = $3
  AND (bal_json->>$1)::int >= $2;
`;

    const values = [key, parseInt(days), user_id];

    console.log(
      query
        .replace("$1", `'${values[0]}'`)
        .replace(/\$2/g, `${values[1]}`)
        .replace("$3", `'${values[2]}'`)
    );

    const leave_update_result = await pool.query(query, values);

    if (leave_update_result.rowCount <= 0) {
      res.status(400).json({ message: "Exceeding leave count" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO leave_table values ($1, $2, $3, $4, $5, $6)`,
      [user_id, leave_type, start_date, end_date, parseInt(days), reason]
    );
    res.status(201).json({ message: "created record" });
  } catch (error) {
    console.log("Error while post leave request", error);
    res.status(500).json({ message: "failed to create record" });
  }
});

app.get("/leave_balance/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const result = await pool.query(
      `SELECT * from leave_balance where user_id = $1`,
      [user_id]
    );
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/payroll", async (req, res) => {
  try {
    const payroll_records = await pool.query(
      `SELECT u.*, p.basic, p.hra, p.allowance, p.pf_cont, p.tax, p.gross, p.created_on
       FROM user_table u
       INNER JOIN payroll_table p ON u.user_id = p.user_id`
    );
    res.status(200).json(payroll_records.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve" });
  }
});

app.get("/payroll/:user_id", async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const payroll_records = await pool.query(
      `SELECT u.*, p.basic, p.hra, p.allowance, p.pf_cont, p.tax, p.gross, p.created_on
       FROM user_table u
       INNER JOIN payroll_table p ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [user_id]
    );
    res.status(200).json(payroll_records.rows);
  } catch (error) {
    console.log("Error while fetching user's payroll history");
    res.status(500).json({ message: "Failed to fetch payroll history" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
