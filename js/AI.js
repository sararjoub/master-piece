/* ============================================
   ===== AI ASSISTANT PAGE - JavaScript =====
   ===== أنيميشن + تفاعل فقط =====
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. عناصر الصفحة
    // ============================================
    const chatMessages = document.getElementById('aiChatMessages');
    const chatInput = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiSendBtn');
    const typingIndicator = document.getElementById('aiTyping');
    const quickSuggestions = document.getElementById('aiQuickSuggestions');
    const startChatBtn = document.getElementById('startChatBtn');
    const suggestionChips = document.querySelectorAll('.ai-suggestion-chip');
    const actionCards = document.querySelectorAll('.ai-action-card');

    // ============================================
    // 2. Scroll للأسفل
    // ============================================
    function scrollToBottom() {
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }

    // ============================================
    // 3. الحصول على الوقت الحالي
    // ============================================
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${period}`;
    }

    // ============================================
    // 4. حماية XSS
    // ============================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // 5. إضافة رسالة المستخدم
    // ============================================
    function addUserMessage(text) {
        const message = document.createElement('div');
        message.className = 'ai-message ai-message-sent';
        message.innerHTML = `
            <div class="ai-message-content">
                <div class="ai-message-bubble">
                    <p>${escapeHtml(text)}</p>
                </div>
                <span class="ai-message-time">${getCurrentTime()}</span>
            </div>
        `;
        chatMessages.appendChild(message);
        scrollToBottom();
    }

    // ============================================
    // 6. إضافة رد AI
    // ============================================
    function addAIMessage(text) {
        const message = document.createElement('div');
        message.className = 'ai-message ai-message-received';
        message.innerHTML = `
            <div class="ai-message-avatar"><span>✨</span></div>
            <div class="ai-message-content">
                <div class="ai-message-bubble">
                    <p>${text}</p>
                </div>
                <span class="ai-message-time">${getCurrentTime()}</span>
            </div>
        `;
        chatMessages.appendChild(message);
        scrollToBottom();
    }

    // ============================================
    // 7. محاكاة رد AI (Placeholder)
    // ============================================
    function simulateAIReply(userMessage) {
        // إظهار مؤشر الكتابة
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }

        // توليد رد مناسب
        let replyText = '';

        const lowerMsg = userMessage.toLowerCase();

        if (lowerMsg.includes('career') || lowerMsg.includes('path')) {
            replyText = `Based on your profile, I recommend the <strong>Full Stack Web Developer</strong> path! 🎯<br><br>You already have skills in:<br>• HTML & CSS<br>• JavaScript basics<br><br>Next steps:<br>1. Master <strong>React</strong><br>2. Learn <strong>Node.js</strong><br>3. Build a full project`;
        } else if (lowerMsg.includes('partner') || lowerMsg.includes('match')) {
            replyText = `I found <strong>3 perfect partners</strong> for you! 👥<br><br>Best match: <strong>Lana Khalid</strong> (95% match)<br>• Teaches: Web Development<br>• Wants: UI/UX Design<br>• Available: Weekends<br><br>Would you like me to send her a request?`;
        } else if (lowerMsg.includes('learn') || lowerMsg.includes('skill') || lowerMsg.includes('recommend')) {
            replyText = `Based on your learning patterns, here are my recommendations 📚<br><br><strong>Top 3 skills for you:</strong><br>1. TypeScript ⭐ 92% match<br>2. Node.js ⭐ 88% match<br>3. MongoDB ⭐ 85% match<br><br>These align with your Web Developer path!`;
        } else if (lowerMsg.includes('progress') || lowerMsg.includes('analyz')) {
            replyText = `Here's your progress analysis 📊<br><br>• Learning velocity: <strong>78% efficiency</strong> ↑15%<br>• Career path: <strong>65% complete</strong><br>• Skill mastery: <strong>85%</strong> ↑22%<br>• Most active: <strong>Weekends</strong><br><br>Great job! Keep the momentum going! 🚀`;
        } else {
            replyText = `Great question! ✨<br><br>Based on your profile as a <strong>Web Developer</strong> with interests in design, I suggest:<br><br>• Focus on your current career path<br>• Connect with partners for UI/UX<br>• Learn advanced JavaScript patterns<br><br>Want me to dive deeper into any of these?`;
        }

        // إخفاء المؤشر وإضافة الرد
        setTimeout(() => {
            if (typingIndicator) typingIndicator.classList.add('hidden');
            addAIMessage(replyText);
        }, 1800);
    }

    // ============================================
    // 8. إرسال رسالة
    // ============================================
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addUserMessage(text);
        chatInput.value = '';

        // محاكاة رد AI
        simulateAIReply(text);
    }

    // ============================================
    // 9. ربط الأزرار
    // ============================================
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // ============================================
    // 10. زر "Start Chatting"
    // ============================================
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            document.getElementById('ai-chat').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });

            setTimeout(() => {
                if (chatInput) chatInput.focus();
            }, 800);
        });
    }

    // ============================================
    // 11. Quick Suggestions
    // ============================================
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const suggestion = chip.dataset.suggestion;
            if (suggestion) {
                // إضافة الرسالة
                addUserMessage(suggestion);

                // إخفاء الاقتراحات
                if (quickSuggestions) {
                    quickSuggestions.style.opacity = '0.3';
                    quickSuggestions.style.pointerEvents = 'none';
                }

                // محاكاة الرد
                simulateAIReply(suggestion);
            }
        });
    });

    // ============================================
    // 12. Action Cards (فتح Modal أو التنقل)
    // ============================================
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;

            const actionMessages = {
                'career': 'Show me the best career path for me',
                'partner': 'Find me the best skill partners',
                'skills': 'What skills should I learn next?',
                'progress': 'Analyze my learning progress'
            };

            const message = actionMessages[action];
            if (message) {
                // Scroll للـ Chat
                document.getElementById('ai-chat').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });

                // إضافة الرسالة بعد Scroll
                setTimeout(() => {
                    addUserMessage(message);
                    simulateAIReply(message);

                    if (quickSuggestions) {
                        quickSuggestions.style.opacity = '0.3';
                        quickSuggestions.style.pointerEvents = 'none';
                    }
                }, 800);
            }
        });
    });

    // ============================================
    // 13. Insights Bars Animation
    // ============================================
    const insightFills = document.querySelectorAll('.ai-insight-fill');

    const insightsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.dataset.width;
                setTimeout(() => {
                    fill.style.width = targetWidth;
                }, 200);
                insightsObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.3 });

    insightFills.forEach(fill => insightsObserver.observe(fill));

    // ============================================
    // 14. Scroll للأسفل عند التحميل
    // ============================================
    scrollToBottom();

});