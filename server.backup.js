const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite DB
const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error('Could not open db', err);
  else console.log('Connected to SQLite database.');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// API endpoints
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Valid email required' });
  const cleaned = email.trim().toLowerCase();
  const stmt = db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)');
  stmt.run(cleaned, function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(200).json({ message: 'Already subscribed' });
    return res.status(201).json({ message: 'Subscribed' });
  });
  stmt.finalize();
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!email || !message) return res.status(400).json({ error: 'Email and message required' });
  const stmt = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)');
  stmt.run(name || null, email.trim().toLowerCase(), message, function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    return res.status(201).json({ message: 'Message received' });
  });
  stmt.finalize();
});

// Simple admin endpoint to list subscribers (for local/dev only)
app.get('/api/admin/subscribers', (req, res) => {
  db.all('SELECT id,email,created_at FROM subscribers ORDER BY created_at DESC LIMIT 1000', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

process.on('SIGINT', () => {
  db.close();
  process.exit();
});
