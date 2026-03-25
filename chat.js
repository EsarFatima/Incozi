(function() {
    // Check if chat widget already exists
    if (document.querySelector('.chat-widget')) return;

    // --- HTML STRUCTURE ---
    const html = `
        <div class='chat-widget'>
            <button class='chat-toggle' aria-label='Open Chat'>
                <i class='fa-regular fa-comment-dots'></i>
            </button>
        </div>
        <div class='chat-window'>
            <div class='chat-header'>
                <span>Incozi Support</span>
                <button class='chat-close'><i class='fa-solid fa-xmark'></i></button>
            </div>
            <div class='chat-body' id='chat-messages'>
                <!-- Messages will appear here -->
                <div class='chat-msg system'>Connecting...</div>
            </div>
            <div class='chat-input-area'>
                <input type='text' class='chat-input' placeholder='Type a message...' />
                <button class='chat-send-btn'><i class='fa-solid fa-paper-plane'></i></button>
            </div>
        </div>
    `;

    // Create wrapper and inject
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    // Elements
    const widget = document.querySelector('.chat-widget');
    const toggleBtn = document.querySelector('.chat-toggle');
    const chatWindow = document.querySelector('.chat-window');
    const closeBtn = document.querySelector('.chat-close');
    const msgContainer = document.getElementById('chat-messages');
    const input = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.chat-send-btn');

    // State
    let sessionId = null;
    let pollInterval = null;
    let isOpen = false;
    let userId = null;

    // --- LOGIC ---

    // Scroll Visibility
    function handleScroll() {
        if (window.scrollY > 50) widget.classList.add('visible');
        else widget.classList.remove('visible');
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Toggle Chat
    toggleBtn.addEventListener('click', () => {
        if(!isOpen) openChat();
        else closeChat();
    });
    closeBtn.addEventListener('click', closeChat);

    function closeChat() {
        isOpen = false;
        chatWindow.classList.remove('open');
        if(pollInterval) clearInterval(pollInterval);
    }

    async function openChat() {
        isOpen = true;
        chatWindow.classList.add('open');
        
        // Check Auth using localStorage (same key as rest of app: incozi_token or incozi_user)
        const token = localStorage.getItem('incozi_token');
        const userStr = localStorage.getItem('incozi_user');

        if(!token || !userStr) {
            msgContainer.innerHTML = '<div class="chat-msg system">Please log in to chat with support. <br><a href="/pages/account.html" style="color:blue;">Login here</a></div>';
            return;
        }
        
        const user = JSON.parse(userStr);
        userId = user.id;

        // Initialize Session
        if(!sessionId) {
            msgContainer.innerHTML = '<div class="chat-msg system">Connecting to support...</div>';
            try {
                const res = await fetch('/api/chat/session', {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if(!res.ok) throw new Error('Failed to start session');
                
                const session = await res.json();
                sessionId = session.id;
                
                loadMessages();
                // Start polling
                pollInterval = setInterval(loadMessages, 3000);

            } catch (err) {
                console.error(err);
                msgContainer.innerHTML = '<div class="chat-msg system">Error connecting. <br>Please refresh or try logging in again.</div>';
            }
        } else {
             loadMessages();
             pollInterval = setInterval(loadMessages, 3000);
        }
    }

    async function loadMessages() {
        if(!sessionId) return;
        const token = localStorage.getItem('incozi_token');
        
        try {
            const res = await fetch(`/api/chat/session/${sessionId}/messages`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const msgs = await res.json();
            renderMessages(msgs);
        } catch(e) { console.error(e); }
    }

    function renderMessages(msgs) {
        msgContainer.innerHTML = ''; 
        
        if(msgs.length === 0) {
            msgContainer.innerHTML = '<div class="chat-msg system">Start a conversation with us!</div>';
            return;
        }

        let lastDate = null;
        const todayStr = new Date().toDateString();

        msgs.forEach(m => {
            const date = new Date(m.created_at);
            const dateStr = date.toDateString();

            // Insert Date Separator if new day
            if (dateStr !== lastDate) {
                const sep = document.createElement('div');
                sep.className = 'chat-date-separator';
                let label = date.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'});
                if (dateStr === todayStr) label = 'Today';
                
                sep.innerHTML = `<span>${label}</span>`;
                msgContainer.appendChild(sep);
                lastDate = dateStr;
            }

            const div = document.createElement('div');
            // Determine if user or admin sender
            const type = (m.sender_id == userId) ? 'user' : 'admin';
            div.className = `chat-msg ${type} msg-bubble`; 
            div.style.position = 'relative'; // Ensure positioning context

            // Only Time
            const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            div.innerHTML = `${m.message} <span class="msg-time">${timeStr}</span>`;

            // Add Delete Button for User's own messages
            if (type === 'user') {
                const delBtn = document.createElement('button');
                delBtn.className = 'msg-delete-btn';
                delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                delBtn.title = 'Unsend message';
                delBtn.onclick = (e) => unsendMessage(m.id, e);
                div.appendChild(delBtn);
            }

            msgContainer.appendChild(div);
        });

        // Scroll to bottom
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
    
    // Unsend Message
    async function unsendMessage(msgId, event) {
        event.stopPropagation(); // prevent bubbling
        if(!confirm('Unsend this message?')) return;

        const token = localStorage.getItem('incozi_token');
        try {
            const res = await fetch(`/api/chat/message/${msgId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if(res.ok) {
                // If successful, remove from DOM or reload
                // loadMessages() will eventually clear it, but instant UI feedback is better
                event.target.closest('.chat-msg').remove();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete message.');
            }
        } catch(e) { console.error(e); }
    }

    // Send Message
    async function sendMessage() {
        const text = input.value.trim();
        if(!text || !sessionId) return;

        input.value = ''; // clear early
        const token = localStorage.getItem('incozi_token');
        
        // Optimistic UI for immediate feedback
        const tempDiv = document.createElement('div');
        tempDiv.className = 'chat-msg user';
        tempDiv.style.opacity = '0.5';
        const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        tempDiv.innerHTML = `${text} <span class="msg-time">${now}</span>`;
        msgContainer.appendChild(tempDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
        
        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId, message: text })
            });
            
            if(res.ok) {
                loadMessages(); // Refresh immediately
            }
        } catch(err) {
            console.error(err);
            tempDiv.innerHTML += ' (Failed)';
            tempDiv.style.color = 'red';
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendMessage();
    });

})();
