import express from "express";
import cors from "cors";
import { pool } from "./Database.js";

const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
