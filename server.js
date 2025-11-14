const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const parseOrigins = (value) =>
  value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.CLIENT_ORIGIN);
const corsOptions = allowedOrigins?.length
  ? { origin: allowedOrigins }
  : { origin: true };

app.use(cors(corsOptions));
app.use(express.json());

const dbHost = process.env.DB_HOST || process.env.DB_SERVER || "127.0.0.1";
const dbPassword = process.env.DB_PASSWORD || process.env.DB_PWD || "";

const pool = mysql.createPool({
  host: dbHost,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: dbPassword,
  database: process.env.DB_NAME || "thoughts_db",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0
});

const sanitizeText = (text) =>
  typeof text === "string" ? text.trim().slice(0, 280) : "";

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/thoughts", async (_req, res) => {
  try {
    const limit = Number(process.env.RESULT_LIMIT) || 20;
    const [rows] = await pool.execute(
      "SELECT id, text, created_at FROM thoughts ORDER BY created_at DESC LIMIT ?",
      [limit]
    );

    res.json(
      rows.map((row) => ({
        id: row.id,
        text: row.text,
        createdAt: row.created_at
      }))
    );
  } catch (error) {
    console.error("Error fetching thoughts:", error);
    res.status(500).json({ error: "Failed to fetch thoughts." });
  }
});

app.post("/thoughts", async (req, res) => {
  const text = sanitizeText(req.body?.text);

  if (!text) {
    return res.status(400).json({ error: "Text is required." });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO thoughts (text) VALUES (?)",
      [text]
    );

    const [rows] = await pool.execute(
      "SELECT id, text, created_at FROM thoughts WHERE id = ?",
      [result.insertId]
    );

    const entry = rows[0];
    res.status(201).json({
      id: entry.id,
      text: entry.text,
      createdAt: entry.created_at
    });
  } catch (error) {
    console.error("Error saving thought:", error);
    res.status(500).json({ error: "Failed to save thought." });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

