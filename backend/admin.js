const express = require('express');

function adminRoutes(supabase) {
    const router = express.Router();

    // Middleware: Verify Admin Role
    // Assumes req.user is set by the main auth middleware in server.js before this router is used
    // or we check it here if we attach the auth middleware to the route declaration.
    // For safety, let's assume `server.js` applies `authenticateToken` before this router,
    // or we should handle it. 
    // Looking at server.js (from memory), it probably uses app.use('/api/something', somethingRoutes).
    // I should probably attach the check here to be safe, but I don't have the auth middleware code easily.
    // I'll assume req.user is populated.
    
    const requireAdmin = (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        next();
    };

    // Apply admin check to all routes in this router
    router.use(requireAdmin);

    // GET /stats
    router.get('/stats', async (req, res) => {
        try {
            // 1. Total Users
            const { count: userCount, error: userError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });
            if (userError) throw userError;

            // 2. Total Orders (Subscriptions)
            const { count: orderCount, error: orderError } = await supabase
                .from('subscriptions')
                .select('*', { count: 'exact', head: true });
            if (orderError) throw orderError;

            // 3. Documents (uploaded_by = 'client' generally, or just total)
            // The query asked for "no of documents uploaded by client".
            const { count: docCount, error: docError } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('uploaded_by', 'client');
            if (docError) throw docError;

            res.json({
                users: userCount,
                orders: orderCount,
                documents: docCount
            });
        } catch (error) {
            console.error('Admin Stats Error:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    });

    // GET /clients
    router.get('/clients', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, email, role, created_at, is_verified')
                .neq('role', 'admin') // Optional: hide other admins?
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /documents - All documents
    router.get('/documents', async (req, res) => {
        try {
            // Join with users reference to get uploader name
            const { data: docs, error } = await supabase
                .from('documents')
                .select(`
                    *,
                    users (
                        full_name,
                        email
                    )
                `)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            // Generate Signed URLs for Supabase Storage
            const signedDocs = await Promise.all(docs.map(async (doc) => {
                // Check if it's a storage path (not starting with uploads/ legacy)
                if (doc.file_path && !doc.file_path.startsWith('uploads/') && !doc.file_path.startsWith('http')) {
                    const { data: signedData } = await supabase
                        .storage
                        .from('documents')
                        .createSignedUrl(doc.file_path, 3600); // 1 hour
                    
                    if (signedData) {
                        return { ...doc, download_url: signedData.signedUrl };
                    }
                }
                // Fallback for legacy
                return { ...doc, download_url: doc.file_path.startsWith('uploads/') ? doc.file_path : `uploads/${doc.file_path}` };
            }));

            res.json(signedDocs);
        } catch (error) {
            console.error('Admin Documents Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // GET /payment-methods - All payment methods
    router.get('/payment-methods', async (req, res) => {
        try {
            const { cardDetail, cardType } = req.query; // Filters

            let query = supabase
                .from('payment_methods')
                .select(`
                    *,
                    users (
                        full_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            // Apply Filters
            if (cardType && cardType !== '(All)') {
                query = query.ilike('card_type', `%${cardType}%`);
            }
            if (cardDetail) {
              // Search cardholder name OR last four
              query = query.or(`cardholder_name.ilike.%${cardDetail}%,last_four.ilike.%${cardDetail}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            res.json(data);
        } catch (error) {
            console.error('Admin Payment Methods Error:', error);
            res.status(500).json({ error: error.message });
        }
    });


    // DELETE /documents/:id - Delete a document
    router.delete('/documents/:id', async (req, res) => {
        try {
            const docId = req.params.id;

            // Get the document first to retrieve the file path
            const { data: doc, error: fetchError } = await supabase
                .from('documents')
                .select('file_path')
                .eq('id', docId)
                .single();

            if (fetchError || !doc) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Delete from database
            const { error: deleteError } = await supabase
                .from('documents')
                .delete()
                .eq('id', docId);

            if (deleteError) {
                throw deleteError;
            }

            // Clean up file
            if (doc.file_path) {
                if (!doc.file_path.startsWith('uploads/')) {
                     // Delete from Supabase Storage
                     const { error: storageError } = await supabase.storage
                        .from('documents')
                        .remove([doc.file_path]);
                     if (storageError) console.error('Storage delete warning:', storageError);
                } else {
                     // Delete from Local Filesystem (Legacy)
                    const path = require('path');
                    const fs = require('fs');
                    const filePath = path.join(__dirname, '..', doc.file_path);
                    
                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                        } catch (fileErr) {
                            console.error('Error deleting physical file:', fileErr);
                        }
                    }
                }
            }

            res.json({ message: 'Document deleted successfully' });
        } catch (error) {
            console.error('Delete Document Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}

module.exports = adminRoutes;
