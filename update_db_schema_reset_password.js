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
  
  console.log('Connected to DB. Checking for reset_token column...');

  const query = `
    SELECT count(*) AS cnt 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = ? 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'reset_token'
  `;

  connection.query(query, [process.env.DB_NAME || 'incozi_db'], (err, results) => {
    if (err) {
      console.error('Error querying information_schema:', err);
      connection.release();
      process.exit(1);
    }

    if (results[0].cnt === 0) {
      console.log('Adding reset_token and reset_token_expires columns...');
      const alterQuery = `
        ALTER TABLE users 
        ADD COLUMN reset_token VARCHAR(255) NULL AFTER is_verified,
        ADD COLUMN reset_token_expires DATETIME NULL AFTER reset_token
      `;
      
      connection.query(alterQuery, (err, result) => {
        connection.release();
        if (err) {
          console.error('Error altering table:', err);
          process.exit(1);
        }
        console.log('Successfully added reset_token columns.');
        process.exit(0);
      });
    } else {
      console.log('Columns already exist.');
      connection.release();
      process.exit(0);
    }
  });
});
