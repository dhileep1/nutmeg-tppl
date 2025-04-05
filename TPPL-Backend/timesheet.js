import express from "express";
import cors from "cors";
import { pool } from "./Database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/timesheet", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM timesheet_table;");
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
