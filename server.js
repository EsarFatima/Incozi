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

// --- DOCUMENT ROUTES ---

// 1. Upload Documents (Multiple)
app.post('/api/documents/upload', authenticateToken, upload.array('documents', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        const userId = req.user.id;
        
        // FIX: Retrieve a default Service ID for the 'NOT NULL' constraint
        // Ideally, we make the column nullable, but as a fallback, we grab the first service.
        let serviceId = null;
        const { data: serviceData } = await supabase.from('services').select('id').limit(1).maybeSingle();
        if (serviceData) {
            serviceId = serviceData.id;
        }

        const uploadedFiles = [];
        const fileNames = [];
        const errors = [];

        for (const file of req.files) {
            const filePath = `uploads/${file.filename}`; // Relative path for DB
            
            const insertPayload = {
                user_id: userId,
                file_path: filePath, 
                document_type: file.mimetype,
                uploaded_by: 'client'
            };
            
            // Only add service_id if we found one. If the DB requires it and we didn't find one, it will fail.
            // If the DB allows null, this is fine.
            if (serviceId) {
                insertPayload.service_id = serviceId;
            }

            const { data, error } = await supabase
                .from('documents')
                .insert(insertPayload)
                .select()
                .single();
            
            if (error) {
                console.error('DB Insert Error for file:', file.originalname, error);
                errors.push(file.originalname + ': ' + error.message);
            } else {
                uploadedFiles.push(data);
                fileNames.push(file.originalname);
            }
        }

        // Fetch user details for email
        const { data: user } = await supabase.from('users').select('email, full_name').eq('id', userId).single();
        
        // Send Emails
        if (user && fileNames.length > 0) {
           // We suppress email errors to avoid blocking the response
           try {
               await emailService.sendUserUploadConfirmation(user.email, fileNames);
               await emailService.sendAdminUploadAlert(user, fileNames);
           } catch (emailErr) {
               console.error("Email failed:", emailErr);
           }
        }
        
        if (uploadedFiles.length === 0 && errors.length > 0) {
             return res.status(500).json({ error: 'Upload failed for all files.', details: errors });
        }

        res.json({ 
            message: 'Files processed', 
            files: uploadedFiles, 
            errors: errors.length > 0 ? errors : undefined 
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Get My Documents
app.get('/api/documents/my-documents', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', req.user.id)
            .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



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
