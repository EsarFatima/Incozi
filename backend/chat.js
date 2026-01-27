const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

    // 1. Get or Create Chat Session for current user
    router.post('/session', async (req, res) => { // User is already in req.user from middleware
        try {
            const userId = req.user.id; // Using req.user.id

            // Check for an existing open session
            const { data: existingSession, error: fetchError } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'open')
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
                throw fetchError;
            }

            if (existingSession) {
                return res.json(existingSession);
            }

            // Create new session
            const { data: newSession, error: createError } = await supabase
                .from('chat_sessions')
                .insert([{ user_id: userId, status: 'open' }])
                .select()
                .single();

            if (createError) throw createError;

            return res.json(newSession);

        } catch (err) {
            console.error('Error in /session:', err);
            res.status(500).json({ error: 'Failed to initialize chat session' });
        }
    });

    // 2. Get Messages for a Session
    router.get('/session/:sessionId/messages', async (req, res) => {
        try {
            const { sessionId } = req.params;
            const userId = req.user.id; // req.user.id

            // Verify ownership or admin
            // Fetch session to check owner
            const { data: session, error: sessionError } = await supabase
                .from('chat_sessions')
                .select('user_id')
                .eq('id', sessionId)
                .single();
            
            if (sessionError) throw sessionError;

            if (session.user_id != userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const { data: messages, error } = await supabase
                .from('chat_messages')
                .select('*, users(full_name, role)') 
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            res.json(messages);

        } catch (err) {
            console.error('Error fetching messages:', err);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });

    // 3. Send Message
    router.post('/message', async (req, res) => {
        try {
            const { sessionId, message } = req.body;
            const senderId = req.user.id;

            if (!message || !sessionId) {
                return res.status(400).json({ error: 'Missing sessionId or message' });
            }

            // Verify access to session
            const { data: session, error: sessionError } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (sessionError) throw sessionError;

            if (session.user_id != senderId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Insert message
            const { data: newMessage, error: insertError } = await supabase
                .from('chat_messages')
                .insert([{
                    session_id: sessionId,
                    sender_id: senderId,
                    message: message
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            // Update session timestamp
            await supabase
                .from('chat_sessions')
                .update({ updated_at: new Date() })
                .eq('id', sessionId);

            res.json(newMessage);

        } catch (err) {
            console.error('Error sending message:', err);
            res.status(500).json({ error: 'Failed to send message' });
        }
    });

    // --- ADMIN ROUTES ---

    // 4. Get All Open Sessions (Admin)
    router.get('/admin/sessions', async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const { data: sessions, error } = await supabase
                .from('chat_sessions')
                .select('*, users(full_name, email)')
                .eq('status', 'open')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            res.json(sessions);
        } catch (err) {
            console.error('Error admin sessions:', err);
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    });

    // 5. Delete Message (Unsend)
    router.delete('/message/:messageId', async (req, res) => {
        try {
            const { messageId } = req.params;
            const userId = req.user.id;

            // Check if message exists
            const { data: msg, error: fetchError } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('id', messageId)
                .single();

            if (fetchError) throw fetchError;
            if (!msg) return res.status(404).json({ error: 'Message not found' });

            // Only sender or admin can delete
            if (msg.sender_id != userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Delete
            // Restriction 1: Time limit (1 minute)
            const createdTime = new Date(msg.created_at).getTime();
            const now = Date.now();
            if (req.user.role !== 'admin' && (now - createdTime > 60000)) {
                return res.status(403).json({ error: 'Message cannot be deleted after 1 minute' });
            }

            // Restriction 2: Seen by other side
            // We assume 'is_read' flag is managed.
            if (req.user.role !== 'admin' && msg.is_read) {
                 return res.status(403).json({ error: 'Message cannot be deleted after being seen' });
            }

            const { error: deleteError } = await supabase
                .from('chat_messages')
                .delete()
                .eq('id', messageId);

            if (deleteError) throw deleteError;

            res.json({ success: true });
        } catch (err) {
            console.error('Error deleting message:', err);
            res.status(500).json({ error: 'Failed to delete message' });
        }
    });

    return router;
};
