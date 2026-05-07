require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const supabase = require('./backend/supabaseClient');
const emailService = require('./backend/emailService');
const authRoutes = require('./backend/auth'); // Import auth routes
const paymentRoutes = require('./backend/payments'); // Import payment routes
const serviceRoutes = require('./backend/services'); // Import service routes
const adminRoutes = require('./backend/admin'); // Import admin routes
const consultationRoutes = require('./backend/consultations'); // Import consultation routes
const dashboardRoutes = require('./backend/dashboard'); // Import dashboard routes
const documentRoutes = require('./backend/documents'); // Import document routes
const chatRoutes = require('./backend/chat'); // Import chat routes
const { authenticateToken, requireAdmin } = require('./backend/middleware');
const multer = require('multer');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
// Make uploads publicly accessible (secured by difficult filenames, but realistically should be proxied)
// For this stage, static serving is fine.
app.use('/uploads', express.static(path.join(__dirname, 'assets/uploads')));

// Configure Multer for File Uploads (Memory Storage for Supabase)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- ROUTES ---

// Mount Routes with Supabase client
app.use('/api/auth', authRoutes(supabase));
app.use('/api/payments', paymentRoutes(supabase));
app.use('/api/services', serviceRoutes(supabase));
app.use('/api/consultations', authenticateToken, consultationRoutes(supabase));
app.use('/api/dashboard', authenticateToken, dashboardRoutes(supabase)); // Mount new dashboard routes
app.use('/api/documents', authenticateToken, documentRoutes(supabase)); // Mount document routes
app.use('/api/chat', authenticateToken, chatRoutes(supabase)); // Mount chat routes
app.use('/api/admin', authenticateToken, adminRoutes(supabase));

// --- Standalone Endpoints converted to Supabase ---

// 1. Subscribe (Newsletter)
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    
    try {
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (error) {
            // Check for duplicate key error (code 23505 in Postgres)
            if (error.code === '23505') {
                 return res.status(409).json({ success: false, message: 'Email already subscribed.' });
            }
            throw error;
        }

        // Send welcome email (optional, assuming functionality exists)
        // await emailService.sendNewsletterWelcome(email);

        res.json({ success: true, message: 'Subscription successful!' });
    } catch (err) {
        console.error('Subscription error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 2. Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Save to DB
        const { error } = await supabase
            .from('contacts')
            .insert([{ name, email, message }]);

        if (error) throw error;

        // Send Email Notification
        await emailService.sendContactFormNotificationToAdmin({ name, email, message });
        await emailService.sendContactFormAcknowledgement(email, name);

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 3. Admin: Get Subscribers
app.get('/api/admin/subscribers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error fetching subscribers:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
        console.log('Connected to Supabase (via REST Client).');
    });
}

module.exports = app;
