require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const emailService = require('./backend/emailService');
const authRoutes = require('./backend/auth'); // Import auth routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Initialize MySQL pooling
// Ensure you create a database named 'incozi_db' in your MySQL server
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'incozi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and initialize tables
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.error('Ensure you have created the database and updated .env file');
    // We don't exit process here strictly, to allow server to start even if DB is down initially
    return;
  }
  console.log('Connected to MySQL database.');
  
  // Create tables
  const subscribersTable = `
    CREATE TABLE IF NOT EXISTS subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const contactsTable = `
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  connection.query(subscribersTable, (err) => {
    if (err) console.error('Error creating subscribers table:', err);
  });

  connection.query(contactsTable, (err) => {
    if (err) console.error('Error creating contacts table:', err);
  });

  connection.release();
});

// Mount Auth Routes
app.use('/api/auth', authRoutes(pool));

// API endpoints
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Valid email required' });
  
  const cleaned = email.trim().toLowerCase();
  const query = 'INSERT IGNORE INTO subscribers (email) VALUES (?)';
  
  pool.execute(query, [cleaned], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.affectedRows === 0) return res.status(200).json({ message: 'Already subscribed' });
    
    // Send welcome email
    await emailService.sendNewsletterWelcome(cleaned);
    
    return res.status(201).json({ message: 'Subscribed' });
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!email || !message) return res.status(400).json({ error: 'Email and message required' });
  
  const query = 'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)';
  pool.execute(query, [name || null, email.trim().toLowerCase(), message], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    // Send acknowledgement to user
    await emailService.sendContactFormAcknowledgement(email, name);
    // Send notification to admin
    await emailService.sendContactFormNotificationToAdmin({ name, email, message });

    return res.status(201).json({ message: 'Message received' });
  });
});

// Simple admin endpoint
app.get('/api/admin/subscribers', (req, res) => {
  pool.query('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 1000', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

process.on('SIGINT', () => {
  pool.end((err) => {
    console.log('MySQL pool closed');
    process.exit(err ? 1 : 0);
  });
});
