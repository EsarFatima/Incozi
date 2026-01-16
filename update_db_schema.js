require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'incozi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  
  console.log('Connected to DB. Checking for verification_token column...');

  const query = `
    SELECT count(*) AS cnt 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'verification_token'
  `;

  connection.query(query, [process.env.DB_NAME || 'incozi_db'], (err, results) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (results[0].cnt > 0) {
      console.log('Column verification_token already exists.');
      pool.end();
    } else {
      console.log('Adding verification_token column...');
      const alterSql = `ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) AFTER is_verified`;
      connection.query(alterSql, (err) => {
        if (err) console.error('Error adding column:', err);
        else console.log('Successfully added verification_token column.');
        pool.end();
      });
    }
  });
});
