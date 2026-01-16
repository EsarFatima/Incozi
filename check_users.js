require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'incozi_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to DB:', err);
    return;
  }
  console.log('\nConnected to database. Fetching users...\n');

  connection.query('SELECT id, full_name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
    } else {
      if (rows.length === 0) {
        console.log('No users found in the database yet.');
      } else {
        console.table(rows);
        console.log(`\nFound ${rows.length} user(s).`);
      }
    }
    connection.end();
  });
});
