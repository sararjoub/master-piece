

document.addEventListener('DOMContentLoaded', () => {

    // 1. عناصر الصفحة
    let conversationItems = document.querySelectorAll('.conversation-item');
    let chatMessages = document.getElementById('chatMessages');
    let messageInput = document.getElementById('messageInput');
    let sendBtn = document.getElementById('sendBtn');
    let typingIndicator = document.getElementById('typingIndicator');
    let chatSearchInput = document.getElementById('chatSearchInput');
    let newChatBtn = document.getElementById('newChatBtn');

    // 2. التبديل بين المحادثات
    conversationItems.forEach(item => {
        item.addEventListener('click', () => {
            // إزالة active من الجميع
            conversationItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // تحديث رأس المحادثة
            let name = item.querySelector('.conversation-top strong').textContent;
            let avatar = item.querySelector('.conversation-avatar span').textContent;
            let isOnline = item.querySelector('.online-dot') !== null;

            updateChatHeader(name, avatar, isOnline);

            // إخفاء Unread Badge
            let badge = item.querySelector('.unread-badge');
            if (badge) badge.remove();

            // محاكاة تحميل الرسائل
            showNotification(`Opening chat with ${name}...`, 'info');

            // تأثير ظهور الرسائل
            let messages = chatMessages.querySelectorAll('.message');
            messages.forEach((msg, index) => {
                msg.style.opacity = '0';
                msg.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    msg.style.transition = 'all 0.3s ease';
                    msg.style.opacity = '1';
                    msg.style.transform = 'translateY(0)';
                }, index * 80);
            });
        });
    });

    // 3. تحديث رأس المحادثة
    function updateChatHeader(name, avatar, isOnline) {
        let headerName = document.querySelector('.chat-header-info strong');
        let headerAvatar = document.querySelector('.chat-header-avatar span:first-child');
        let headerStatus = document.querySelector('.chat-status');

        if (headerName) headerName.textContent = name;
        if (headerAvatar) headerAvatar.textContent = avatar;

        if (headerStatus) {
            if (isOnline) {
                headerStatus.innerHTML = '<span class="status-dot-inline"></span> Online';
                headerStatus.style.color = 'var(--success)';
            } else {
                headerStatus.textContent = 'Offline';
                headerStatus.style.color = 'var(--text-light)';
            }
        }
    }

    // 4. إرسال الرسائل

    function sendMessage() {
        let text = messageInput.value.trim();
        if (!text) return;

        // إنشاء رسالة جديدة
        let message = document.createElement('div');
        message.className = 'message sent animate-fade-rise';
        message.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(text)}</div>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
        `;

        chatMessages.appendChild(message);
        messageInput.value = '';
        scrollToBottom();

        // محاكاة رد من الطرف الآخر
        simulateReply();
    }

    // عند الضغط على زر الإرسال
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // عند الضغط على Enter
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // 5. محاكاة الرد (Typing + Reply)
    function simulateReply() {
        // إظهار مؤشر الكتابة
        setTimeout(() => {
            if (typingIndicator) {
                typingIndicator.classList.remove('hidden');
                scrollToBottom();
            }
        }, 500);

        // إخفاء المؤشر وإضافة رد
        setTimeout(() => {
            if (typingIndicator) typingIndicator.classList.add('hidden');

            let replies = [
                "That sounds great! 👍",
                "Sure, I'll let you know.",
                "Perfect, see you then!",
                "Thanks for the update!",
                "I'll prepare some materials for our session."
            ];
            let randomReply = replies[Math.floor(Math.random() * replies.length)];

            let activeConv = document.querySelector('.conversation-item.active');
            let avatar = activeConv ? activeConv.querySelector('.conversation-avatar span').textContent : 'LK';

            let message = document.createElement('div');
            message.className = 'message received animate-fade-rise';
            message.innerHTML = `
                <div class="message-avatar"><span>${avatar}</span></div>
                <div class="message-content">
                    <div class="message-bubble">${randomReply}</div>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
            `;

            chatMessages.appendChild(message);
            scrollToBottom();
        }, 2500);
    }

    // 6. Scroll للأسفل
    function scrollToBottom() {
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    // Scroll عند فتح الصفحة
    scrollToBottom();

    // 7. الحصول على الوقت الحالي
    function getCurrentTime() {
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let period = hours >= 12 ? 'PM' : 'AM';
        let displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${period}`;
    }

    
    // 8. حماية من XSS
    
    function escapeHtml(text) {
        let div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 9. بحث المحادثات
    if (chatSearchInput) {
        chatSearchInput.addEventListener('input', () => {
            let query = chatSearchInput.value.toLowerCase().trim();
            conversationItems.forEach(item => {
                let name = item.querySelector('.conversation-top strong').textContent.toLowerCase();
                let preview = item.querySelector('.conversation-preview').textContent.toLowerCase();
                
                if (name.includes(query) || preview.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // 10. زر "New Chat"
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            showNotification('Opening new chat...', 'info');
            setTimeout(() => {
                window.location.href = 'skill-partners.html';
            }, 700);
        });
    }

    // 11. أزرار رأس المحادثة
    let headerIconBtns = document.querySelectorAll('.chat-header-actions .chat-icon-btn');
    headerIconBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            let title = btn.getAttribute('title');
            showNotification(`${title} coming soon...`, 'info');
        });
    });

    // 12. دالة التنبيهات

    function showNotification(message, type = 'info') {
        let oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();

        let notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span class="notification-message">${message}</span>
        `;

        document.body.appendChild(notification);
    
    }
});