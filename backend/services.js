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
            order_status,
            tracking_notes,
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
          order_status: s.order_status || 'pending',
          tracking_notes: s.tracking_notes || '',
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

  // UPDATE ORDER STATUS (Admin)
  router.put('/subscriptions/:subId/status', async (req, res) => {
    try {
        const { subId } = req.params;
        const { order_status, tracking_notes } = req.body;

        const updateData = { order_status };
        if (tracking_notes !== undefined) {
            updateData.tracking_notes = tracking_notes;
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', subId);

        if (error) throw error;

        // Get user email for notification
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id, users!inner(email, full_name)')
          .eq('id', subId)
          .maybeSingle();

        if (!subError && subscription) {
            // Send email notification (will implement in emailService)
            const emailService = require('./emailService');
            await emailService.sendOrderStatusUpdate(
                subscription.users.email,
                subscription.users.full_name,
                order_status,
                tracking_notes
            );
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  // GET ALL ORDERS (Admin)
  router.get('/admin/orders', async (req, res) => {
    try {
        const { status } = req.query;

        let query = supabase
          .from('subscriptions')
          .select(`
            id,
            status,
            order_status,
            tracking_notes,
            created_at,
            start_date,
            user:users(id, full_name, email),
            plan:plans(id, name, price, service:services(name))
          `)
          .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('order_status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  // GET ORDER STATS (Admin)
  router.get('/admin/stats', async (req, res) => {
    try {
        const { data: allSubs, error } = await supabase
          .from('subscriptions')
          .select('order_status, status');

        if (error) throw error;

        const stats = {
            total: allSubs.length,
            pending: allSubs.filter(s => s.order_status === 'pending').length,
            in_progress: allSubs.filter(s => s.order_status === 'in_progress').length,
            completed: allSubs.filter(s => s.order_status === 'completed').length,
            active: allSubs.filter(s => s.status === 'active').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
