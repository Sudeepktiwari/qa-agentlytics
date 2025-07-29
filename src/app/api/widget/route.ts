export async function GET(request: Request) {
  // Get the current request URL to determine the base URL dynamically
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Generate the embeddable widget JavaScript
  const widgetScript = `
(function() {
  // Chatbot Widget Implementation - dynamically use the same domain as the widget
  const CHATBOT_API_BASE = '${baseUrl}';
  
  // Get script element and read data attributes (this is the correct way)
  const scriptElement = document.currentScript || document.querySelector('script[src*="/api/widget"]');
  
  // Helper function to get attribute with fallback
  const getAttr = (name, defaultValue) => {
    const value = scriptElement?.getAttribute(name);
    return value !== null && value !== undefined ? value : defaultValue;
  };
  
  // Helper function for boolean attributes
  const getBoolAttr = (name, defaultValue) => {
    const value = scriptElement?.getAttribute(name);
    if (value === null || value === undefined) return defaultValue;
    return value !== 'false' && value !== '0';
  };
  
  // API Key - always has a default fallback
  const API_KEY = getAttr('data-api-key', 'ak_e8a971aee600130a0dcc93ca0fbb8831e366c4566f6b80426991b4ed6c8f9848');
  const ADMIN_ID = 'default';
  
  // Configuration with comprehensive defaults
  const config = {
    theme: getAttr('data-theme', 'blue'),
    size: getAttr('data-size', 'medium'),
    position: getAttr('data-position', 'bottom-right'),
    chatTitle: getAttr('data-chat-title', 'Chat with us'),
    welcomeMessage: getAttr('data-welcome-message', 'Hello! How can I help you today?'),
    buttonText: getAttr('data-button-text', '💬'),
    customColor: getAttr('data-custom-color', '#0070f3'),
    autoOpenProactive: getBoolAttr('data-auto-open-proactive', true),
    voiceEnabled: getBoolAttr('data-voice-enabled', true),
    voiceGender: getAttr('data-voice-gender', 'female'), // 'male' or 'female'
    enhancedDetection: getBoolAttr('data-enhanced-detection', true) // Enable enhanced page detection by default
  };
  
  // Theme configurations
  const themes = {
    blue: { primary: '#0070f3', secondary: '#f0f8ff' },
    green: { primary: '#10b981', secondary: '#f0fdf4' },
    purple: { primary: '#8b5cf6', secondary: '#faf5ff' },
    orange: { primary: '#f59e0b', secondary: '#fffbeb' },
    dark: { primary: '#1f2937', secondary: '#f9fafb' },
    custom: { primary: config.customColor, secondary: '#f0f8ff' }
  };
  
  // Get theme colors with fallback
  const currentTheme = themes[config.theme] || themes.blue;
  
  // Size configurations
  const sizes = {
    small: { width: '300px', height: '400px', buttonSize: '50px' },
    medium: { width: '350px', height: '500px', buttonSize: '60px' },
    large: { width: '400px', height: '600px', buttonSize: '70px' }
  };
  
  // Get size config with fallback
  const currentSize = sizes[config.size] || sizes.medium;
  
  // Position configurations
  const positions = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' }
  };
  
  // Get position config with fallback
  const currentPosition = positions[config.position] || positions['bottom-right'];
  
  // Create main widget container (column layout)
  const widgetMainContainer = document.createElement('div');
  widgetMainContainer.id = 'appointy-chatbot-main';
  
  // Apply position styles to main container
  let positionStyles = '';
  Object.keys(currentPosition).forEach(key => {
    positionStyles += \`\${key}: \${currentPosition[key]}; \`;
  });
  
  widgetMainContainer.style.cssText = \`
    position: fixed;
    \${positionStyles}
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  \`;
  
  // Create widget container (chat window)
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'appointy-chatbot-widget';
  
  widgetContainer.style.cssText = \`
    width: \${currentSize.width};
    height: \${currentSize.height};
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    display: none;
    flex-direction: column;
  \`;
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'appointy-chatbot-toggle';
  toggleButton.innerHTML = config.buttonText;
  toggleButton.style.cssText = \`
    width: \${currentSize.buttonSize};
    height: \${currentSize.buttonSize};
    border: none;
    border-radius: 50%;
    background: \${currentTheme.primary};
    color: white;
    font-size: \${parseInt(currentSize.buttonSize) * 0.4}px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  \`;
  
  // Add pulse animation styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = \`
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  \`;
  document.head.appendChild(styleSheet);
  
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
  
  // Enhanced page detection variables
  let currentPageUrl = window.location.href;
  let isPageContextLoaded = false;
  let pageChangeCheckInterval = null;

  // Messages array
  let messages = [];  // Text-to-Speech functionality with user interaction handling
  let speechAllowed = false;
  let speechInitialized = false;
  
  function speakText(text, isProactive = false) {
    if (!config.voiceEnabled || !text) return;
    
    // For proactive messages, only speak if user has already interacted
    if (isProactive && !speechAllowed) {
      console.log('Speech not allowed for proactive messages without user interaction');
      return;
    }
    
    try {
      // Stop any currently speaking utterance
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      
      // Find voice based on gender preference
      let selectedVoice = null;
      
      if (config.voiceGender === 'female') {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('google us english female')
        );
      } else {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') ||
          voice.name.toLowerCase().includes('man') ||
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('david') ||
          voice.name.toLowerCase().includes('google us english male')
        );
      }
      
      // Fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || voices.find(voice => voice.lang.startsWith('en'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Configure speech settings
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = config.voiceGender === 'female' ? 1.1 : 0.9;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      
      // Add event listeners
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          console.log('Speech not allowed - user interaction required first');
          speechAllowed = false;
        }
      };
      
      // Speak the text
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  }
  
  // Initialize speech on first user interaction
  function initializeSpeechOnInteraction() {
    if (speechInitialized) return;
    
    speechInitialized = true;
    speechAllowed = true;
    
    // Test speech with empty utterance to enable it
    try {
      const testUtterance = new SpeechSynthesisUtterance('');
      testUtterance.volume = 0;
      speechSynthesis.speak(testUtterance);
      speechSynthesis.cancel();
      console.log('Speech synthesis initialized');
    } catch (error) {
      console.error('Failed to initialize speech:', error);
    }
  }
  
  // Ensure voices are loaded
  function initializeVoices() {
    return new Promise((resolve) => {
      if (speechSynthesis.getVoices().length > 0) {
        resolve(true);
        return;
      }
      
      const voiceschanged = () => {
        speechSynthesis.removeEventListener('voiceschanged', voiceschanged);
        resolve(true);
      };
      
      speechSynthesis.addEventListener('voiceschanged', voiceschanged);
      
      // Fallback timeout
      setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', voiceschanged);
        resolve(true);
      }, 1000);
    });
  }
  
  // Send proactive message with voice and auto-opening
  function sendProactiveMessage(text) {
    if (!text) {
      console.log('[ChatWidget] No proactive message text provided');
      return;
    }
    
    console.log('[ChatWidget] Sending proactive message:', text.substring(0, 100) + '...');
    
    const proactiveMessage = {
      role: 'assistant',
      content: text,
      buttons: [],
      emailPrompt: '',
      isProactive: true
    };
    
    messages.push(proactiveMessage);
    console.log('[ChatWidget] Proactive message added to messages array. Total messages:', messages.length);
    
    // Auto-open chat if configured and currently closed
    if (config.autoOpenProactive && !isOpen) {
      console.log('[ChatWidget] Auto-opening chat widget for proactive message');
      toggleWidget();
      // Small delay to ensure widget is opened before rendering
      setTimeout(() => {
        renderMessages();
      }, 100);
    } else if (isOpen) {
      console.log('[ChatWidget] Chat already open, rendering proactive message');
      // Re-render messages if chat is already open
      renderMessages();
    } else {
      console.log('[ChatWidget] Auto-open disabled, not opening chat for proactive message');
    }
    
    // Only speak if user has already interacted with the page
    if (config.voiceEnabled && speechAllowed) {
      console.log('[ChatWidget] Speaking proactive message (user interaction detected)');
      // Initialize voices first, then speak
      initializeVoices().then(() => {
        // Small delay to ensure chat is open and visible
        setTimeout(() => {
          speakText(text, true);
        }, 500);
      });
    } else if (config.voiceEnabled) {
      console.log('Proactive message voice disabled - waiting for user interaction');
    }
    
    // Update bubble if chat is closed (shouldn't happen with auto-open, but just in case)
    if (!isOpen) {
      console.log('[ChatWidget] Updating bubble for closed chat');
      updateBubble();
    }
  }
  
  // Enhanced page detection and monitoring
  function detectPageChange() {
    const newUrl = window.location.href;
    if (newUrl !== currentPageUrl) {
      console.log('[ChatWidget] Page changed from', currentPageUrl, 'to', newUrl);
      currentPageUrl = newUrl;
      isPageContextLoaded = false;
      
      // Always reload context for new page to ensure proper detection
      loadPageContext();
      
      return true;
    }
    return false;
  }
  
  // Load page-specific context
  async function loadPageContext() {
    if (isPageContextLoaded) {
      console.log('[ChatWidget] Page context already loaded, skipping');
      return;
    }
    
    try {
      console.log('[ChatWidget] Loading context for page:', currentPageUrl);
      
      // Get page-specific proactive message
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true,
        adminId: 'default'
      });
      
      console.log('[ChatWidget] API response for proactive request:', data);
      
      if (data.answer) {
        console.log('[ChatWidget] Received proactive message from API:', data.answer.substring(0, 100) + '...');
        // Send proactive message if auto-open is enabled
        if (config.autoOpenProactive) {
          console.log('[ChatWidget] Auto-open enabled, sending proactive message');
          sendProactiveMessage(data.answer);
        } else {
          console.log('[ChatWidget] Auto-open disabled, not sending proactive message');
        }
        isPageContextLoaded = true;
        console.log('[ChatWidget] Page context loaded successfully');
      } else {
        console.log('[ChatWidget] No proactive message received from API');
        console.log('[ChatWidget] Full API response:', data);
      }
    } catch (error) {
      console.error('[ChatWidget] Failed to load page context:', error);
    }
  }
  
  // Start monitoring page changes
  function startPageMonitoring() {
    // Check for page changes every 1 second
    pageChangeCheckInterval = setInterval(detectPageChange, 1000);
    
    // Also listen for navigation events
    window.addEventListener('popstate', detectPageChange);
    
    // Modern browsers - detect pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(detectPageChange, 100);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(detectPageChange, 100);
    };
  }
  
  // Update bubble to show notification when there are unread messages
  function updateBubble() {
    const unreadCount = messages.filter(msg => msg.role === 'assistant').length;
    if (unreadCount > 0 && !isOpen) {
      toggleButton.innerHTML = '🔴'; // Red dot to indicate new messages
      toggleButton.style.animation = 'pulse 2s infinite';
    } else {
      toggleButton.innerHTML = isOpen ? '×' : config.buttonText;
      toggleButton.style.animation = 'none';
    }
  }
  
  // Create widget HTML
  function createWidgetHTML() {
    return \`
      <div style="display: flex; flex-direction: column; height: 100%; background: white; border-radius: 12px; overflow: hidden;">
        <div style="background: \${currentTheme.primary}; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">\${config.chatTitle}</h3>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="appointy-settings-btn" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" title="Voice Settings">⚙️</button>
            <button id="appointy-close-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
          </div>
        </div>
        <div id="appointy-settings" style="display: none; background: #f8f9fa; padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">Voice Settings</div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280;">
              <input type="checkbox" id="appointy-voice-enabled" \${config.voiceEnabled ? 'checked' : ''} style="margin: 0;">
              Enable Voice
            </label>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 13px; color: #6b7280;">Voice:</span>
            <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6b7280;">
              <input type="radio" name="voice-gender" value="female" \${config.voiceGender === 'female' ? 'checked' : ''} style="margin: 0;">
              Female
            </label>
            <label style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6b7280;">
              <input type="radio" name="voice-gender" value="male" \${config.voiceGender === 'male' ? 'checked' : ''} style="margin: 0;">
              Male
            </label>
          </div>
        </div>
        <div id="appointy-messages" style="flex: 1; padding: 15px; overflow-y: auto; max-height: calc(100% - 140px); background: white;">
          <div style="color: #666; font-size: 14px;">Loading...</div>
        </div>
        <div style="padding: 15px; border-top: 1px solid #e5e7eb; background: white;">
          <div style="display: flex; gap: 8px;">
            <input 
              id="appointy-input" 
              type="text" 
              placeholder="Type your message..." 
              style="flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; outline: none; font-size: 14px;"
            />
            <button 
              id="appointy-send-btn" 
              style="background: \${currentTheme.primary}; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
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
    
    // Ensure we have the latest page URL
    detectPageChange();
    
    // Add user message
    const userMessage = { role: 'user', content: text };
    messages.push(userMessage);
    renderMessages();
    
    // Clear input
    const input = document.getElementById('appointy-input');
    if (input) input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to API with current page context
    const data = await sendApiRequest('chat', {
      question: text,
      sessionId,
      pageUrl: currentPageUrl,
      adminId: ADMIN_ID
    });
    
    // Hide typing indicator
    hideTypingIndicator();
    
    let botResponse = '';
    if (data.error) {
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
      messages.push(errorMessage);
      botResponse = errorMessage.content;
    } else {
      const botMessage = {
        role: 'assistant',
        content: data.mainText || data.answer || 'I received your message.',
        buttons: data.buttons || [],
        emailPrompt: data.emailPrompt || ''
      };
      messages.push(botMessage);
      botResponse = botMessage.content;
      startFollowupTimer();
    }
    
    renderMessages();
    
    // Speak bot response if voice is enabled and allowed
    if (config.voiceEnabled && speechAllowed && botResponse) {
      setTimeout(() => {
        speakText(botResponse, false);
      }, 500);
    }
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
      
      if (msg.role === 'user') {
        // User message - right aligned with theme color background
        messageDiv.style.cssText = \`
          margin: 8px 0;
          display: flex;
          justify-content: flex-end;
        \`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.style.cssText = \`
          background: \${currentTheme.primary};
          color: white;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 100%;
          min-width: fit-content;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
          display: inline-block;
        \`;
        bubbleDiv.textContent = msg.content;
        messageDiv.appendChild(bubbleDiv);
        
      } else {
        // Bot message - left aligned with light gray background
        messageDiv.style.cssText = \`
          margin: 8px 0;
          display: flex;
          justify-content: flex-start;
        \`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.style.cssText = \`
          background: #f1f1f1;
          color: #333;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 100%;
          min-width: fit-content;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
          display: inline-block;
        \`;
        
        // Bot message with potential buttons and email prompt
        const contentDiv = document.createElement('div');
        contentDiv.textContent = msg.content;
        bubbleDiv.appendChild(contentDiv);
        
        // Add buttons if present and no email prompt
        if (msg.buttons && msg.buttons.length > 0 && (!msg.emailPrompt || !msg.emailPrompt.trim())) {
          const buttonsDiv = document.createElement('div');
          buttonsDiv.style.cssText = 'margin-top: 8px;';
          
          msg.buttons.forEach((buttonText) => {
            const button = document.createElement('button');
            button.textContent = buttonText;
            button.style.cssText = \`
              background: \${currentTheme.primary};
              color: white;
              border: none;
              padding: 8px 12px;
              margin: 4px 4px 4px 0;
              border-radius: 12px;
              cursor: pointer;
              font-size: 13px;
              transition: background-color 0.2s;
            \`;
            button.addEventListener('mouseenter', () => {
              button.style.opacity = '0.9';
            });
            button.addEventListener('mouseleave', () => {
              button.style.opacity = '1';
            });
            button.addEventListener('click', () => {
              resetUserActivity();
              sendMessage(buttonText);
            });
            buttonsDiv.appendChild(button);
          });
          
          bubbleDiv.appendChild(buttonsDiv);
        }
        
        // Add email prompt if present
        if (msg.emailPrompt && msg.emailPrompt.trim()) {
          const emailDiv = document.createElement('div');
          emailDiv.style.cssText = 'margin-top: 8px;';
          
          const promptText = document.createElement('div');
          promptText.textContent = msg.emailPrompt;
          promptText.style.cssText = 'margin-bottom: 8px; color: #666; font-size: 13px;';
          emailDiv.appendChild(promptText);
          
          const emailForm = document.createElement('form');
          emailForm.style.cssText = 'display: flex; gap: 8px;';
          
          const emailInput = document.createElement('input');
          emailInput.type = 'email';
          emailInput.placeholder = 'Enter your email';
          emailInput.required = true;
          emailInput.style.cssText = \`
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
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
            background: \${currentTheme.primary};
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
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
          bubbleDiv.appendChild(emailDiv);
        }
        
        messageDiv.appendChild(bubbleDiv);
      }
      
      messagesContainer.appendChild(messageDiv);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Initialize proactive message
  async function initializeChat() {
    console.log('[ChatWidget] Initializing chat for page:', currentPageUrl);
    
    // Wait for page context to be properly loaded first
    if (!isPageContextLoaded) {
      await loadPageContext();
    }
    
    // If page context loading didn't provide a proactive message, send default
    if (messages.length === 0) {
      console.log('[ChatWidget] No page-specific context found, using default message');
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true,
        adminId: 'default'
      });
      
      if (data.answer) {
        sendProactiveMessage(data.answer);
      }
    }
    
    console.log('[ChatWidget] Chat initialized successfully');
  }
  
  // Toggle widget
  function toggleWidget() {
    isOpen = !isOpen;
    widgetContainer.style.display = isOpen ? 'flex' : 'none';
    
    // Update button appearance
    toggleButton.innerHTML = isOpen ? '×' : config.buttonText;
    toggleButton.style.animation = 'none'; // Remove pulse animation
    
    if (isOpen) {
      // If no messages exist, initialize chat
      if (messages.length === 0) {
        initializeChat();
      }
      
      resetUserActivity();
    } else {
      clearFollowupTimer();
      // Hide settings when closing chat
      const settingsPanel = document.getElementById('appointy-settings');
      if (settingsPanel) {
        settingsPanel.style.display = 'none';
      }
    }
  }
  
  // Toggle settings panel
  function toggleSettings() {
    const settingsPanel = document.getElementById('appointy-settings');
    if (settingsPanel) {
      const isVisible = settingsPanel.style.display !== 'none';
      settingsPanel.style.display = isVisible ? 'none' : 'block';
      
      // Update settings values to current config
      const voiceEnabledCheckbox = document.getElementById('appointy-voice-enabled');
      if (voiceEnabledCheckbox) {
        voiceEnabledCheckbox.checked = config.voiceEnabled;
      }
      
      const voiceGenderRadios = document.querySelectorAll('input[name="voice-gender"]');
      voiceGenderRadios.forEach(radio => {
        radio.checked = radio.value === config.voiceGender;
      });
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Initialize speech on any user interaction
    const enableSpeechOnInteraction = () => {
      initializeSpeechOnInteraction();
    };
    
    // Add listeners for various user interactions
    document.addEventListener('click', enableSpeechOnInteraction, { once: true });
    document.addEventListener('keydown', enableSpeechOnInteraction, { once: true });
    document.addEventListener('touchstart', enableSpeechOnInteraction, { once: true });
    
    // Toggle button
    toggleButton.addEventListener('click', () => {
      initializeSpeechOnInteraction(); // Ensure speech is enabled on chat open
      toggleWidget();
    });
    
    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-close-btn') {
        toggleWidget();
      }
    });
    
    // Settings button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-settings-btn') {
        toggleSettings();
      }
    });
    
    // Voice settings change handlers
    document.addEventListener('change', (e) => {
      if (e.target.id === 'appointy-voice-enabled') {
        config.voiceEnabled = e.target.checked;
        if (e.target.checked && !speechAllowed) {
          initializeSpeechOnInteraction();
        }
        console.log('Voice enabled:', config.voiceEnabled);
      }
      
      if (e.target.name === 'voice-gender') {
        config.voiceGender = e.target.value;
        console.log('Voice gender changed to:', config.voiceGender);
        
        // Test the new voice
        if (config.voiceEnabled && speechAllowed) {
          const testMessage = config.voiceGender === 'female' ? 
            'Female voice selected' : 'Male voice selected';
          setTimeout(() => speakText(testMessage, false), 200);
        }
      }
    });
    
    // Send button and enter key
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-send-btn') {
        initializeSpeechOnInteraction(); // Enable speech on send
        const input = document.getElementById('appointy-input');
        if (input) sendMessage(input.value);
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.target.id === 'appointy-input' && e.key === 'Enter') {
        initializeSpeechOnInteraction(); // Enable speech on enter
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
    
    // Add elements to column container in correct order
    widgetMainContainer.appendChild(widgetContainer); // Chat window first (top)
    widgetMainContainer.appendChild(toggleButton);    // Button second (bottom)
    
    // Add main container to page
    document.body.appendChild(widgetMainContainer);
    
    // Setup events
    setupEventListeners();
    
    // Initialize voices for speech functionality
    if (config.voiceEnabled) {
      initializeVoices();
    }
    
    // Start page monitoring and load initial context (if enhanced detection is enabled)
    setTimeout(() => {
      if (config.enhancedDetection) {
        startPageMonitoring();
        // Load initial page context
        loadPageContext();
      }
    }, 1000);
    
    console.log('[ChatWidget] Widget initialized successfully');    // Add cleanup function for page monitoring
    window.addEventListener('beforeunload', cleanupPageMonitoring);
  }
  
  // Cleanup page monitoring
  function cleanupPageMonitoring() {
    if (pageChangeCheckInterval) {
      clearInterval(pageChangeCheckInterval);
      pageChangeCheckInterval = null;
    }
    
    window.removeEventListener('popstate', detectPageChange);
    console.log('[ChatWidget] Page monitoring cleaned up');
  }
  
  // Expose global API for admin control
  window.appointyChatbot = {
      sendProactiveMessage: (text) => {
        // For programmatic calls, try to enable speech first
        if (config.voiceEnabled && !speechAllowed) {
          console.log('Note: Voice will only work after user interaction with the page');
        }
        sendProactiveMessage(text);
      },
      openChat: () => {
        if (!isOpen) toggleWidget();
      },
      closeChat: () => {
        if (isOpen) toggleWidget();
      },
      toggleSettings: () => {
        if (isOpen) toggleSettings();
      },
      isOpen: () => isOpen,
      setVoiceEnabled: (enabled) => {
        config.voiceEnabled = enabled;
        // Update UI if settings panel is visible
        const voiceEnabledCheckbox = document.getElementById('appointy-voice-enabled');
        if (voiceEnabledCheckbox) {
          voiceEnabledCheckbox.checked = enabled;
        }
      },
      setVoiceGender: (gender) => {
        config.voiceGender = gender === 'male' ? 'male' : 'female';
        // Update UI if settings panel is visible
        const voiceGenderRadios = document.querySelectorAll('input[name="voice-gender"]');
        voiceGenderRadios.forEach(radio => {
          radio.checked = radio.value === config.voiceGender;
        });
      },
      setAutoOpen: (autoOpen) => {
        config.autoOpenProactive = !!autoOpen;
      },
      setEnhancedDetection: (enabled) => {
        config.enhancedDetection = !!enabled;
        if (enabled && !pageChangeCheckInterval) {
          // Start monitoring if it wasn't running
          startPageMonitoring();
          loadPageContext();
        } else if (!enabled && pageChangeCheckInterval) {
          // Stop monitoring if it was running
          cleanupPageMonitoring();
        }
      },
      speakText: (text) => {
        if (config.voiceEnabled && text) {
          if (!speechAllowed) {
            console.log('Speech requires user interaction first. Please click anywhere on the page.');
            return false;
          }
          speakText(text, false);
          return true;
        }
        return false;
      },
      enableSpeech: () => {
        initializeSpeechOnInteraction();
        return speechAllowed;
      },
      isSpeechAllowed: () => speechAllowed,
      getConfig: () => ({ ...config }),
      getVoices: () => speechSynthesis.getVoices(),
      
      // Enhanced page detection APIs
      getCurrentPageUrl: () => currentPageUrl,
      refreshPageContext: () => {
        isPageContextLoaded = false;
        return loadPageContext();
      },
      forcePageDetection: () => detectPageChange(),
      isPageContextLoaded: () => isPageContextLoaded
    };
    
    console.log('Appointy Chatbot Widget loaded successfully');
  
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
