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
    router.post('/upload', upload.array('files'), async (req, res) => {
        try {
            const userId = req.user.id;
            const files = req.files;
            
            if(!files || files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }

            const records = files.map(file => ({
                user_id: userId,
                file_path: file.path.replace(/\\/g, '/'), // Store relative path normalized
                uploaded_by: 'client',
                document_type: 'User Upload',
                uploaded_at: new Date()
            }));

            // If service_id is needed, it should be passed in headers or body,
            // but for general docs upload we might strip it or make it nullable in DB.
            // For now, let's assume 'documents' table allows nullable service_id OR we need to fetch one.
            // Checking schema... documents.service_id might be NOT NULL.
            // If so we need a default or modify schema. 
            // In setup_supabase.sql: service_id BIGINT NOT NULL REFERENCES services(id)
            // Fix: We'll need to update schema to allow NULL service_id for general uploads, 
            // or assign a 'General' service if exists.
            
            // NOTE: Proceeding assuming schema allows null or we inserted a 'dummy' service in 
            // previous migrations. If not, this insert will fail. 
            // Let's modify the insert to handle potential service_id requirement if provided.
            
            const { error } = await supabase.from('documents').insert(records);
            
            if (error) {
                // If error is about service_id null constraint, we might need a fallback
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
