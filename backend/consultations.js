const express = require('express');
const emailService = require('./emailService');

function consultationRoutes(supabase) {
    const router = express.Router();

    // Middleware to ensure user is logged in is applied in server.js (authenticateToken)

    // GET / - List my consultations
    router.get('/', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('consultations')
                .select('*')
                .eq('user_id', req.user.id)
                .order('scheduled_at', { ascending: true });

            if (error) throw error;
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /booked-slots - Return booked times for a specific date
    router.get('/booked-slots', async (req, res) => {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ error: 'Date required' });

        try {
            // Find all bookings where scheduled_at starts with date
            // Supabase filter for date range
            const start = `${date}T00:00:00`;
            const end = `${date}T23:59:59`;

            const { data, error } = await supabase
                .from('consultations')
                .select('scheduled_at')
                .gte('scheduled_at', start)
                .lte('scheduled_at', end)
                .neq('status', 'cancelled'); // Don't block cancelled slots

            if (error) throw error;
            
            // Extract HH:MM
            const times = data.map(d => {
                const dt = new Date(d.scheduled_at);
                // Return 'HH:MM'
                return dt.toTimeString().substring(0, 5); 
            });

            res.json(times);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to check availability' });
        }
    });

    // POST /book - Schedule a new consultation
    router.post('/book', async (req, res) => {
        const { date, time, topic, notes } = req.body;
        
        if (!date || !time) {
            return res.status(400).json({ error: 'Date and Time are required' });
        }

        // Combine date and time into ISO string
        // Assuming date is YYYY-MM-DD and time is HH:MM
        const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

        try {
            // Check Availability Check (Double check to prevent race conditions)
            const { data: existing } = await supabase
                .from('consultations')
                .select('id')
                .eq('scheduled_at', scheduledAt)
                .neq('status', 'cancelled')
                .single();
            
            if (existing) {
                return res.status(400).json({ error: 'This time slot is already booked. Please choose another.' });
            }

            const { data, error } = await supabase
                .from('consultations')
                .insert([{
                    user_id: req.user.id,
                    scheduled_at: scheduledAt,
                    notes: topic + (notes ? ` - ${notes}` : '')
                }])
                .select()
                .single();

            if (error) throw error;

            // Send Confirmation Email
            if (req.user && req.user.email) {
                // To User
                await emailService.sendConsultationBookingConfirmation(req.user.email, {
                    date,
                    time,
                    topic: topic,
                    meetingLink: 'https://meet.google.com/abc-defg-hij'
                });
                
                // To Admin
                await emailService.sendConsultationNotificationToAdmin(req.user, {
                    date,
                    time,
                    topic,
                    notes
                });
            }

            res.json({ message: 'Consultation booked successfully', consultation: data });

        } catch (error) {
            console.error('Booking Error:', error);
            res.status(500).json({ error: 'Failed to book consultation' });
        }
    });

    return router;
}

module.exports = consultationRoutes;
