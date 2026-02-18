import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Create a new todo
router.post("/", async (req, res) => {
  try {
    const { description, completed } = req.body;

    // Validation: Never trust the client input
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const newTodo = await pool.query(
      "INSERT INTO todo (description, completed) VALUES ($1, $2) RETURNING *;",
      [description, completed ?? false], // Use Nullish coalescing ?? instead of ||
    );

    res.status(201).json(newTodo.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all todos
router.get("/", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo");
    res.json(allTodos.rows);
  } catch {
    console.error("Database eror " + err.message);
    res.status(500).send("Server Error");
  }
});

// Update a todo
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;
    // Validation: Never trust the client input
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const updateTodo = await pool.query(
      "UPDATE todo " +
        "SET description = $1, " +
        "completed = $2 " +
        "WHERE todo_id = $3 RETURNING *",
      [description, completed || false, id],
    );
    if (updateTodo.rows.length == 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({
      message: "Todo was updated!",
      todo: updateTodo.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(404).send("Server Error");
  }
});

// Delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleteOp = await pool.query(
      "DELETE FROM todo WHERE todo_id = $1 RETURNING *",
      [id],
    );

    // Check if anything was actually deleted
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.json({ message: "Todo was deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
