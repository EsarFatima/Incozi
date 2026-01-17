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

const seed = async () => {
    const connection = await pool.promise().getConnection();
    
    try {
        console.log('🌱 Seeding Services and Plans...');

        // 1. Clear existing (Optional, be careful in prod)
        // await connection.query('DELETE FROM plans'); 
        // await connection.query('DELETE FROM services');
        
        // 2. Insert Services
        // Check if exists first to avoid duplicates
        const [services] = await connection.query(`SELECT id, name FROM services`);
        let serviceMap = {};
        
        if (services.length === 0) {
            console.log('Inserting Services...');
            const serviceData = [
                ['US Incorporation', 'Form your LLC or C-Corp in the USA.'],
                ['Tax & Compliance', 'File your annual taxes and reports.'],
                ['Bookkeeping', 'Monthly financial record keeping.']
            ];
            
            for (const [name, desc] of serviceData) {
                const [res] = await connection.query('INSERT INTO services (name, description) VALUES (?, ?)', [name, desc]);
                serviceMap[name] = res.insertId;
            }
        } else {
            console.log('Services already exist. Using existing IDs.');
            services.forEach(s => serviceMap[s.name] = s.id);
        }

        // 3. Insert Plans
        const [plans] = await connection.query(`SELECT count(*) as cnt FROM plans`);
        if (plans[0].cnt === 0) {
            console.log('Inserting Plans...');
            const planData = [
                // Service, Name, Price, Cycle
                [serviceMap['US Incorporation'], 'Standard Incorporation', 299.00, 'one_time'],
                [serviceMap['Tax & Compliance'], 'Annual Tax Filing', 499.00, 'yearly'],
                [serviceMap['Bookkeeping'], 'Monthly Bookkeeping (Basic)', 199.00, 'monthly']
            ];

            for (const [srvId, name, price, cycle] of planData) {
               if (srvId) {
                   await connection.query(
                       'INSERT INTO plans (service_id, name, price, billing_cycle) VALUES (?, ?, ?, ?)',
                       [srvId, name, price, cycle]
                   );
               }
            }
            console.log('✅ Plans Inserted.');
        } else {
            console.log('Plans already exist. Skipping.');
        }

        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
};

seed();
