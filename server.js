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

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'assets/uploads/';
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + cleanName);
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Mount Routes with Supabase client
app.use('/api/auth', authRoutes(supabase));
app.use('/api/payments', paymentRoutes(supabase));
app.use('/api/services', serviceRoutes(supabase));

// --- File Upload Endpoint ---
app.post('/api/upload', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        const documentType = req.body.type || 'General';
        const filePath = '/uploads/' + req.file.filename; // Relative web path

        // Fix: Fetch a valid service ID (UUID) instead of hardcoding '1'
        const { data: serviceData } = await supabase
            .from('services')
            .select('id')
            .limit(1)
            .maybeSingle();

        // If no service exists, we can't insert because of the Foreign Key constraint. 
        // We'll use the user's ID if we can't find a service (hacky but unlikely to happen if services exist)
        // or loop up a specific 'General' service. 
        // For now, allow it to fail gracefully if no service found, or use the found ID.
        const serviceIdToUse = serviceData ? serviceData.id : null;

        if (!serviceIdToUse) {
             return res.status(400).json({ error: 'System Error: No services configured to link file to.' });
        }

        // 1. Save to DB
        const { data: doc, error } = await supabase
            .from('documents')
            .insert([{
                user_id: userId,
                file_path: filePath,
                document_type: documentType,
                uploaded_by: 'client',
                service_id: serviceIdToUse 
            }])
            .select()
            .single();

        if (error) { 
             // If service_id is the issue, fail gracefully
             if (error.code === '23503') { // Foreign key violation
                 throw new Error("Invalid Service ID linked to document.");
             }
             throw error; 
        }

        // 2. Send Admin Notification
        // Fetch User details for email
        const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
        
        await emailService.sendDocumentUploadNotificationToAdmin(
            { id: doc.id, filename: req.file.originalname, type: documentType },
            user
        );

        res.json({ success: true, message: 'File uploaded successfully', document: doc });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

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
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log('Connected to Supabase (via REST Client).');
});
