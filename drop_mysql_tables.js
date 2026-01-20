// Script to drop MySQL tables (Helper)
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'incozi_db',
  waitForConnections: true,
  connectionLimit: 1
});

const tablesToDrop = [
    'notifications',
    'email_subscribers',
    'contacts',
    'consultations',
    'documents',
    'payments',
    'subscriptions',
    'plans',
    'services',
    'users',
    'subscribers' 
];

async function dropTables() {
    console.log('Starting to drop MySQL tables...');
    const promisePool = pool.promise();

    try {
        await promisePool.query('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const table of tablesToDrop) {
            try {
                await promisePool.query(`DROP TABLE IF EXISTS ${table}`);
                console.log(`Dropped table: ${table}`);
            } catch (err) {
                console.error(`Error dropping ${table}:`, err.message);
            }
        }

        await promisePool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('All tables dropped successfully.');
    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        pool.end();
    }
}

dropTables();
