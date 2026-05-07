const express = require('express');
const router = express.Router();
const multer = require('multer');
const emailService = require('./emailService');

// Configure Multer for File Uploads (Memory Storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

            // Generate Signed URLs for Supabase Storage
            const signedDocs = await Promise.all(data.map(async (doc) => {
                if (doc.file_path && !doc.file_path.startsWith('uploads/') && !doc.file_path.startsWith('http')) {
                    const { data: signedData } = await supabase
                        .storage
                        .from('documents')
                        .createSignedUrl(doc.file_path, 3600); // 1 hour
                    
                    if (signedData) {
                        return { ...doc, download_url: signedData.signedUrl };
                    }
                }
                // Fallback for legacy local files
                const fallback = doc.file_path.startsWith('uploads/') ? doc.file_path : `assets/uploads/${doc.file_path}`;
                return { ...doc, download_url: fallback };
            }));

            res.json(signedDocs);
        } catch (err) {
            console.error("Fetch docs error:", err);
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /api/documents/upload
     * Upload a new document
     */
    router.post('/upload', upload.array('documents', 10), async (req, res) => {
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

            const uploadedFiles = [];
            const fileNames = [];
            const errors = [];

            for (const file of files) {
                // Sanitize filename
                const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
                const uniqueName = `${Date.now()}-${cleanName}`;
                const filePath = `user_uploads/${userId}/${uniqueName}`;

                // Upload to Supabase Storage 'documents' bucket
                const { error: storageError } = await supabase
                    .storage
                    .from('documents')
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });

                if (storageError) {
                     console.error('Storage Upload Error:', storageError);
                     errors.push(file.originalname + ': ' + storageError.message);
                     continue;
                }
                
                const insertPayload = {
                    user_id: userId,
                    file_path: filePath,
                    document_type: file.mimetype,
                    uploaded_by: 'client'
                };
                
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
            
            if (user && fileNames.length > 0) {
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

        } catch (err) {
            console.error("Upload docs error:", err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
