(function() {
    // Create and inject styles
    const styles = `
        .ec-chatbot {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .ec-chatbot * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .ec-chat-icon {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #ff4444;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
            transition: all 0.3s ease;
            position: relative;
        }

        .ec-chat-icon:hover {
            transform: scale(1.1);
        }

        /* Medical Cross */
        .medical-cross {
            position: absolute;
            width: 24px;
            height: 24px;
            background: white;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .medical-cross::before,
        .medical-cross::after {
            content: '';
            position: absolute;
            background: #ff4444;
        }

        .medical-cross::before {
            width: 16px;
            height: 4px;
            top: 10px;
            left: 4px;
        }

        .medical-cross::after {
            width: 4px;
            height: 16px;
            top: 4px;
            left: 10px;
        }

        /* Loading Animation */
        .ec-loading {
            display: none;
            margin: 10px 0;
        }

        .ec-loading.show {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }

        .ec-loading-dot {
            width: 8px;
            height: 8px;
            background: #ff4444;
            border-radius: 50%;
            animation: pulse 1.5s infinite ease-in-out;
        }

        .ec-loading-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .ec-loading-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(0.3);
                opacity: 0.3;
            }
            50% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .ec-chatbot {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .ec-chatbot * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .ec-chat-icon {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(45deg, #ff4444, #ff6b6b);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
            transition: all 0.3s ease;
        }

        .ec-chat-icon:hover {
            transform: scale(1.1);
        }

        .ec-chat-box {
            display: none;
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 400px;
            height: 600px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }

        .ec-chat-box.show {
            display: block;
        }

        .ec-chat-header {
            background: linear-gradient(45deg, #ff4444, #ff6b6b);
            color: white;
            padding: 20px;
            font-size: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .ec-messages {
            height: 450px;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .ec-message {
            margin-bottom: 20px;
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 20px;
            font-size: 15px;
            line-height: 1.4;
        }

        .ec-bot-message {
            background: white;
            margin-right: auto;
            border-bottom-left-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .ec-user-message {
            background: linear-gradient(45deg, #ff4444, #ff6b6b);
            color: white;
            margin-left: auto;
            border-bottom-right-radius: 5px;
        }

        .ec-input-area {
            display: flex;
            padding: 20px;
            background: white;
            border-top: 1px solid #eee;
        }

        .ec-input {
            flex: 1;
            padding: 12px 20px;
            border: 2px solid #eee;
            border-radius: 25px;
            margin-right: 10px;
            font-size: 15px;
            outline: none;
        }

        .ec-send-btn {
            background: linear-gradient(45deg, #ff4444, #ff6b6b);
            color: white;
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .ec-send-btn:hover {
            transform: scale(1.1);
        }

        
    
        [Previous CSS remains the same...]
    `;

    


    // Updated chatbot HTML
    const chatbotHTML = `
        <div class="ec-chatbot">
            <div class="ec-chat-icon" id="ec-toggle-chat">
                <div class="medical-cross"></div>
            </div>
            <div class="ec-chat-box" id="ec-chat-box">
                <div class="ec-chat-header">
                    <span>Medical Assistant</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer;" id="ec-minimize">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
                <div class="ec-messages" id="ec-messages"></div>
                <div class="ec-loading" id="ec-loading">
                    <div class="ec-loading-dot"></div>
                    <div class="ec-loading-dot"></div>
                    <div class="ec-loading-dot"></div>
                </div>
                <div class="ec-input-area">
                    <input type="text" class="ec-input" id="ec-input" placeholder="Describe your medical concern...">
                    <button class="ec-send-btn" id="ec-send">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Modified initChatbot function
    function initChatbot() {
        // [Previous variable declarations remain the same...]
        const loadingIndicator = document.getElementById('ec-loading');

        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, true);
            input.value = '';
            
            // Show loading animation
            loadingIndicator.classList.add('show');

            try {
                const response = await fetch('http://localhost:5000/emergency', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: text })
                });

                const data = await response.json();
                addMessage(data.response, false);
            } catch (error) {
                addMessage('Sorry, I\'m having trouble connecting to the server.', false);
            } finally {
                // Hide loading animation
                loadingIndicator.classList.remove('show');
            }
        }

        // [Rest of the event listeners remain the same...]
    }

    // [Rest of the initialization code remains the same...]
})();