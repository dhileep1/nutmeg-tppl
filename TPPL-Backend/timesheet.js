import express from "express";
import cors from "cors";
import { pool } from "./Database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/timesheet", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM timesheets;");
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});

app.post("/addsheet", async (req, res) => {
  const {
    memberName,
    department,
    businessUnitCode,
    globalBusinessUnitCode,
    projectCode,
    activityCode,
    shiftCode,
    hours,
    date,
    leave,
    compOff,
    status,
  } = req.body;

  console.log("Request Body", req.body);

  try {
    const result = await pool.query(
      `INSERT INTO timesheets (
        member_name, department, business_unit_code, global_business_unit_code,
        project_code, activity_code, shift_code, hours, date, leave, comp_off, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        memberName,
        department,
        businessUnitCode,
        globalBusinessUnitCode,
        projectCode,
        activityCode,
        shiftCode,
        hours,
        date,
        leave,
        compOff,
        status || "Pending",
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to add entry" });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 3000");
});
