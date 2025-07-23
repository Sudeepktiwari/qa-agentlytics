import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const auth = await verifyApiKey(apiKey);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Generate the embeddable widget JavaScript
  const widgetScript = `
(function() {
  // Chatbot Widget Implementation
  const CHATBOT_API_BASE = '${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }';
  const API_KEY = '${apiKey}';
  const ADMIN_ID = '${auth.adminId}';
  
  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'appointy-chatbot-widget';
  widgetContainer.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    height: 500px;
    border: 1px solid #ccc;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: none;
    flex-direction: column;
  \`;
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'appointy-chatbot-toggle';
  toggleButton.innerHTML = '💬';
  toggleButton.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 50%;
    background: #0070f3;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
  \`;
  
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.transform = 'scale(1.1)';
  });
  
  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.transform = 'scale(1)';
  });
  
  let isOpen = false;
  let sessionId = localStorage.getItem('appointy_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('appointy_session_id', sessionId);
  }
  
  let followupTimer = null;
  let followupCount = 0;
  let followupSent = false;
  let lastUserAction = Date.now();
  let userIsActive = false;
  
  // Messages array
  let messages = [];
  
  // Create widget HTML
  function createWidgetHTML() {
    return \`
      <div style="display: flex; flex-direction: column; height: 100%; background: white; border-radius: 12px; overflow: hidden;">
        <div style="background: #0070f3; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 16px;">Chat with us</h3>
          <button id="appointy-close-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
        </div>
        <div id="appointy-messages" style="flex: 1; padding: 15px; overflow-y: auto; max-height: 350px;">
          <div style="color: #666; font-size: 14px;">Loading...</div>
        </div>
        <div style="padding: 15px; border-top: 1px solid #eee;">
          <div style="display: flex; gap: 8px;">
            <input 
              id="appointy-input" 
              type="text" 
              placeholder="Type your message..." 
              style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none;"
            />
            <button 
              id="appointy-send-btn" 
              style="background: #0070f3; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    \`;
  }
  
  // Clear followup timer
  function clearFollowupTimer() {
    if (followupTimer) {
      clearTimeout(followupTimer);
      followupTimer = null;
    }
    followupSent = false;
  }
  
  // Reset user activity
  function resetUserActivity() {
    clearFollowupTimer();
    userIsActive = false;
    lastUserAction = Date.now();
    followupCount = 0;
  }
  
  // Set user as active
  function setUserActive() {
    userIsActive = true;
    lastUserAction = Date.now();
  }
  
  // Start followup timer
  function startFollowupTimer() {
    clearFollowupTimer();
    followupTimer = setTimeout(() => {
      const timeSinceLastAction = Date.now() - lastUserAction;
      if (!userIsActive && timeSinceLastAction >= 25000 && followupCount < 3) {
        sendFollowupMessage();
      }
    }, 30000); // 30 seconds
  }
  
  // Send API request
  async function sendApiRequest(endpoint, data) {
    try {
      const response = await fetch(\`\${CHATBOT_API_BASE}/api/\${endpoint}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Chatbot API error:', error);
      return { error: 'Connection failed' };
    }
  }
  
  // Send followup message
  async function sendFollowupMessage() {
    const currentUrl = window.location.href;
    const data = await sendApiRequest('chat', {
      sessionId,
      pageUrl: currentUrl,
      followup: true,
      followupCount,
      adminId: ADMIN_ID
    });
    
    if (data.mainText || data.answer) {
      const botMessage = {
        role: 'assistant',
        content: data.mainText || data.answer,
        buttons: data.buttons || [],
        emailPrompt: data.emailPrompt || ''
      };
      messages.push(botMessage);
      renderMessages();
      followupCount++;
      startFollowupTimer();
    }
    followupSent = false;
  }
  
  // Send message
  async function sendMessage(text) {
    if (!text.trim()) return;
    
    resetUserActivity();
    
    // Add user message
    const userMessage = { role: 'user', content: text };
    messages.push(userMessage);
    renderMessages();
    
    // Clear input
    const input = document.getElementById('appointy-input');
    if (input) input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to API
    const currentUrl = window.location.href;
    const data = await sendApiRequest('chat', {
      question: text,
      sessionId,
      pageUrl: currentUrl,
      adminId: ADMIN_ID
    });
    
    // Hide typing indicator
    hideTypingIndicator();
    
    if (data.error) {
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
      messages.push(errorMessage);
    } else {
      const botMessage = {
        role: 'assistant',
        content: data.mainText || data.answer || 'I received your message.',
        buttons: data.buttons || [],
        emailPrompt: data.emailPrompt || ''
      };
      messages.push(botMessage);
      startFollowupTimer();
    }
    
    renderMessages();
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const messagesContainer = document.getElementById('appointy-messages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'appointy-typing';
    typingDiv.style.cssText = 'color: #666; font-style: italic; margin: 8px 0;';
    typingDiv.textContent = 'Typing...';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Hide typing indicator
  function hideTypingIndicator() {
    const typing = document.getElementById('appointy-typing');
    if (typing) typing.remove();
  }
  
  // Render messages
  function renderMessages() {
    const messagesContainer = document.getElementById('appointy-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    messages.forEach((msg) => {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = \`
        margin: 12px 0;
        padding: 10px;
        border-radius: 8px;
        \${msg.role === 'user' 
          ? 'background: #0070f3; color: white; margin-left: 20%; text-align: right;' 
          : 'background: #f5f5f5; color: #333; margin-right: 20%;'
        }
      \`;
      
      if (msg.role === 'assistant') {
        // Bot message with potential buttons and email prompt
        const contentDiv = document.createElement('div');
        contentDiv.textContent = msg.content;
        messageDiv.appendChild(contentDiv);
        
        // Add buttons if present and no email prompt
        if (msg.buttons && msg.buttons.length > 0 && (!msg.emailPrompt || !msg.emailPrompt.trim())) {
          const buttonsDiv = document.createElement('div');
          buttonsDiv.style.cssText = 'margin-top: 10px;';
          
          msg.buttons.forEach((buttonText) => {
            const button = document.createElement('button');
            button.textContent = buttonText;
            button.style.cssText = \`
              background: #0070f3;
              color: white;
              border: none;
              padding: 6px 12px;
              margin: 4px 4px 4px 0;
              border-radius: 4px;
              cursor: pointer;
              font-size: 13px;
            \`;
            button.addEventListener('click', () => {
              resetUserActivity();
              sendMessage(buttonText);
            });
            buttonsDiv.appendChild(button);
          });
          
          messageDiv.appendChild(buttonsDiv);
        }
        
        // Add email prompt if present
        if (msg.emailPrompt && msg.emailPrompt.trim()) {
          const emailDiv = document.createElement('div');
          emailDiv.style.cssText = 'margin-top: 10px;';
          
          const promptText = document.createElement('div');
          promptText.textContent = msg.emailPrompt;
          promptText.style.cssText = 'margin-bottom: 8px; color: #666;';
          emailDiv.appendChild(promptText);
          
          const emailForm = document.createElement('form');
          emailForm.style.cssText = 'display: flex; gap: 8px;';
          
          const emailInput = document.createElement('input');
          emailInput.type = 'email';
          emailInput.placeholder = 'Enter your email';
          emailInput.required = true;
          emailInput.style.cssText = \`
            flex: 1;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
          \`;
          
          emailInput.addEventListener('input', () => {
            if (emailInput.value.length > 0) {
              setUserActive();
            }
          });
          
          const emailSubmit = document.createElement('button');
          emailSubmit.type = 'submit';
          emailSubmit.textContent = msg.emailPrompt.toLowerCase().includes('support') ? 'Contact Support'
            : msg.emailPrompt.toLowerCase().includes('setup') ? 'Send Setup Guide'
            : msg.emailPrompt.toLowerCase().includes('demo') ? 'Get Demo'
            : 'Submit';
          emailSubmit.style.cssText = \`
            background: #0070f3;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
          \`;
          
          emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (emailInput.value.trim()) {
              resetUserActivity();
              sendMessage(emailInput.value.trim());
            }
          });
          
          emailForm.appendChild(emailInput);
          emailForm.appendChild(emailSubmit);
          emailDiv.appendChild(emailForm);
          messageDiv.appendChild(emailDiv);
        }
      } else {
        // User message
        messageDiv.textContent = msg.content;
      }
      
      messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Initialize proactive message
  async function initializeChat() {
    const currentUrl = window.location.href;
    const data = await sendApiRequest('chat', {
      sessionId,
      pageUrl: currentUrl,
      proactive: true,
      adminId: ADMIN_ID
    });
    
    if (data.answer) {
      const welcomeMessage = { role: 'assistant', content: data.answer };
      messages.push(welcomeMessage);
      renderMessages();
      startFollowupTimer();
    }
  }
  
  // Toggle widget
  function toggleWidget() {
    isOpen = !isOpen;
    widgetContainer.style.display = isOpen ? 'flex' : 'none';
    toggleButton.innerHTML = isOpen ? '×' : '💬';
    
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
    
    if (isOpen) {
      resetUserActivity();
    } else {
      clearFollowupTimer();
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Toggle button
    toggleButton.addEventListener('click', toggleWidget);
    
    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-close-btn') {
        toggleWidget();
      }
    });
    
    // Send button and enter key
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-send-btn') {
        const input = document.getElementById('appointy-input');
        if (input) sendMessage(input.value);
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'appointy-input' && e.key === 'Enter') {
        sendMessage(e.target.value);
      }
    });
    
    // Input typing detection
    document.addEventListener('input', (e) => {
      if (e.target.id === 'appointy-input') {
        if (e.target.value.length > 0 && !userIsActive) {
          setUserActive();
          clearFollowupTimer();
          
          // Restart timer with user activity consideration
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && followupCount < 3) {
            followupTimer = setTimeout(() => {
              const timeSinceLastAction = Date.now() - lastUserAction;
              if (!userIsActive && timeSinceLastAction >= 25000) {
                sendFollowupMessage();
              }
            }, 30000);
          }
        } else if (e.target.value.length === 0 && userIsActive) {
          userIsActive = false;
        }
      }
    });
    
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearFollowupTimer();
      } else if (isOpen && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && followupCount < 3) {
          startFollowupTimer();
        }
      }
    });
  }
  
  // Initialize widget
  function init() {
    // Add widget HTML
    widgetContainer.innerHTML = createWidgetHTML();
    
    // Add to page
    document.body.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);
    
    // Setup events
    setupEventListeners();
    
    console.log('Appointy Chatbot Widget loaded successfully');
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

  return new Response(widgetScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
