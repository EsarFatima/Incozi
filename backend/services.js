const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  // GET /api/services
  // Returns all services with their plans
  router.get('/', async (req, res) => {
    try {
      // Fetch services
      const [services] = await pool.promise().query('SELECT * FROM services WHERE is_active = 1');
      
      // Fetch plans
      const [plans] = await pool.promise().query('SELECT * FROM plans WHERE is_active = 1');

      // Group plans by service
      const result = services.map(service => {
        return {
          ...service,
          plans: plans.filter(p => p.service_id === service.id)
        };
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET /api/services/my-subscriptions?userId=1
  router.get('/my-subscriptions', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const query = `
            SELECT s.id, p.name as plan_name, sv.name as service_name, s.status, s.end_date, s.start_date, p.price, p.billing_cycle
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            JOIN services sv ON p.service_id = sv.id
            WHERE s.user_id = ? AND s.status != 'cancelled'
            ORDER BY s.created_at DESC
        `;
        
        const [subs] = await pool.promise().query(query, [userId]);
        res.json(subs);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
