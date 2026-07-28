import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import re from 're';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'thanaweya.db');

// Enable CORS for all origins & public tunnels
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, bypass-tunnel-reminder');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(__dirname));

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to Thanaweya SQLite database successfully.");
  }
});

function normalizeArabic(text) {
  if (!text) return '';
  let str = text
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  str = str
    .replace(/عبد\s+/g, 'عبد')
    .replace(/ابو\s+/g, 'ابو')
    .replace(/بن\s+/g, 'بن');

  return str;
}

// API Endpoint 1: Search Students (by seat_no or name)
app.get('/api/search', (req, res) => {
  const query = (req.query.query || '').toString().trim();
  const mode = req.query.mode || 'auto';

  if (!query) {
    return res.json({ count: 0, results: [] });
  }

  let isNumeric = /^\d+$/.test(query);
  if (mode === 'seat') isNumeric = true;
  if (mode === 'name') isNumeric = false;

  if (isNumeric) {
    const seatNo = parseInt(query, 10);
    const sql = `SELECT seat_no, name, name_norm, total, case_desc FROM students WHERE seat_no = ?`;
    db.all(sql, [seatNo], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ count: rows.length, results: rows });
    });
  } else {
    const norm = normalizeArabic(query);
    const words = norm.split(' ').filter(Boolean);

    if (words.length === 0) {
      return res.json({ count: 0, results: [] });
    }

    let sql = `SELECT seat_no, name, name_norm, total, case_desc FROM students WHERE `;
    const conditions = words.map(() => `name_norm LIKE ?`);
    sql += conditions.join(' AND ');
    sql += ` ORDER BY total DESC LIMIT 100`;

    const params = words.map(w => `%${w}%`);

    db.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ count: rows.length, results: rows });
    });
  }
});

// API Endpoint 2: Total Statistics
app.get('/api/stats', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_students,
      ROUND(AVG(total), 2) as avg_total,
      MAX(total) as max_total,
      MIN(total) as min_total,
      SUM(CASE WHEN case_desc LIKE '%ناجح%' THEN 1 ELSE 0 END) as passed_count,
      SUM(CASE WHEN case_desc LIKE '%ثان%' THEN 1 ELSE 0 END) as second_round_count,
      SUM(CASE WHEN case_desc LIKE '%راسب%' OR case_desc LIKE '%مستنفد%' OR case_desc LIKE '%غياب%' THEN 1 ELSE 0 END) as failed_count
    FROM students
  `;
  db.get(sql, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const passRate = row.total_students ? round((row.passed_count / row.total_students) * 100, 2) : 0;
    res.json({ ...row, pass_rate: passRate });
  });
});

function round(val, dec) {
  return Number(Math.round(val + 'e' + dec) + 'e-' + dec);
}

app.listen(PORT, () => {
  console.log(`Thanaweya API Server running on http://localhost:${PORT}`);
});
