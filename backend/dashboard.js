const express = require('express');
const router = express.Router();

// This module handles the specific "Client Portal" views:
// Accounting, Entities, Calendar, Payment Methods, etc.

module.exports = (supabase) => {

    /**
     * ACCOUNTING: Get Transactions
     * GET /api/dashboard/accounting
     */
    router.get('/accounting', async (req, res) => {
        const userId = req.user.id; // From middleware
        // Filter params
        const { type, orderId } = req.query;

        try {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('transaction_date', { ascending: false });

            if (type && type !== 'All') {
                // Map frontend "Orders and Payments" etc. to DB types if needed
                // For now, assuming direct match or simple filter
                if (type === 'Orders Only') query = query.eq('type', 'order');
                if (type === 'Payments Only') query = query.eq('type', 'payment');
            }

            if (orderId) {
                query = query.eq('related_order_id', orderId);
            }

            const { data, error } = await query;
            if (error) throw error;
            
            res.json(data || []);
        } catch (err) {
            console.error('Accounting API Error:', err);
            // Return empty array on error to prevent UI crash, or 500
            res.status(500).json({ error: 'Failed to fetch accounting data' });
        }
    });

    /**
     * ENTITIES: Get User Companies
     * GET /api/dashboard/entities
     */
    router.get('/entities', async (req, res) => {
        const userId = req.user.id;
        try {
            const { data, error } = await supabase
                .from('entities')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            res.json(data || []);
        } catch (err) {
            console.error('Entities API Error:', err);
            res.status(500).json({ error: 'Failed to fetch entities' });
        }
    });

    /**
     * CALENDAR: Get Compliance Events
     * GET /api/dashboard/calendar
     */
    router.get('/calendar', async (req, res) => {
        const userId = req.user.id;
        const { entity, jurisdiction, start, end } = req.query;

        try {
            // Join with entities to get entity name
            let query = supabase
                .from('calendar_events')
                .select(`
                    *,
                    entities!left (name, jurisdiction)
                `)
                .eq('user_id', userId)
                .order('due_date', { ascending: true });

            if (start) query = query.gte('due_date', start);
            if (end) query = query.lte('due_date', end);

            // Fetch
            const { data, error } = await query;
            if (error) throw error;
            
            // Post-filter for Entity Name or Jurisdiction (since Supabase join filter is tricky to do simple text search on joined relation without embedding)
            // Or we could use !inner join to filter, but that hides events without entities.
            // For now, let's filter in JS for search (since dataset likely small per user)
            
            let events = data.map(evt => ({
                ...evt,
                entity_name: evt.entities ? evt.entities.name : '',
                entity_jurisdiction: evt.entities ? evt.entities.jurisdiction : ''
            }));

            if (entity) {
                const lower = entity.toLowerCase();
                events = events.filter(e => e.entity_name.toLowerCase().includes(lower));
            }
            if (jurisdiction) {
                events = events.filter(e => e.entity_jurisdiction === jurisdiction);
            }

            res.json(events);
        } catch (err) {
            console.error('Calendar API Error:', err);
            res.status(500).json({ error: 'Failed to fetch calendar events' });
        }
    });

    /**
     * CALENDAR: Create Event
     * POST /api/dashboard/calendar
     */
    router.post('/calendar', async (req, res) => {
        const userId = req.user.id;
        const { subject, due_date } = req.body;

        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .insert([{
                    user_id: userId,
                    subject,
                    due_date,
                    status: 'pending'
                }])
                .select();
            
            if (error) throw error;
            res.json(data[0]);
        } catch (err) {
            console.error('Create Event Error:', err);
            res.status(500).json({ error: 'Failed to create event' });
        }
    });

    /**
     * PAYMENT METHODS: Get Stored Cards
     * GET /api/dashboard/payment-methods
     */
    router.get('/payment-methods', async (req, res) => {
        const userId = req.user.id;
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            res.json(data || []);
        } catch (err) {
            console.error('Payment Methods API Error:', err);
            res.status(500).json({ error: 'Failed to fetch payment methods' });
        }
    });

    /**
     * GENERIC EXPORT
     * GET /api/dashboard/export/:type
     */
    router.get('/export/:type', async (req, res) => {
        // Enforce Admin Only for Export
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).send('Access Denied. Admin privileges required.');
        }

        const userId = req.user.id;
        const type = req.params.type; 
        
        try {
            let data = [];
            let filename = `incozi_${type}_export.csv`;

            if (type === 'accounting') {
                const { data: results } = await supabase.from('transactions').select('*').eq('user_id', userId);
                data = results || [];
            } else if (type === 'entities') {
                const { data: results } = await supabase.from('entities').select('*').eq('user_id', userId);
                data = results || [];
            } else if (type === 'calendar') {
                const { data: results } = await supabase.from('calendar_events').select('*, entities(name)').eq('user_id', userId);
                // Flatten
                data = (results || []).map(r => ({
                    ...r,
                    entity: r.entities ? r.entities.name : '',
                    entities: undefined // remove nested object
                }));
            } else {
                return res.status(400).send('Invalid export type');
            }

            // Convert to CSV
            if (data.length === 0) {
                 res.setHeader('Content-Type', 'text/csv');
                 res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                 return res.send('No Data');
            }

            const headers = Object.keys(data[0]);
            const csvRows = [];
            csvRows.push(headers.join(','));

            for (const row of data) {
                const values = headers.map(header => {
                    const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            }

            const csvString = csvRows.join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvString);

        } catch (err) {
            console.error('Export Error:', err);
            res.status(500).send('Failed to export data');
        }
    });

    return router;
};
