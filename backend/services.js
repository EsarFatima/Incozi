const express = require('express');
const router = express.Router();

// Supabase-backed services routes
module.exports = (supabase) => {

  // GET /api/services
  // Returns all services with their plans
  router.get('/', async (req, res) => {
    try {
      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Fetch plans
      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true);

      if (plansError) throw plansError;

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

        const { data: subs, error } = await supabase
          .from('subscriptions')
          .select(`
            id,
            status,
            end_date,
            start_date,
            created_at,
            plan:plans(id,name,price,billing_cycle,service:services(id,name))
          `)
          .eq('user_id', userId)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const shaped = (subs || []).map((s) => ({
          id: s.id,
          plan_name: s.plan?.name,
          service_name: s.plan?.service?.name,
          status: s.status,
          end_date: s.end_date,
          start_date: s.start_date,
          price: s.plan?.price,
          billing_cycle: s.plan?.billing_cycle
        }));

        res.json(shaped);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
