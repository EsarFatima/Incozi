require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2');

async function run() {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Read SQL file
    const sql = fs.readFileSync('setup_db.sql', 'utf8');
    
    console.log('Connecting to MySQL...');
    await connection.promise().connect();
    
    console.log('Executing setup_db.sql...');
    await connection.promise().query(sql);
    console.log('Database and tables created successfully.');

    // List tables
    console.log('Verifying tables in incozi_db...');
    const [rows] = await connection.promise().query('SHOW TABLES FROM incozi_db');
    console.log('\nGenerated Tables Report:');
    console.log('=========================');
    rows.forEach(row => {
      // The key name depends on the database name, e.g. Tables_in_incozi_db
      const tableName = Object.values(row)[0];
      console.log(`- ${tableName}`);
    });
    console.log('=========================');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    connection.end();
  }
}

run();
