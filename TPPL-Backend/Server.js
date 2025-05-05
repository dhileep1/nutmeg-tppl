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

// -- USER MANAGEMENT MODULE -- //

app.get("/check_role/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const userResult = await pool.query(
      "SELECT user_id from user_table where email = $1",
      [email]
    );
    const user_id = userResult.rows[0]?.user_id;
    const role_type = await pool.query(
      "SELECT role_type from role_table where user_id = $1",
      [user_id]
    );
    return res
      .status(200)
      .json({ role_type: role_type.rows[0]?.role_type, user_id: user_id });
  } catch (error) {
    console.log("Error while fetching status", error);
    return res.status(404).json({ role_type: null, user_id: null });
  }
});

// -- LEAVE MODULE -- //

// Retrieves all leave records
app.get("/leave", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leave_table;");
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});

// Updates leave record based on the admin's approval status
app.patch("/leave/approve/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      `UPDATE leave_table SET status = 'Approved' where id = $1`,
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

// Updates leave record based on the admin's reject status
app.patch("/leave/reject/:id", async (req, res) => {
  const id = req.params.id;
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

// New leave record creation
app.post("/newleave", async (req, res) => {
  const { user_id, leave_type, start_date, end_date, days, reason } = req.body;
  const key = leave_type.split(" ")[0].toLowerCase();
  const leave_days = parseInt(days);

  try {
    const query = `
      UPDATE leave_balance
      SET bal_json = jsonb_set(
        bal_json, 
        ARRAY[$1]::text[], 
        to_jsonb((bal_json->>$1)::int - $2)
      )
      WHERE user_id = $3
      AND (bal_json->>$1)::int >= $2;
    `;
    const values = [key, leave_days, user_id];
    const leave_update_result = await pool.query(query, values);
    if (leave_update_result.rowCount <= 0) {
      return res
        .status(400)
        .json({ message: "Exceeding leave count or invalid type" });
    }

    const insert_query = `
      INSERT INTO leave_table
        (user_id, leave_type, start_date, end_date, days, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await pool.query(insert_query, [
      user_id,
      leave_type,
      start_date,
      end_date,
      leave_days,
      reason,
    ]);

    res.status(201).json({ message: "Created leave record" });
  } catch (error) {
    console.error("Error while posting leave request:", error);
    res.status(500).json({ message: "Failed to create record" });
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

// -- END LEAVE MODULE -- //
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

/* -- Timesheet Modules -- */

app.get("/timesheet/:id/:start_date", async (req, res) => {
  const user_id = req.params.id;
  const start_date = req.params.start_date;
  let last_date = new Date(start_date);
  last_date.setDate(last_date.getDate() + 6);
  last_date = last_date.toISOString().split("T")[0];
  console.log(user_id, start_date, last_date);
  try {
    const result = await pool.query(
      "SELECT u.user_name, t.* FROM user_table u INNER JOIN timesheets t ON u.user_id = t.user_id WHERE u.user_id = $1 AND t.date BETWEEN $2 and $3 ORDER BY t.date, t.start_time",
      [user_id, start_date, last_date]
    );
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});

app.post("/addsheet", async (req, res) => {
  const {
    user_id,
    business_unit_code,
    global_business_unit_code,
    project_code,
    activity_code,
    shift_code,
    hours,
    date,
    leave,
    comp_off,
    status,
    start_time,
    end_time,
  } = req.body;

  console.log("addsheet", req.body);
  try {
    const result = await pool.query(
      `INSERT INTO timesheets (
        user_id, business_unit_code, global_business_unit_code,
        project_code, activity_code, shift_code, hours, date, leave, comp_off, status,
        start_time, end_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        user_id,
        business_unit_code,
        global_business_unit_code,
        project_code,
        activity_code,
        shift_code,
        hours,
        date,
        leave,
        comp_off,
        status,
        start_time,
        end_time,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to add entry" });
  }
});

app.patch("/timesheet/update/:id/:status", async (req, res) => {
  const id = req.params.id;
  const status = req.params.status;
  const response = await pool.query(
    "UPDATE timesheets SET status = $2 WHERE id = $1",
    [id, status]
  );
  return res.status(200).json({ message: "Updated Successfully" });
});

app.put("/timesheet/revise/:id", async (req, res) => {
  const id = req.params.id;
  const { hours, date, activity_code, shift_code, start_time, end_time } =
    req.body;
  console.log(req.body);
  try {
    const response = await pool.query(
      "UPDATE timesheets SET hours = $1, date = $2, activity_code = $3, shift_code = $4, status = 'Pending', start_time = $5, end_time = $6 WHERE id = $7",
      [hours, date, activity_code, shift_code, start_time, end_time, id]
    );
    return res
      .status(200)
      .json({ message: "Timesheet has been revised successfully" });
  } catch (error) {
    console.error("Error while updating revised timesheet:", error);
    return res
      .status(500)
      .json({ message: "Error while updating revised timesheet" });
  }
});

app.patch("/timesheet/update_week/:start_date", async (req, res) => {
  try {
    const start_date = req.params.start_date;
    let last_date = new Date(start_date);
    last_date.setDate(last_date.getDate() + 6);
    last_date = last_date.toISOString().split("T")[0];
    console.log("Start Date", start_date);
    const response = await pool.query(
      `UPDATE timesheets 
       SET status = $3 
       WHERE status IS NULL AND date BETWEEN $1 AND $2`,
      [start_date, last_date, "Pending"]
    );

    return res
      .status(200)
      .json({ message: "Submitted Weekly Report Successfully" });
  } catch (err) {
    console.error("Error updating timesheets:", err);
    return res.status(500).json({ error: "Error Submitting Weekly Records" });
  }
});

app.delete("/timesheet/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await pool.query("DELETE FROM timesheets WHERE id = $1", [
      id,
    ]);
    return res.status(200).json({ message: "Successfully deleted the record" });
  } catch (error) {
    console.error("Error while deleting the record");
    return res.status(500).json({ error: "Error Deleting Record" });
  }
});
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
