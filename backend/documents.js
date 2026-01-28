const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const uploadDir = 'assets/uploads/';
      if (!fs.existsSync(uploadDir)){
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + cleanName);
  }
});
const upload = multer({ storage: storage });

module.exports = (supabase) => {

    /**
     * GET /api/documents/my-documents
     * Fetch user specific documents
     */
    router.get('/my-documents', async (req, res) => {
        try {
            const userId = req.user.id;
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', userId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            console.error("Fetch docs error:", err);
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /api/documents/upload
     * Upload a new document
     */
    router.post('/upload', upload.array('documents'), async (req, res) => {
        try {
            const userId = req.user.id;
            const files = req.files;
            
            if(!files || files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            // Get a default service ID if service_id is NOT NULL
            let serviceId = null;
            const { data: serviceData } = await supabase.from('services').select('id').limit(1).maybeSingle();
            if (serviceData) {
                serviceId = serviceData.id;
            }

            const records = files.map(file => {
                const record = {
                    user_id: userId,
                    file_path: file.path.replace(/\\/g, '/'), // Store relative path normalized
                    uploaded_by: 'client',
                    document_type: 'User Upload',
                    uploaded_at: new Date()
                };
                // Only add service_id if we have one
                if (serviceId) {
                    record.service_id = serviceId;
                }
                return record;
            });

            const { error } = await supabase.from('documents').insert(records);
            
            if (error) {
                console.error('Database insert error:', error);
                throw error;
            }

            res.json({ message: 'Files uploaded successfully', count: files.length });

        } catch (err) {
            console.error("Upload docs error:", err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
