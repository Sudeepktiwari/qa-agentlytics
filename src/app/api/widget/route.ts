import { NextResponse } from "next/server";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  // Get the current request URL to determine the base URL dynamically
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Generate the embeddable widget JavaScript
  const widgetScript = `
(function() {
  // Chatbot Widget Implementation - dynamically use the same domain as the widget
  const CHATBOT_API_BASE = '${baseUrl}';
  
  // Track page load time for user context analysis
  if (!window.pageLoadTime) {
    window.pageLoadTime = Date.now();
  }
  
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
  
  // API Key - REQUIRED, no fallback
  const API_KEY = getAttr('data-api-key', null);
  
  // Validate API Key is provided - STRICTLY REQUIRED
  if (!API_KEY || API_KEY.trim() === '') {
    console.error('[Widget] API key is required. Please add data-api-key attribute to the script tag.');
    console.error('Widget will not initialize without a valid API key.');
    throw new Error('API key required');
  }
  
  // Validate API Key format (should start with 'ak_' and be 67 characters total)
  if (!API_KEY.startsWith('ak_') || API_KEY.length !== 67) {
    console.error('[Widget] Invalid API key format. API key should start with ak_ and be 67 characters long.');
    console.error('Widget will not initialize with invalid API key format.');
    throw new Error('Invalid API key format');
  }
  
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
    enhancedDetection: getBoolAttr('data-enhanced-detection', true), // Enable enhanced page detection by default
    botAvatar: getAttr('data-bot-avatar', null), // Custom bot avatar URL
    userAvatar: getAttr('data-user-avatar', null), // Custom user avatar URL (optional)
    mirrorMode: getBoolAttr('data-mirror-mode', true), // Enable live page mirror
    mirrorScale: getAttr('data-mirror-scale', 'auto') // 'auto', 'fit', or custom scale like '0.3'
  };

  // Onboarding-only mode flag from embed code
  const ONBOARDING_ONLY = getBoolAttr('data-onboarding-only', false);

  // If onboarding-only mode, adjust defaults and behavior
  if (ONBOARDING_ONLY) {
    // Distinct look and behavior for onboarding-only usage
    config.theme = 'green';
    config.chatTitle = getAttr('data-chat-title', 'Onboarding Assistant');
    config.autoOpenProactive = false; // suppress proactive auto-open
    config.mirrorMode = false; // disable mirror
    config.enhancedDetection = false; // disable contextual detection for clean onboarding
  }
  
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
    small: { width: '300px', height: '400px', buttonSize: '50px', fontSize: '13px' },
    medium: { width: '350px', height: '600px', buttonSize: '60px', fontSize: '14px' },
    large: { width: '400px', height: '700px', buttonSize: '70px', fontSize: '15px' }
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
  // Prevent duplicate IDs by removing any existing widget instance
  const existingMainContainer = document.getElementById('appointy-chatbot-main');
  if (existingMainContainer) {
    try {
      existingMainContainer.remove();
      console.log('🧹 [WIDGET INIT] Removed existing widget container to avoid duplicate IDs');
    } catch (e) {
      console.warn('⚠️ [WIDGET INIT] Failed to remove existing widget container:', e);
    }
  }
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

  // In onboarding-only mode, present the widget as a centered modal popup
  if (ONBOARDING_ONLY) {
    widgetMainContainer.style.cssText = \`
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: transparent;
      pointer-events: auto;
      padding: 20px;
    \`;
  }
  // Remove overlay padding on mobile to allow full-width widget
  if (ONBOARDING_ONLY) {
    const isMobileOverlay = (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) || (window.innerWidth <= 480);
    if (isMobileOverlay) {
      widgetMainContainer.style.padding = '0';
    }
  }
  
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
  
  // In onboarding-only mode, use responsive modal width/height
  if (ONBOARDING_ONLY) {
    const isMobile = (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) || (window.innerWidth <= 480);
    if (isMobile) {
      widgetContainer.style.width = '100vw';
      // Per request: set mobile height to 100vw
      widgetContainer.style.height = '100vh';
      // Ensure no margins so width truly spans edge-to-edge
      widgetContainer.style.margin = '0';
    } else {
      widgetContainer.style.width = '70vw';
    }
  }
  
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

  // Conversation state tracking
  let hasBeenGreeted = localStorage.getItem('appointy_has_been_greeted') === 'true';
  let proactiveMessageCount = parseInt(localStorage.getItem('appointy_proactive_count') || '0');
  let visitedPages = JSON.parse(localStorage.getItem('appointy_visited_pages') || '[]');

  let followupTimer = null;
  let followupCount = 0;
  let followupSent = false;
  let lastUserAction = Date.now();
  let lastUserMessage = Date.now(); // Track when user last sent a message
  let userIsActive = false;
  let widgetScrollTimeout = null;
  let usedFollowupTopics = new Set(); // Track used followup topics
  
  // Auto-response system variables
  let autoResponseTimer = null;
  let contextualQuestionDisplayed = false;
  let lastContextualQuestion = null;
  let contextualMessageDelayActive = false; // Prevent multiple contextual messages during delay period
  let onboardingProactiveSent = false; // Suppress non-onboarding proactive in onboarding-only mode
  
  // Enhanced page detection variables
  let currentPageUrl = window.location.href;
  
  // User booking data for multi-step booking process
  let userBookingData = {
    email: null,
    name: null,
    phone: null,
    company: null
  };
  let isRescheduleMode = false;
  let currentBookingData = null;
  let bookingInProgress = false;
  let isPageContextLoaded = false;
  let isPageContextLoading = false;
  let pageChangeCheckInterval = null;

  // Mirror iframe variables
  let mirrorIframe = null;
  let mirrorEnabled = config.mirrorMode && window.innerWidth > 768; // Disable on mobile
  let lastScrollX = window.scrollX;
  let lastScrollY = window.scrollY;
  let scrollRaf = null;
  let currentViewportSection = null;
  let sectionObserver = null;
  
  console.log('🔍 [WIDGET MIRROR] Mirror configuration:', {
    mirrorMode: config.mirrorMode,
    windowWidth: window.innerWidth,
    mirrorEnabled: mirrorEnabled
  });

  // Messages array
  let messages = [];
  
  // Format text with markdown-like styling
  function formatMessageText(text) {
    if (!text) return '';
    
    // Convert **text** to <strong>text</strong>
    let formatted = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    
    // Convert *text* to <em>text</em>
    formatted = formatted.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
    
    // Convert line breaks
    formatted = formatted.replace(/\\n/g, '<br>');
    
    // Convert > blockquotes to styled divs
    formatted = formatted.replace(/^>\\s*(.+)$/gm, '<div style="border-left: 3px solid #e5e7eb; padding-left: 12px; margin: 8px 0; font-style: italic; color: #6b7280;">$1</div>');
    
    return formatted;
  }
  
  // Create avatar element
  function createAvatar(isBot = false) {
    const avatar = document.createElement('div');
    avatar.style.cssText = \`
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 500;
      overflow: hidden;
    \`;
    
    if (isBot) {
      if (config.botAvatar) {
        // Use custom bot avatar image
        const img = document.createElement('img');
        img.src = config.botAvatar;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        img.onerror = () => {
          // Fallback to default bot avatar if image fails to load
          avatar.innerHTML = '🤖';
          avatar.style.background = \`\${currentTheme.primary}\`;
          avatar.style.color = 'white';
        };
        avatar.appendChild(img);
      } else {
        // Default bot avatar
        avatar.innerHTML = '🤖';
        avatar.style.background = \`\${currentTheme.primary}\`;
        avatar.style.color = 'white';
      }
    } else {
      if (config.userAvatar) {
        // Use custom user avatar image
        const img = document.createElement('img');
        img.src = config.userAvatar;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        img.onerror = () => {
          // Fallback to default user avatar if image fails to load
          avatar.innerHTML = '👤';
          avatar.style.background = '#f1f1f1';
          avatar.style.color = '#666';
        };
        avatar.appendChild(img);
      } else {
        // Default user avatar
        avatar.innerHTML = '👤';
        avatar.style.background = '#f1f1f1';
        avatar.style.color = '#666';
      }
    }
    
    return avatar;
  }  // Text-to-Speech functionality with user interaction handling
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

  // Show email collection form before booking
  function showEmailCollectionForm(bubbleDiv, bookingType) {
    console.log("📧 [EMAIL FORM] Creating email collection form for booking type:", bookingType);
    
    const formDiv = document.createElement('div');
    formDiv.style.cssText = 'margin-top: 12px; background: white; border-radius: 8px; padding: 20px; color: #333; border: 1px solid #e5e7eb;';
    
    console.log("📧 [EMAIL FORM] Form div created with styles");
    
    // Form header
    const formHeader = document.createElement('div');
    formHeader.style.cssText = 'text-align: center; margin-bottom: 20px; font-weight: 600; color: #1f2937;';
    formHeader.innerHTML = \`
      <div style="font-size: 18px; margin-bottom: 8px;">📅 Schedule Your \${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</div>
      <div style="font-size: 14px; color: #6b7280; font-weight: normal;">Please provide your details to book an appointment</div>
    \`;
    formDiv.appendChild(formHeader);
    
    console.log("📧 [EMAIL FORM] Form header created and added");
    
    // Email input
    const emailDiv = document.createElement('div');
    emailDiv.style.cssText = 'margin-bottom: 16px;';
    
    const emailLabel = document.createElement('label');
    emailLabel.style.cssText = 'display: block; margin-bottom: 6px; font-weight: 500; color: #374151; font-size: 13px;';
    emailLabel.textContent = 'Email Address *';
    emailDiv.appendChild(emailLabel);
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'your.email@company.com';
    emailInput.style.cssText = 'width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; outline: none;';
    emailInput.addEventListener('focus', () => {
      emailInput.style.borderColor = '#0070f3';
      emailInput.style.boxShadow = '0 0 0 3px rgba(0, 112, 243, 0.1)';
    });
    emailInput.addEventListener('blur', () => {
      emailInput.style.borderColor = '#d1d5db';
      emailInput.style.boxShadow = 'none';
    });
    emailDiv.appendChild(emailInput);
    formDiv.appendChild(emailDiv);
    
    // Name input (optional)
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'margin-bottom: 16px;';
    
    const nameLabel = document.createElement('label');
    nameLabel.style.cssText = 'display: block; margin-bottom: 6px; font-weight: 500; color: #374151; font-size: 13px;';
    nameLabel.textContent = 'Full Name (Optional)';
    nameDiv.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'John Doe';
    nameInput.style.cssText = 'width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; outline: none;';
    nameInput.addEventListener('focus', () => {
      nameInput.style.borderColor = '#0070f3';
      nameInput.style.boxShadow = '0 0 0 3px rgba(0, 112, 243, 0.1)';
    });
    nameInput.addEventListener('blur', () => {
      nameInput.style.borderColor = '#d1d5db';
      nameInput.style.boxShadow = 'none';
    });
    nameDiv.appendChild(nameInput);
    formDiv.appendChild(nameDiv);
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.style.cssText = 'width: 100%; background: #0070f3; color: white; border: none; padding: 12px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;';
    submitButton.textContent = 'Continue to Calendar';
    submitButton.addEventListener('mouseenter', () => {
      submitButton.style.backgroundColor = '#0056b3';
    });
    submitButton.addEventListener('mouseleave', () => {
      submitButton.style.backgroundColor = '#0070f3';
    });
    
    submitButton.addEventListener('click', async () => {
      console.log("🔄 [EMAIL FORM] Continue button clicked");
      const email = emailInput.value.trim();
      const name = nameInput.value.trim();
      
      console.log("📧 [EMAIL FORM] Collected data:", { email, name });
      
      // Validate email with detailed debugging
      // Using a simpler but robust email regex pattern
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      console.log("📧 [EMAIL FORM] Email string:", JSON.stringify(email));
      console.log("📧 [EMAIL FORM] Email character codes:", email.split('').map(c => c.charCodeAt(0)));
      console.log("📧 [EMAIL FORM] Email regex pattern:", emailRegex.toString());
      console.log("📧 [EMAIL FORM] Email regex test result:", emailRegex.test(email));
      console.log("📧 [EMAIL FORM] Email length check:", email.length > 0);
      
      // Test with a known working email for comparison
      const testEmail = "test@example.com";
      console.log("📧 [EMAIL FORM] Test email regex result:", emailRegex.test(testEmail));
      
      // Additional validation: check for basic email structure manually
      const hasAtSymbol = email.includes('@');
      const atIndex = email.indexOf('@');
      const hasDot = email.includes('.');
      const dotIndex = email.lastIndexOf('.');
      
      console.log("📧 [EMAIL FORM] Manual checks:");
      console.log("  - Has @ symbol:", hasAtSymbol);
      console.log("  - @ index:", atIndex);
      console.log("  - Has dot:", hasDot);
      console.log("  - Dot index:", dotIndex);
      console.log("  - Valid structure:", hasAtSymbol && atIndex > 0 && hasDot && dotIndex > atIndex);
      
      // Use a more permissive validation for now
      const isValidEmail = email && hasAtSymbol && atIndex > 0 && hasDot && dotIndex > atIndex && email.length > 5;
      
      if (!isValidEmail) {
        console.log("❌ [EMAIL FORM] Invalid email:", email);
        console.log("❌ [EMAIL FORM] Email is empty:", !email);
        console.log("❌ [EMAIL FORM] Email regex failed:", !emailRegex.test(email));
        emailInput.style.borderColor = '#ef4444';
        emailInput.focus();
        return;
      }
      
      console.log("✅ [EMAIL FORM] Email validated, storing data");
      
      // Store user data
      userBookingData.email = email;
      userBookingData.name = name || 'Anonymous User';
      
      // 🔥 UPDATE SESSION WITH EMAIL FOR CUSTOMER INTELLIGENCE
      try {
        console.log("📊 [EMAIL FORM] Updating session with email for customer intelligence");
        
        await sendApiRequest('chat', {
          sessionId: sessionId,
          pageUrl: currentPageUrl,
          updateUserProfile: true,
          userEmail: email,
          userName: name || 'Anonymous User',
          leadSource: 'calendar_booking',
          bookingIntent: bookingType,
          question: \`User provided email: \${email} for \${bookingType} booking\`
        });
        
        console.log("✅ [EMAIL FORM] Session updated with user email for customer intelligence");
      } catch (error) {
        console.warn("⚠️ [EMAIL FORM] Failed to update session with email:", error);
        // Don't block the booking flow if this fails
      }
      
      console.log("📊 [EMAIL FORM] User data stored:", userBookingData);
      
      // Show success message and calendar
      console.log("🔄 [EMAIL FORM] Hiding form and showing calendar");
      formDiv.style.display = 'none';
      showBookingCalendar(bubbleDiv, bookingType);
    });
    
    // Add the button to the form
    formDiv.appendChild(submitButton);
    
    console.log("📧 [EMAIL FORM] Submit button created and added to form");
    
    bubbleDiv.appendChild(formDiv);
    
    console.log("📧 [EMAIL FORM] Form added to bubble div");
    console.log("📧 [EMAIL FORM] Form div innerHTML:", formDiv.innerHTML.substring(0, 200) + "...");
    
    // Focus email input
    setTimeout(() => {
      console.log("📧 [EMAIL FORM] Focusing email input");
      emailInput.focus();
    }, 300);
  }
  
  // Show booking calendar after email collection
  function showBookingCalendar(bubbleDiv, bookingType) {
    console.log("📅 [BOOKING CALENDAR] Starting to show calendar for:", bookingType);
    console.log("📊 [BOOKING CALENDAR] Current user data:", userBookingData);
    
    const calendarDiv = document.createElement('div');
    calendarDiv.style.cssText = 'margin-top: 12px; background: white; border-radius: 8px; padding: 16px; color: #333;';
    
    // Calendar header with user info
    const calendarHeader = document.createElement('div');
    calendarHeader.style.cssText = 'text-align: center; margin-bottom: 16px; font-weight: 600; color: #333;';
    calendarHeader.innerHTML = \`
      <div style="font-size: 16px; margin-bottom: 4px;">📅 Schedule Your \${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}</div>
      <div style="font-size: 13px; color: #6b7280; font-weight: normal;">Booking for: \${userBookingData.email}</div>
    \`;
    calendarDiv.appendChild(calendarHeader);
    
    console.log("📅 [BOOKING CALENDAR] Calendar header created");
    
    // Loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'text-align: center; padding: 20px; color: #666;';
    loadingDiv.innerHTML = '<div style="margin-bottom: 8px;">📅</div>Loading available times...';
    calendarDiv.appendChild(loadingDiv);
    
    console.log("📅 [BOOKING CALENDAR] Loading state created");
    
    // Add calendar container
    const calendarContainer = document.createElement('div');
    calendarContainer.id = \`booking-calendar-\${Date.now()}\`;
    calendarContainer.style.cssText = 'display: none;';
    calendarDiv.appendChild(calendarContainer);
    
    console.log("📅 [BOOKING CALENDAR] Calendar container created");
    
    bubbleDiv.appendChild(calendarDiv);
    
    console.log("📅 [BOOKING CALENDAR] Calendar div added to bubble");
    
    // Load calendar data
    console.log("📅 [BOOKING CALENDAR] Starting to load calendar data in 500ms");
    setTimeout(() => loadBookingCalendar(calendarContainer, loadingDiv, bookingType), 500);
  }

  // Load and render booking calendar with enhanced UI
  async function loadBookingCalendar(container, loadingDiv, bookingType) {
    try {
      console.log("📅 [WIDGET CALENDAR] Loading calendar for:", bookingType);
      
      // Show enhanced loading state
      loadingDiv.innerHTML = '<div style="text-align: center; padding: 30px; color: #6b7280;"><div style="margin-bottom: 12px; font-size: 24px;">📅</div><div style="margin-bottom: 8px; font-weight: 500;">Loading available times...</div><div style="font-size: 13px; opacity: 0.7;">Finding the perfect slot for your ' + bookingType + '</div></div>';
      
      // Fetch available time slots with current month
      const currentDate = new Date();
      const response = await fetch(\`\${CHATBOT_API_BASE}/api/calendar/availability?month=\${currentDate.getMonth() + 1}&year=\${currentDate.getFullYear()}&bookingType=\${bookingType}\`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      const calendarData = data.data;
      
      // Hide loading and show calendar
      loadingDiv.style.display = 'none';
      container.style.display = 'block';
      
      if (!calendarData || !calendarData.days || calendarData.days.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666; background: #f8f9fa; border-radius: 8px;"><div style="margin-bottom: 8px; font-size: 18px;">📅</div><div style="font-weight: 500; margin-bottom: 4px;">No available slots found</div><div style="font-size: 13px;">Please contact us directly to schedule your ' + bookingType + '</div></div>';
        return;
      }
      
      // Create enhanced calendar interface with two-step selection
      container.innerHTML = '';
      
      // Calendar header with navigation
      const calendarHeader = document.createElement('div');
      calendarHeader.style.cssText = 'margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;';
      
      const monthYear = document.createElement('div');
      monthYear.style.cssText = 'text-align: center; font-weight: 600; color: #1f2937; margin-bottom: 8px;';
      monthYear.textContent = new Date(calendarData.year, calendarData.month - 1).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      const stepIndicator = document.createElement('div');
      stepIndicator.style.cssText = 'text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 4px;';
      stepIndicator.innerHTML = '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 8px;">Step 1</span>Select a date';
      
      const availableCount = document.createElement('div');
      availableCount.style.cssText = 'text-align: center; font-size: 13px; color: #6b7280;';
      
      calendarHeader.appendChild(monthYear);
      calendarHeader.appendChild(stepIndicator);
      calendarHeader.appendChild(availableCount);
      container.appendChild(calendarHeader);
      
      // Group available days with time slots
      const availableDays = calendarData.days.filter(day => day.available && day.timeSlots && day.timeSlots.length > 0);
      
      if (availableDays.length === 0) {
        container.innerHTML += '<div style="text-align: center; padding: 20px; color: #666; background: #fef3cd; border-radius: 8px; border: 1px solid #fde047;"><div style="margin-bottom: 8px; font-size: 18px;">⏰</div><div style="font-weight: 500; margin-bottom: 4px;">All slots are currently booked</div><div style="font-size: 13px;">New availability opens regularly. Please check back soon!</div></div>';
        return;
      }
      
      // Update available count
      availableCount.textContent = (calendarData.availableSlots || 0) + ' available slots across ' + availableDays.length + ' days';
      
      // Create main content area for date/time selection
      const contentArea = document.createElement('div');
      contentArea.id = 'calendar-content-area';
      container.appendChild(contentArea);
      
      // Show date selection first
      showDateSelection(contentArea, availableDays, bookingType, stepIndicator);
      
      // Add helpful footer
      const footer = document.createElement('div');
      footer.style.cssText = 'margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;';
      footer.innerHTML = '<div style="margin-bottom: 4px;">All times shown in your local timezone</div><div>Need a different time? <span style="color: ' + currentTheme.primary + '; cursor: pointer;" onclick="sendMessage(\\'I need a different time for my ' + bookingType + '\\')">Contact us</span></div>';
      container.appendChild(footer);
      
    } catch (error) {
      console.error('❌ [WIDGET CALENDAR] Failed to load calendar:', error);
      loadingDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;"><div style="margin-bottom: 8px; font-size: 18px;">⚠️</div><div style="font-weight: 500; margin-bottom: 4px;">Failed to load calendar</div><div style="font-size: 13px; margin-bottom: 12px;">We\\'re having trouble loading available times</div><button onclick="sendMessage(\\'I need help scheduling my ' + bookingType + '\\')" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">Contact Support</button></div>';
    }
  }

  // Helper function to add minutes to time string
  function addMinutesToTime(timeString, minutes) {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return \`\${newHours.toString().padStart(2, '0')}:\${newMins.toString().padStart(2, '0')}\`;
  }

  // Show date selection (Step 1 of calendar)
  function showDateSelection(contentArea, availableDays, bookingType, stepIndicator) {
    console.log("📅 [CALENDAR STEP 1] Showing date selection");
    
    contentArea.innerHTML = '';
    
    // Create horizontal scrollable date container
    const datesContainer = document.createElement('div');
    datesContainer.style.cssText = 'overflow-x: auto; margin-bottom: 16px; padding-bottom: 8px;';
    
    // Create date grid - horizontal layout
    const datesGrid = document.createElement('div');
    datesGrid.style.cssText = 'display: flex; gap: 12px; min-width: fit-content; padding: 4px;';
    
    // Show available dates (limit to 10 for better UX)
    availableDays.slice(0, 10).forEach(day => {
      const dateCard = document.createElement('div');
      dateCard.style.cssText = \`
        background: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
        position: relative;
        overflow: hidden;
        min-width: 120px;
        flex-shrink: 0;
      \`;
      
      const dayName = document.createElement('div');
      dayName.style.cssText = 'font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 4px; text-transform: uppercase;';
      dayName.textContent = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
      
      const dateNumber = document.createElement('div');
      dateNumber.style.cssText = 'font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 4px;';
      dateNumber.textContent = new Date(day.date).getDate();
      
      const monthName = document.createElement('div');
      monthName.style.cssText = 'font-size: 12px; color: #6b7280; margin-bottom: 8px;';
      monthName.textContent = new Date(day.date).toLocaleDateString('en-US', { month: 'short' });
      
      const slotsCount = document.createElement('div');
      slotsCount.style.cssText = 'font-size: 11px; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; display: inline-block;';
      const availableSlots = day.timeSlots.filter(slot => slot.available).length;
      slotsCount.textContent = availableSlots + ' slot' + (availableSlots !== 1 ? 's' : '');
      
      dateCard.appendChild(dayName);
      dateCard.appendChild(dateNumber);
      dateCard.appendChild(monthName);
      dateCard.appendChild(slotsCount);
      
      // Add hover effects
      dateCard.addEventListener('mouseenter', () => {
        dateCard.style.background = \`\${currentTheme.primary}\`;
        dateCard.style.borderColor = \`\${currentTheme.primary}\`;
        dateCard.style.transform = 'translateY(-2px)';
        dateCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        
        // Change text colors on hover
        dayName.style.color = 'rgba(255,255,255,0.8)';
        dateNumber.style.color = 'white';
        monthName.style.color = 'rgba(255,255,255,0.8)';
        slotsCount.style.background = 'rgba(255,255,255,0.2)';
        slotsCount.style.color = 'white';
      });
      
      dateCard.addEventListener('mouseleave', () => {
        dateCard.style.background = '#f8f9fa';
        dateCard.style.borderColor = '#e9ecef';
        dateCard.style.transform = 'translateY(0)';
        dateCard.style.boxShadow = 'none';
        
        // Reset text colors
        dayName.style.color = '#6b7280';
        dateNumber.style.color = '#1f2937';
        monthName.style.color = '#6b7280';
        slotsCount.style.background = '#e3f2fd';
        slotsCount.style.color = '#1976d2';
      });
      
      dateCard.addEventListener('click', () => {
        console.log("📅 [CALENDAR STEP 1] Date selected:", day.date);
        
        // Add click animation
        dateCard.style.transform = 'scale(0.95)';
        setTimeout(() => {
          // Update step indicator
          stepIndicator.innerHTML = '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 8px;">Step 2</span>Select a time';
          
          // Show time slots for selected date
          showTimeSelection(contentArea, day, bookingType, stepIndicator);
        }, 100);
      });
      
      datesGrid.appendChild(dateCard);
    });
    
    datesContainer.appendChild(datesGrid);
    contentArea.appendChild(datesContainer);
    
    // Add helpful text
    const helpText = document.createElement('div');
    helpText.style.cssText = 'text-align: center; font-size: 13px; color: #6b7280; margin-top: 12px;';
    helpText.textContent = 'Scroll horizontally to see more dates • Click on a date to see available time slots';
    contentArea.appendChild(helpText);
  }

  // Show time selection for a specific date (Step 2 of calendar)
  function showTimeSelection(contentArea, selectedDay, bookingType, stepIndicator) {
    console.log("📅 [CALENDAR STEP 2] Showing time selection for:", selectedDay.date);
    
    contentArea.innerHTML = '';
    
    // Selected date header
    const selectedDateHeader = document.createElement('div');
    selectedDateHeader.style.cssText = 'background: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;';
    
    const selectedDateText = document.createElement('div');
    selectedDateText.style.cssText = 'font-weight: 600; color: #0284c7; margin-bottom: 4px;';
    selectedDateText.textContent = new Date(selectedDay.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const changeButton = document.createElement('button');
    changeButton.style.cssText = 'background: none; border: none; color: #6b7280; font-size: 12px; cursor: pointer; text-decoration: underline;';
    changeButton.textContent = 'Change date';
    changeButton.addEventListener('click', () => {
      stepIndicator.innerHTML = '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 8px;">Step 1</span>Select a date';
      // Need to reload the full calendar - trigger a refresh
      location.reload();
    });
    
    selectedDateHeader.appendChild(selectedDateText);
    selectedDateHeader.appendChild(changeButton);
    contentArea.appendChild(selectedDateHeader);
    
    // Time slots grid with improved layout and responsive design
    const timeSlotsGrid = document.createElement('div');
    timeSlotsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-bottom: 16px;';
    
    // Add responsive styles via CSS
    const style = document.createElement('style');
    style.textContent = \`
      @media (min-width: 768px) {
        .time-slots-grid {
          grid-template-columns: repeat(4, 1fr) !important;
        }
      }
      @media (max-width: 480px) {
        .time-slots-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
    \`;
    document.head.appendChild(style);
    timeSlotsGrid.className = 'time-slots-grid';
    
    const availableSlots = selectedDay.timeSlots.filter(slot => slot.available);
    
    if (availableSlots.length === 0) {
      const noSlotsMessage = document.createElement('div');
      noSlotsMessage.style.cssText = 'text-align: center; padding: 20px; color: #666; background: #fef3cd; border-radius: 8px; border: 1px solid #fde047; grid-column: 1 / -1;';
      noSlotsMessage.innerHTML = '<div style="margin-bottom: 8px; font-size: 18px;">⏰</div><div style="font-weight: 500; margin-bottom: 4px;">No available slots</div><div style="font-size: 13px;">Please select a different date</div>';
      timeSlotsGrid.appendChild(noSlotsMessage);
    } else {
      // Group slots by time periods
      const morningSlots = availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 6 && hour < 12;
      });
      
      const afternoonSlots = availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 12 && hour < 17;
      });
      
      const eveningSlots = availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 17 && hour < 22;
      });
      
      // Add time period headers and slots
      if (morningSlots.length > 0) {
        addTimePeriod(timeSlotsGrid, 'Morning', morningSlots, selectedDay, bookingType);
      }
      
      if (afternoonSlots.length > 0) {
        addTimePeriod(timeSlotsGrid, 'Afternoon', afternoonSlots, selectedDay, bookingType);
      }
      
      if (eveningSlots.length > 0) {
        addTimePeriod(timeSlotsGrid, 'Evening', eveningSlots, selectedDay, bookingType);
      }
    }
    
    contentArea.appendChild(timeSlotsGrid);
  }

  // Helper function to add time period sections
  function addTimePeriod(container, periodName, slots, selectedDay, bookingType) {
    // Period header
    const periodHeader = document.createElement('div');
    periodHeader.style.cssText = 'grid-column: 1 / -1; font-weight: 600; color: #374151; margin: 16px 0 12px 0; padding: 8px 12px; background: #f9fafb; border-radius: 6px; font-size: 14px; border-left: 4px solid ' + currentTheme.primary + ';';
    periodHeader.textContent = periodName + ' (' + slots.length + ' available)';
    container.appendChild(periodHeader);
    
    // Time slots
    slots.forEach(slot => {
      const timeButton = document.createElement('button');
      timeButton.textContent = slot.time;
      timeButton.style.cssText = \`
        background: #f8f9fa;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        padding: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 600;
        color: #495057;
        text-align: center;
        position: relative;
        overflow: hidden;
        
        display: flex;
        align-items: center;
        justify-content: center;
      \`;
      
      // Add hover effects
      timeButton.addEventListener('mouseenter', () => {
        timeButton.style.background = \`\${currentTheme.primary}\`;
        timeButton.style.color = 'white';
        timeButton.style.borderColor = \`\${currentTheme.primary}\`;
        timeButton.style.transform = 'translateY(-2px)';
        timeButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      });
      
      timeButton.addEventListener('mouseleave', () => {
        timeButton.style.background = '#f8f9fa';
        timeButton.style.color = '#495057';
        timeButton.style.borderColor = '#dee2e6';
        timeButton.style.transform = 'translateY(0)';
        timeButton.style.boxShadow = 'none';
      });
      
      timeButton.addEventListener('click', () => {
        console.log("📅 [CALENDAR STEP 2] Time selected:", slot.time, "for date:", selectedDay.date);
        
        // Add click animation
        timeButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
          timeButton.style.transform = 'translateY(-2px)';
        }, 100);
        
        handleBookingSelection({ 
          startTime: selectedDay.date + 'T' + slot.time + ':00',
          endTime: selectedDay.date + 'T' + addMinutesToTime(slot.time, 30) + ':00',
          date: selectedDay.date,
          time: slot.time
        }, bookingType);
      });
      
      container.appendChild(timeButton);
    });
  }

  // Handle booking time selection
  async function handleBookingSelection(slot, bookingType) {
    try {
      console.log("📅 [WIDGET BOOKING] Selected slot:", slot);
      if (bookingInProgress) {
        console.log('⏳ [WIDGET BOOKING] Submission in progress, ignoring duplicate click');
        return;
      }
      bookingInProgress = true;

      // Validate that user email is collected
      if (!userBookingData.email) {
        console.error("❌ [WIDGET BOOKING] No email collected");
        alert("Please provide your email address first to book an appointment.");
        return;
      }

      // Show loading state
      const loadingDiv = document.createElement('div');
      loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; color: white;';
      loadingDiv.innerHTML = '<div style="background: white; padding: 20px; border-radius: 8px; color: #333; text-align: center;"><div style="margin-bottom: 8px;">📅</div>Booking your slot...</div>';
      document.body.appendChild(loadingDiv);

      // Extract date and time from slot
      const startDate = new Date(slot.startTime);
      const preferredDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const preferredTime = startDate.toTimeString().slice(0, 5); // HH:MM

      // Submit booking (create or reschedule)
      let response;
      if (isRescheduleMode && currentBookingData) {
        console.log('🔁 [WIDGET BOOKING] Rescheduling existing booking...', currentBookingData);
        const payload = {
          bookingId: currentBookingData?._id || currentBookingData?.id || undefined,
          confirmation: currentBookingData?.confirmationNumber || undefined,
          preferredDate,
          preferredTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        response = await fetch(CHATBOT_API_BASE + '/api/booking', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(CHATBOT_API_BASE + '/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            preferredDate: preferredDate,
            preferredTime: preferredTime,
            bookingType: bookingType,
            name: userBookingData.name || "Anonymous User",
            email: userBookingData.email,
            phone: userBookingData.phone || "",
            company: userBookingData.company || "",
            source: "widget",
            sessionId: sessionId,
            pageUrl: currentPageUrl,
            duration: 30, // Default 30 minute duration
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        });
      }

      document.body.removeChild(loadingDiv);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [WIDGET BOOKING] Booking action successful:", result);

        // 🔥 UPDATE SESSION WITH BOOKING CONFIRMATION FOR CUSTOMER INTELLIGENCE
        try {
          await sendApiRequest('chat', {
            sessionId: sessionId,
            pageUrl: currentPageUrl,
            updateUserProfile: true,
            userEmail: userBookingData.email,
            userName: userBookingData.name,
            bookingConfirmed: true,
            bookingType: bookingType,
            bookingDate: preferredDate,
            bookingTime: preferredTime,
            confirmationNumber: result.data?.confirmationNumber,
            leadStatus: 'converted',
            question: isRescheduleMode
              ? 'Booking rescheduled: ' + bookingType + ' to ' + preferredDate + ' at ' + preferredTime
              : 'Booking confirmed: ' + bookingType + ' on ' + preferredDate + ' at ' + preferredTime
          });

          console.log("✅ [WIDGET BOOKING] Customer intelligence updated with booking confirmation");
        } catch (error) {
          console.warn("⚠️ [WIDGET BOOKING] Failed to update customer intelligence:", error);
        }

        // Hide all calendar elements after successful booking
        const calendarElements = document.querySelectorAll('[id^="booking-calendar-"]');
        calendarElements.forEach(calendar => {
          const parentDiv = calendar.closest('div[style*="background: white; border-radius: 8px;"]');
          if (parentDiv) {
            parentDiv.style.display = 'none';
          }
        });
        
        // Add success message to chat with user details
        const successText = isRescheduleMode
          ? 'All set! ' + userBookingData.name + ', your ' + bookingType + ' has been rescheduled to ' + preferredDate + ' at ' + preferredTime + '.'
          : 'Perfect! ' + userBookingData.name + ', your ' + bookingType + ' is booked for ' + new Date(slot.startTime).toLocaleString() + '. A confirmation email will be sent to ' + userBookingData.email + '. Confirmation: ' + (result.data?.confirmationNumber || 'Pending');
        const successMessage = {
          role: 'assistant',
          content: successText,
          timestamp: new Date().toISOString()
        };
        messages.push(successMessage);
        renderMessages();

        // Exit reschedule mode on success
        if (isRescheduleMode) {
          isRescheduleMode = false;
          currentBookingData = null;
        }

        // Speak confirmation if voice enabled
        if (config.voiceEnabled && speechAllowed) {
          setTimeout(() => {
            speakText(successMessage.content, false);
          }, 500);
        }

      } else {
        const error = await response.json();
        console.error('❌ [WIDGET BOOKING] Booking error response:', error);
        throw new Error(error.error || error.message || 'Booking failed');
      }

    } catch (error) {
      console.error('❌ [WIDGET BOOKING] Booking failed:', error);

      // Add error message to chat with more specific details
      let errorText = "I'm sorry, there was an issue booking that time slot.";
      if (error.message.includes('validation')) {
        errorText = "Please check your booking details and try again.";
      } else if (error.message.includes('conflict') || error.message.includes('no longer available')) {
        errorText = "That time slot is no longer available. Please select a different time.";
      } else if (error.message.includes('email')) {
        errorText = "Please provide a valid email address to complete your booking.";
      }

      const errorMessage = {
        role: 'assistant',
        content: errorText + " You can also contact us directly for assistance.",
        timestamp: new Date().toISOString()
      };
      messages.push(errorMessage);
      renderMessages();
    } finally {
      bookingInProgress = false;
    }
  }

  // Expose simple booking management helpers for testing and integration
  window.appointyBooking = {
    enterRescheduleMode: function(booking) {
      console.log('🔁 [WIDGET] Entering reschedule mode with booking:', booking);
      isRescheduleMode = true;
      currentBookingData = booking || null;
      if (!isOpen) toggleWidget();
      // Force calendar view to help user pick a new time
      renderCalendarForBooking(booking?.requestType || 'demo');
      return true;
    },
    cancelBooking: async function(booking) {
      try {
        const id = booking?._id || booking?.id;
        if (!id) throw new Error('Missing booking id');
        const res = await fetch(CHATBOT_API_BASE + '/api/booking?id=' + encodeURIComponent(id), {
          method: 'DELETE',
          headers: { 'X-API-Key': API_KEY }
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || 'Failed to cancel booking');
        }
        messages.push({ role: 'assistant', content: 'Your appointment has been cancelled. Let me know if you would like to book a new time.', timestamp: new Date().toISOString() });
        renderMessages();
        return true;
      } catch (err) {
        console.error('❌ [WIDGET] Cancel booking failed:', err);
        messages.push({ role: 'assistant', content: 'Sorry, I could not cancel that booking. Please try again.', timestamp: new Date().toISOString() });
        renderMessages();
        return false;
      }
    }
  };

  // Helper to render calendar directly for rescheduling
  function renderCalendarForBooking(bookingType) {
    // Reuse existing flow that opens widget and shows calendar after user data
    if (!isOpen) toggleWidget();
    setTimeout(() => {
      try {
        if (typeof showBookingCalendar === 'function') {
          showBookingCalendar(bookingType || 'demo');
        }
      } catch (e) {
        console.warn('⚠️ [WIDGET] Unable to auto-render calendar for reschedule:', e);
      }
    }, 200);
  }
  
  // Send proactive message with voice and auto-opening
  function sendProactiveMessage(text, buttons = [], emailPrompt = '', messageType = 'PROACTIVE', inputFields = null) {
    if (ONBOARDING_ONLY) {
      if (messageType !== 'PROACTIVE') return;
      if (onboardingProactiveSent) return;
    }
    if (!text) {
      console.log('[ChatWidget] No proactive message text provided');
      return;
    }
    
    // Clear message type logging with distinct colors/emojis
    const typeEmojis = {
      'PROACTIVE': '🎯',
      'CONTEXTUAL_QUESTION': '❓',
      'CONTEXTUAL_RESPONSE': '💡',
      'FOLLOWUP': '⏰'
    };
    
    const emoji = typeEmojis[messageType] || '🎯';
    console.log(emoji + ' [WIDGET ' + messageType + '] Sending ' + messageType.toLowerCase() + ' message:', text.substring(0, 100) + '...');
    if (buttons && buttons.length > 0) {
      console.log(emoji + ' [WIDGET ' + messageType + '] Including buttons:', buttons);
    }
    if (emailPrompt) {
      console.log(emoji + ' [WIDGET ' + messageType + '] Including email prompt:', emailPrompt.substring(0, 50) + '...');
    }
    
    // Update conversation state tracking
    if (!hasBeenGreeted) {
      hasBeenGreeted = true;
      localStorage.setItem('appointy_has_been_greeted', 'true');
    }
    
    proactiveMessageCount++;
    localStorage.setItem('appointy_proactive_count', proactiveMessageCount.toString());
    
    // Track visited pages
    const currentPage = window.location.pathname;
    if (!visitedPages.includes(currentPage)) {
      visitedPages.push(currentPage);
      localStorage.setItem('appointy_visited_pages', JSON.stringify(visitedPages));
    }
    
    // Enrich onboarding messages with greeting and auto-generated rationale for requested details
    // Generic rationale generator
    function getDetailRationale(detail) {
      switch (detail) {
        case 'email': return 'To set you up and send onboarding resources, I need your email.';
        case 'name': return 'To personalize setup and documentation, your name helps.';
        case 'company': return 'To tailor configuration and examples, your company name helps.';
        case 'phone': return 'If you prefer a quick call for setup, a phone number helps.';
        case 'demo_time': return 'To schedule your demo at a convenient time, I need a preferred time.';
        default: return '';
      }
    }

    // Detect requested details from API response and message content
    function detectRequestedDetails(dataObj, textContent, buttonsArr) {
      const lower = (textContent || '').toLowerCase();
      const details = new Set();
      if (dataObj && dataObj.emailPrompt) details.add('email');
      if (/email/.test(lower)) details.add('email');
      if (/name/.test(lower)) details.add('name');
      if (/company|organization/.test(lower)) details.add('company');
      if (/phone|call|number/.test(lower)) details.add('phone');
      if (/demo|schedule|time/.test(lower)) details.add('demo_time');
      if (Array.isArray(buttonsArr) && buttonsArr.length > 0) {
        const btn = buttonsArr.join(' ').toLowerCase();
        if (/demo|schedule|meeting|book/.test(btn)) details.add('demo_time');
      }
      return Array.from(details);
    }

    let finalText = text;
    let finalEmailPrompt = emailPrompt || '';
    let finalInputFields = inputFields || null;
    if (ONBOARDING_ONLY) {
      // Avoid redundant greeting on the very first onboarding message
      const needsGreeting = (messages.length === 0) && (messageType !== 'ONBOARDING');
      const greeting = 'Welcome! I’ll help you get set up.';
      const requestedDetails = detectRequestedDetails({ emailPrompt: finalEmailPrompt }, text, buttons);
     if (requestedDetails.length > 0) {
       const rationaleCombined = requestedDetails.map(getDetailRationale).filter(Boolean).join(' ');
        finalText = (needsGreeting ? greeting + '\\n\\n' : '') + text;
       if (!finalEmailPrompt && requestedDetails.includes('email')) {
         finalEmailPrompt = 'Please enter your email to continue.';
       }
      } else if (needsGreeting) {
        finalText = greeting + '\\n\\n' + text;
      }
      // If onboarding asks for registration bundle, prefer explicit multi-field inputs
      if (!finalInputFields && /name.*email.*password/i.test(text)) {
        finalInputFields = [
          { name: 'fullName', label: 'Your Name', type: 'text', placeholder: 'Jane Doe', rationale: 'We use your name to personalize setup and documentation.', required: true },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com', rationale: 'We use your email to set you up and send onboarding resources.', required: true },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters', rationale: 'We need a password to secure your account.', required: true, minLength: 8 }
        ];
        // Avoid duplicate single email prompt when multi-field inputs are present
        finalEmailPrompt = '';
      }
    }

    const proactiveMessage = {
      role: 'assistant',
      content: finalText,
      buttons: buttons || [],
      emailPrompt: finalEmailPrompt,
      inputFields: finalInputFields,
      isProactive: true
    };
    
    messages.push(proactiveMessage);
    console.log('📝 [WIDGET PROACTIVE] Proactive message added to messages array. Total messages:', messages.length);
    
    // Auto-open chat if configured and currently closed
    if (config.autoOpenProactive && !isOpen) {
      console.log('🚪 [WIDGET PROACTIVE] Auto-opening chat widget for proactive message');
      toggleWidget();
      // Small delay to ensure widget is opened before rendering
      setTimeout(() => {
        renderMessages();
      }, 100);
    } else if (isOpen) {
      console.log('🎨 [WIDGET PROACTIVE] Chat already open, rendering proactive message');
      // Re-render messages if chat is already open
      renderMessages();
    } else {
      console.log('🔒 [WIDGET PROACTIVE] Auto-open disabled, not opening chat for proactive message');
    }
    
    // Only speak if user has already interacted with the page
    if (config.voiceEnabled && speechAllowed) {
      console.log('🔊 [WIDGET PROACTIVE] Speaking proactive message (user interaction detected)');
      // Initialize voices first, then speak
      initializeVoices().then(() => {
        // Small delay to ensure chat is open and visible
        setTimeout(() => {
          speakText(text, true);
          console.log('🎵 [WIDGET PROACTIVE] Speech initiated for proactive message - timer continues independently');
        }, 500);
      });
    } else if (config.voiceEnabled) {
      console.log('🔇 [WIDGET PROACTIVE] Proactive message voice disabled - waiting for user interaction');
    }
    
    // Update bubble if chat is closed (shouldn't happen with auto-open, but just in case)
    if (!isOpen) {
      console.log('🔔 [WIDGET PROACTIVE] Updating bubble for closed chat');
      updateBubble();
    }
    
    // Start follow-up timer after proactive message (independent of speech)
    console.log('⏰ [WIDGET PROACTIVE] Starting follow-up timer after proactive message - runs independently of speech');
    startFollowupTimer();
    if (ONBOARDING_ONLY) {
      onboardingProactiveSent = true;
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
    if (isPageContextLoaded || isPageContextLoading) {
      console.log('📋 [WIDGET CONTEXT] Page context already loaded, skipping');
      return;
    }
    
    try {
      isPageContextLoading = true;
      console.log('🔍 [WIDGET CONTEXT] Loading context for page:', currentPageUrl);
      
      // Extract page summary
      const pageSummary = extractPageSummary();
      console.log('📄 [WIDGET CONTEXT] Page summary extracted:', pageSummary);
      
      // Get page-specific proactive message
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true,
        hasBeenGreeted: hasBeenGreeted,
        proactiveMessageCount: proactiveMessageCount,
        visitedPages: visitedPages,
        pageSummary: pageSummary
        // Don't specify adminId - let the API extract it from the API key
      });
      
      console.log('📨 [WIDGET CONTEXT] API response for proactive request:', data);
      
      // Update bot mode indicator
      if (data.botMode) {
        updateBotModeIndicator(data.botMode, data.userEmail);
      }
      
      if (data.mainText) {
        console.log('✉️ [WIDGET CONTEXT] Received proactive message from API:', data.mainText.substring(0, 100) + '...');
        // In onboarding-only mode, suppress generic proactive message so initializeChat can lead with detail-first prompt
        if (ONBOARDING_ONLY) {
          console.log('🛑 [WIDGET CONTEXT] Onboarding-only mode: suppressing generic proactive message');
        } else if (config.autoOpenProactive || isOpen) {
          const reason = isOpen ? '💬 [WIDGET CONTEXT] Chat is open, rendering proactive message' : '🎯 [WIDGET CONTEXT] Auto-open enabled, sending proactive message';
          console.log(reason);
          sendProactiveMessage(data.mainText, data.buttons || [], data.emailPrompt || '', 'PROACTIVE');
        } else {
          console.log('🔒 [WIDGET CONTEXT] Auto-open disabled and chat closed, not sending proactive message');
        }
        isPageContextLoaded = true;
        console.log('✅ [WIDGET CONTEXT] Page context loaded successfully');
        console.log('🔀 [WIDGET FLOW] ===== INITIAL PROACTIVE MESSAGE FLOW COMPLETE =====');
      } else {
        console.log('❌ [WIDGET CONTEXT] No proactive message received from API');
        console.log('🔍 [WIDGET CONTEXT] Full API response:', data);
      }
    } catch (error) {
      console.error('❌ [WIDGET CONTEXT] Failed to load page context:', error);
    } finally {
      isPageContextLoading = false;
    }
  }
  
  // Update bot mode indicator
  function updateBotModeIndicator(botMode, userEmail) {
    const indicator = document.getElementById('appointy-bot-mode-indicator');
    if (!indicator) return;
    
    console.log('[Widget] Updating bot mode indicator:', { botMode, userEmail });
    if (ONBOARDING_ONLY) {
      indicator.style.backgroundColor = '#10b981';
      indicator.title = 'Onboarding Mode';
      return;
    }
    
    if (botMode === 'sales') {
      indicator.style.backgroundColor = '#4caf50'; // Green for sales
      indicator.title = userEmail ? \`Sales Mode • \${userEmail}\` : 'Sales Mode';
    } else {
      indicator.style.backgroundColor = '#7b1fa2'; // Purple for lead
      indicator.title = 'Lead Mode';
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
  
  // Initialize mirror iframe
  function initializeMirror() {
    if (!mirrorEnabled || !isOpen) {
      console.log('🔍 [WIDGET MIRROR] Mirror not enabled or widget not open', { mirrorEnabled, isOpen });
      return;
    }
    
    console.log('🔍 [WIDGET MIRROR] Initializing page mirror');
    
    mirrorIframe = document.getElementById('appointy-mirror');
    if (!mirrorIframe) {
      console.error('❌ [WIDGET MIRROR] Mirror iframe element not found!');
      return;
    }
    
    console.log('✅ [WIDGET MIRROR] Mirror iframe element found');
    
    // Load current page in mirror
    mirrorIframe.src = window.location.href;
    console.log('🔄 [WIDGET MIRROR] Loading mirror with URL:', window.location.href);
    
    // Add load event listener
    mirrorIframe.addEventListener('load', () => {
      console.log('✅ [WIDGET MIRROR] Mirror iframe loaded successfully');
      
      // Make mirror more visible for testing
      mirrorIframe.style.opacity = '1';
      mirrorIframe.style.border = '2px solid red'; // Temporary debug border
      
      setTimeout(() => {
        // Remove debug border after 3 seconds
        mirrorIframe.style.border = '0';
        mirrorIframe.style.opacity = '0.8';
      }, 3000);
    });
    
    mirrorIframe.addEventListener('error', (e) => {
      console.error('❌ [WIDGET MIRROR] Mirror iframe failed to load:', e);
    });
    
    // Setup scroll synchronization
    setupScrollSync();
    
    // Setup section observation
    setupSectionObserver();
    
    // Setup smart scroll detection for delayed contextual questions
    setupSmartScrollDetection();
    
    // Scale mirror if needed
    setTimeout(() => {
      scaleMirror();
    }, 1000);
    
    console.log('✅ [WIDGET MIRROR] Mirror initialized');
  }
  
  // Setup scroll synchronization
  function setupScrollSync() {
    if (!mirrorIframe) return;
    
    console.log('🔄 [WIDGET MIRROR] Setting up scroll sync');
    
    const sendScrollUpdate = () => {
      if (!mirrorIframe || !mirrorIframe.contentWindow) return;
      
      const scrollData = {
        type: 'sync_scroll',
        x: window.scrollX,
        y: window.scrollY,
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        timestamp: Date.now()
      };
      
      try {
        mirrorIframe.contentWindow.postMessage(scrollData, window.location.origin);
      } catch (error) {
        console.warn('[WIDGET MIRROR] Failed to send scroll update:', error);
      }
      
      scrollRaf = null;
    };
    
    const onScroll = () => {
      const dx = Math.abs(window.scrollX - lastScrollX);
      const dy = Math.abs(window.scrollY - lastScrollY);
      
      lastScrollX = window.scrollX;
      lastScrollY = window.scrollY;
      
      if (!scrollRaf && (dx + dy) > 0) {
        scrollRaf = requestAnimationFrame(sendScrollUpdate);
      }
      
      // Check if user entered a new section
      checkViewportSection();
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Send initial scroll position
    setTimeout(sendScrollUpdate, 500);
  }
  
  // Smart scroll detection variables
  let isScrolling = false;
  let scrollTimeout;
  let lastScrollTime = 0;
  let scrollStopDelay = 60000; // 60 seconds (1 minute) delay after scrolling stops
  let lastScrollPosition = 0;
  
  // Setup smart scroll detection
  function setupSmartScrollDetection() {
    console.log('🧠 [WIDGET SCROLL] Setting up smart scroll detection');
    
    function handleScroll() {
      const currentTime = Date.now();
      const currentScrollPosition = window.scrollY;
      
      // Detect if user is actively scrolling
      if (Math.abs(currentScrollPosition - lastScrollPosition) > 10) {
        isScrolling = true;
        lastScrollTime = currentTime;
        lastScrollPosition = currentScrollPosition;
        
        console.log('📜 [WIDGET SCROLL] User is actively scrolling - delaying messages');
        
        // Clear any existing timeout
        clearTimeout(scrollTimeout);
        
        // Mark user as active (prevents followup messages)
        userIsActive = true;
        
        // Set timeout to detect when scrolling stops
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
          userIsActive = false;
          
          console.log('⏸️ [WIDGET SCROLL] User stopped scrolling - checking current view');
          
          // Generate contextual question based on current viewport
          handleScrollStop();
          
        }, scrollStopDelay);
      }
    }
    
    // Handle when user stops scrolling
    function handleScrollStop() {
      const currentSection = getCurrentVisibleSection();
      const viewportContext = getViewportContext();
      
      console.log('🎯 [WIDGET SCROLL] Scroll stopped on section:', currentSection);
      
      if (currentSection && viewportContext.visibleElements.length > 0) {
        const sectionData = {
          sectionName: currentSection,
          sectionContent: extractSectionContent(document.body),
          scrollPosition: window.scrollY,
          scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
          timeOnPage: Date.now() - (window.appointyPageLoadTime || Date.now()),
          viewportContext: viewportContext,
          triggeredByScrollStop: true
        };
        
        // Generate and send contextual question immediately
        generateContextualQuestionForScrollStop(sectionData);
      }
    }
    
    // Get the most visible section in current viewport
    function getCurrentVisibleSection() {
      const sections = document.querySelectorAll('[data-section], .section, .hero, .pricing, .features, .testimonials, .contact, section, article');
      let mostVisibleSection = null;
      let maxVisibility = 0;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const sectionHeight = rect.height;
        
        if (sectionHeight > 0) {
          const visibilityPercentage = visibleHeight / Math.min(sectionHeight, viewportHeight);
          
          if (visibilityPercentage > maxVisibility && visibilityPercentage > 0.3) {
            maxVisibility = visibilityPercentage;
            mostVisibleSection = getSectionName(section);
          }
        }
      });
      
      return mostVisibleSection || currentViewportSection;
    }
    
    // Add scroll event listener with throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  // Generate contextual question specifically for scroll stop
  // AI-powered contextual question generation
  async function generateAiContextualQuestion(sectionName, visibleContent, scrollPercentage, sectionData) {
    if (ONBOARDING_ONLY) {
      return null;
    }
    console.log('🔀 [WIDGET FLOW] ===== SCHEDULING AI CONTEXTUAL QUESTION GENERATION =====');
    try {
      console.log('🤖 [WIDGET AI] Scheduling contextual question generation for:', sectionName);
      
      // Check if another contextual message delay is already active
      if (contextualMessageDelayActive) {
        console.log('⏸️ [WIDGET AI] Another contextual message delay is active, skipping AI question');
        return null;
      }
      
      // Set delay flag to prevent other contextual messages
      contextualMessageDelayActive = true;
      console.log('🚩 [WIDGET AI] Setting contextualMessageDelayActive flag to prevent interference');
      
      // Enhanced content context for AI with richer data
      const contentForAi = {
        sectionName: sectionName,
        
        // Rich text content
        visibleText: visibleContent.visibleElements
          .map(el => el.text)
          .filter(text => text && text.length > 5)
          .join(' ')
          .substring(0, 1500), // Increased limit for richer context
        
        // Enhanced content analysis
        contentSummary: visibleContent.contentSummary,
        
        // Element-specific insights
        headings: visibleContent.visibleElements
          .filter(el => el.contentType === 'heading')
          .map(el => el.text)
          .slice(0, 5),
          
        ctaElements: visibleContent.visibleElements
          .filter(el => el.isCTA)
          .map(el => el.text)
          .slice(0, 3),
          
        pricingInfo: visibleContent.visibleElements
          .filter(el => el.isPricing)
          .map(el => el.text)
          .slice(0, 3),
          
        features: visibleContent.visibleElements
          .filter(el => el.isFeature)
          .map(el => el.text)
          .slice(0, 5),
          
        testimonials: visibleContent.visibleElements
          .filter(el => el.isTestimonial)
          .map(el => el.text)
          .slice(0, 2),
        
        // Content flags for AI understanding
        contentTypes: visibleContent.contentSummary.contentTypes,
        scrollPosition: scrollPercentage,
        
        // Semantic insights
        primaryContentType: determinePrimaryContentType(visibleContent),
        businessStage: determineBusinessStage(visibleContent, scrollPercentage)
      };

      // Wait 10 seconds before making the API request for contextual question
      setTimeout(async () => {
        console.log('🎯 [WIDGET AI] 10-second delay complete, NOW making API request for contextual question');
        
        try {
          // NOW make the API request (after the delay, not before)
          const data = await sendApiRequest('chat', {
            sessionId: sessionId, // Include the session ID
            pageUrl: currentPageUrl, // Include current page URL
            question: 'Generate a contextual question based on the content analysis', // Provide a question
            
            // AI-specific parameters for contextual question generation
            contextualQuestionGeneration: true,
            contextualPageContext: {
              sectionName: sectionName,
              sectionData: sectionData,
              contentAnalysis: contentForAi,
              pageUrl: currentPageUrl,
              timestamp: new Date().toISOString()
            },
            
            // Legacy parameters for compatibility
            sectionContext: sectionData,
            contextual: true,
            proactive: true,
            sectionName: sectionName,
            sectionAnalysis: contentForAi,
            requestType: 'generate_contextual_question',
            instruction: 'Generate a specific, helpful question based on what the user is currently viewing. Consider the content type, business stage, and visible elements to create an engaging, relevant question that encourages meaningful conversation.',
            
            // Additional context for better AI response
            hasBeenGreeted: hasBeenGreeted,
            proactiveMessageCount: proactiveMessageCount
          });

          if (data && data.mainText && data.mainText.trim()) {
            console.log('✅ [WIDGET AI] AI generated question:', data.mainText);
            
            // 🎯 TWO-MESSAGE APPROACH: Use the full response as the question for contextual response generation
            const fullResponse = data.mainText.trim();
            
            // Use the full response as the contextual question
            const question = fullResponse;
            
            console.log('📤 [WIDGET AI] Displaying question:', question);
            
            // First, send the contextual question
            sendProactiveMessage(question, [], '', 'CONTEXTUAL_QUESTION');
            
            // Wait 3 seconds, then generate and send the proper response to this question
            setTimeout(async () => {
              try {
                console.log('🤖 [WIDGET AI] Generating response to contextual question:', question);
                
                // Generate a proper response to the contextual question
                const responseData = await sendApiRequest('chat', {
                  sessionId: sessionId,
                  pageUrl: currentPageUrl,
                  question: question, // Use the contextual question as the user's question
                  message: question,
                  contextualResponse: true,
                  contextualQuestion: question, // Add this for the API handler
                  sectionContext: sectionData,
                  contextual: true,
                  hasBeenGreeted: hasBeenGreeted,
                  proactiveMessageCount: proactiveMessageCount
                });
              
                if (responseData && responseData.mainText && responseData.mainText.trim()) {
                  console.log('📤 [WIDGET AI] Displaying proper AI-generated response to contextual question:', responseData.mainText);
                  sendProactiveMessage(responseData.mainText, responseData.buttons || [], responseData.emailPrompt || '', 'CONTEXTUAL_RESPONSE');
                } else {
                  // Fallback: Use the question with buttons if response generation fails
                  console.log('📤 [WIDGET AI] Using fallback response with buttons:', question);
                  sendProactiveMessage(question, data.buttons || [], data.emailPrompt || '', 'CONTEXTUAL_RESPONSE');
                }
              } catch (error) {
                console.error('❌ [WIDGET AI] Error generating contextual response:', error);
                // Fallback: Use the original question with buttons if response generation fails
                console.log('📤 [WIDGET AI] Using fallback response due to error:', question);
                sendProactiveMessage(question, data.buttons || [], data.emailPrompt || '', 'CONTEXTUAL_RESPONSE');
              }
            
            console.log('🚩 [WIDGET AI] Resetting contextualMessageDelayActive flag after contextual message completion');
              contextualMessageDelayActive = false; // Reset flag after both messages are sent
              console.log('🔀 [WIDGET FLOW] ===== CONTEXTUAL QUESTION/RESPONSE FLOW COMPLETE =====');
            }, 60000); // one minute delay before generating response
            
            return question;
          } else {
            console.log('❌ [WIDGET AI] No valid response from API');
            contextualMessageDelayActive = false;
          }
        } catch (error) {
        console.error('❌ [WIDGET AI] Error making API request:', error);
        contextualMessageDelayActive = false;
      }
    }, 60000); // one minute delay before making API request
    
    return true; // Return true to indicate processing will happen after delay
  } catch (error) {
    console.warn('⚠️ [WIDGET AI] Error in AI question generation setup:', error);
    contextualMessageDelayActive = false;
  }
  return null;
  }
  
  // Determine primary content type from visible elements
  function determinePrimaryContentType(visibleContent) {
    const summary = visibleContent.contentSummary;
    
    if (summary.hasPricing) return 'pricing';
    if (summary.hasCTA) return 'conversion';
    if (summary.hasTestimonials) return 'social_proof';
    if (summary.hasFeatures) return 'features';
    if (summary.hasMedia) return 'media_rich';
    
    // Analyze content types
    const types = summary.contentTypes;
    if (types.includes('heading') && types.includes('paragraph')) return 'informational';
    if (types.includes('form')) return 'lead_capture';
    if (types.includes('list')) return 'structured_content';
    
    return 'general';
  }
  
  // Determine business funnel stage
  function determineBusinessStage(visibleContent, scrollPercentage) {
    const summary = visibleContent.contentSummary;
    
    // Decision stage indicators
    if (summary.hasPricing || summary.hasCTA) return 'decision';
    
    // Consideration stage indicators  
    if (summary.hasTestimonials || summary.hasFeatures) return 'consideration';
    
    // Top of page usually awareness
    if (scrollPercentage < 25) return 'awareness';
    
    // Deep scroll suggests evaluation
    if (scrollPercentage > 75) return 'evaluation';
    
    return 'consideration';
  }

  async function generateContextualQuestionForScrollStop(sectionData) {
    const { sectionName, viewportContext, scrollPercentage } = sectionData;
    let question = '';
    
    console.log('🤔 [WIDGET SCROLL] Generating question for:', sectionName, 'with', viewportContext.visibleElements.length, 'visible elements');
    
    // Try AI first
    try {
      const aiQuestion = await generateAiContextualQuestion(sectionName, viewportContext, scrollPercentage, sectionData);
      if (aiQuestion) {
        console.log('🤖 [WIDGET SCROLL] AI successfully generated and displayed question - returning');
        return; // AI function already handles display, no need to continue
      }
    } catch (error) {
      console.warn('⚠️ [WIDGET SCROLL] AI generation failed, using fallback:', error);
    }
    
    // Fallback to improved rule-based questions (case-insensitive)
    if (!question) {
      console.log('🔄 [WIDGET SCROLL] Using fallback rule-based questions');
      const sectionLower = sectionName.toLowerCase();
      
      if (sectionLower.includes('pricing') || viewportContext.visibleElements.some(el => el.isPricing)) {
        const questions = [
          "I see you're looking at our pricing. Which plan interests you most?",
          "Have questions about what's included in these plans?",
          "Would you like me to help you choose the right plan for your needs?",
          "Curious about our ROI or want to see a cost comparison?"
        ];
        question = questions[Math.floor(Math.random() * questions.length)];
        console.log('🎯 [WIDGET SCROLL] Matched PRICING section');
      } 
      else if (sectionLower.includes('feature') || sectionLower.includes('benefit')) {
        const questions = [
          "Which of these features would be most valuable for your workflow?",
          "Want to see how this feature works in practice?",
          "How are you currently handling this in your organization?",
          "Would a demo of these features be helpful?"
        ];
        question = questions[Math.floor(Math.random() * questions.length)];
        console.log('🎯 [WIDGET SCROLL] Matched FEATURES section');
      }
      else if (sectionLower.includes('testimonial') || sectionLower.includes('review')) {
        const questions = [
          "Are you curious about achieving similar results for your business?",
          "Would you like to speak with one of these customers?",
          "What specific outcomes are you hoping to achieve?",
          "How do these results compare to your current situation?"
        ];
        question = questions[Math.floor(Math.random() * questions.length)];
        console.log('🎯 [WIDGET SCROLL] Matched TESTIMONIALS section');
      }
      else if (sectionLower.includes('contact') || sectionLower.includes('form') || viewportContext.visibleElements.some(el => el.isForm)) {
        const questions = [
          "Ready to get started? I can help you with any questions.",
          "Would you like assistance filling out this form?",
          "Have any questions before taking the next step?",
          "What's the best way to get you set up?"
        ];
        question = questions[Math.floor(Math.random() * questions.length)];
        console.log('🎯 [WIDGET SCROLL] Matched CONTACT section');
      }
      else if (sectionLower.includes('hero') || scrollPercentage < 20) {
        const questions = [
          "What brought you here today? I can help you find what you need.",
          "Are you looking for a specific solution?",
          "Would you like me to show you our most popular features?",
          "What challenges are you hoping to solve?"
        ];
        question = questions[Math.floor(Math.random() * questions.length)];
        console.log('🎯 [WIDGET SCROLL] Matched HERO section');
      }
      else {
        // Generic contextual questions based on visible content
        const visibleText = viewportContext.visibleElements
          .map(el => el.text)
          .join(' ')
          .toLowerCase();
        
        if (visibleText.includes('demo') || visibleText.includes('trial')) {
          question = "Interested in seeing a demo or starting a free trial?";
        } else if (visibleText.includes('integrate') || visibleText.includes('api')) {
          question = "Have questions about integration or our API capabilities?";
        } else if (visibleText.includes('support') || visibleText.includes('help')) {
          question = "Looking for support information? I can help you right now.";
        } else {
          question = "What questions do you have about what you're reading?";
        }
        console.log('⚠️ [WIDGET SCROLL] Using GENERIC fallback question');
      }
    }
    
    console.log('💡 [WIDGET SCROLL] Final question:', question);
    
    // Send the question to the API
    if (question) {
      sendScrollBasedQuestion(question, sectionData);
    }
  }
  
  // Send scroll-based contextual question to API
  async function sendScrollBasedQuestion(question, sectionData) {
    console.log('📤 [WIDGET SCROLL] Sending scroll-based question to API:', question);
    
    try {
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        question: question,
        sectionContext: sectionData,
        contextual: true,
        scrollTriggered: true, // Flag to indicate this was triggered by scroll
        hasBeenGreeted: hasBeenGreeted,
        proactiveMessageCount: proactiveMessageCount
      });
      
      if ((data.mainText && data.mainText.trim()) || (data.answer && data.answer.trim())) {
        const messageText = data.mainText || data.answer;
        const buttons = data.buttons || [];
        const emailPrompt = data.emailPrompt || '';
        
        console.log('🎯 [WIDGET SCROLL] Received scroll-based response, adding 2-minute delay before displaying');
        
        // Add 2-minute delay before displaying the response
        setTimeout(() => {
          console.log('🎯 [WIDGET SCROLL] 2-minute delay complete, now displaying message');
          
          // Create structured contextual question data
          const contextualQuestionData = {
            mainText: messageText,
            buttons: buttons,
            emailPrompt: emailPrompt,
            isContextual: true,
            sectionData: sectionData
          };
          
          // Send the proactive message
          sendProactiveMessage(messageText, buttons, emailPrompt);
          
          // Start auto-response timer for contextual questions
          if (buttons && buttons.length > 0) {
            console.log('🕐 [WIDGET AUTO] Starting 60-second auto-response timer for contextual question');
            startAutoResponseTimer(contextualQuestionData);
          }
        }, 120000); // 2-minute delay before displaying the response
      }
    } catch (error) {
      console.error('❌ [WIDGET SCROLL] Failed to send scroll-based question:', error);
    }
  }

  // Setup section observation for contextual messages
  function setupSectionObserver() {
    if (!window.IntersectionObserver) return;
    
    console.log('👁️ [WIDGET MIRROR] Setting up section observer');
    
    // Observe major page sections
    const sectionsToObserve = [
      'header', 'nav', 'main', 'footer',
      '[data-section]', '.section', '.hero', '.pricing', '.features', '.testimonials', '.contact',
      'section', 'article', '.about', '.services', '.products'
    ];
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px', // Only trigger when section is well within viewport
      threshold: 0.3
    };
    
    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const sectionName = getSectionName(element);
          
          if (sectionName !== currentViewportSection) {
            console.log('📍 [WIDGET MIRROR] User entered section:', sectionName);
            currentViewportSection = sectionName;
            onSectionEnter(sectionName, element);
          }
        }
      });
    }, observerOptions);
    
    // Start observing relevant elements
    sectionsToObserve.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        sectionObserver.observe(element);
      });
    });
  }
  
  // Get meaningful section name
  function getSectionName(element) {
    // Check for data attributes first
    if (element.dataset.section) return element.dataset.section;
    if (element.dataset.component) return element.dataset.component;
    
    // Check for ID
    if (element.id) return element.id;
    
    // Check for class names that indicate purpose
    const meaningfulClasses = ['hero', 'pricing', 'features', 'testimonials', 'contact', 'about', 'services', 'products'];
    for (const className of meaningfulClasses) {
      if (element.classList.contains(className)) return className;
    }
    
    // Check for header text content
    const heading = element.querySelector('h1, h2, h3');
    if (heading && heading.textContent) {
      return heading.textContent.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
    }
    
    // Fallback to tag name
    return element.tagName.toLowerCase();
  }
  
  // Handle section entrance
  function onSectionEnter(sectionName, element) {
    // Skip section messages if user is actively scrolling
    if (isScrolling) {
      console.log('📜 [WIDGET MIRROR] Skipping section message - user is actively scrolling');
      return;
    }
    
    // Only send contextual messages if user isn't currently chatting
    if (lastUserMessage && (Date.now() - lastUserMessage > 10000) && !userIsActive) {
      // Send contextual data to API for potential proactive messages
      const sectionData = {
        sectionName,
        sectionContent: extractSectionContent(element),
        scrollPosition: window.scrollY,
        scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
        timeOnPage: Date.now() - (window.appointyPageLoadTime || Date.now()),
        viewportContext: getViewportContext()
      };
      
      console.log('📊 [WIDGET MIRROR] Section data for', sectionName, ':', sectionData);
      
      // Generate contextual questions immediately (but only if not scrolling)
      generateContextualQuestions(sectionData);
      
      // Debounce section-based proactive messages
      clearTimeout(window.appointySectionTimeout);
      window.appointySectionTimeout = setTimeout(() => {
        sendSectionContextToAPI(sectionData);
      }, 3000); // Wait 3 seconds before sending section context
    }
  }
  
  // Get current viewport context
  function getViewportContext() {
    const viewportHeight = window.innerHeight;
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + viewportHeight;
    const scrollPercentage = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    
    // Enhanced element selectors for better content detection
    const selectors = [
      // Core content elements
      'h1, h2, h3, h4, h5, h6, p, form, button, a',
      
      // Business intent elements
      '[class*="cta"], [class*="call-to-action"], [class*="signup"], [class*="trial"]',
      '[class*="get-started"], [class*="contact"], [class*="demo"], [class*="free"]',
      
      // Content structure
      'article, section, main, aside, [role="main"], [role="article"]',
      'header, nav, footer, [role="banner"], [role="navigation"]',
      
      // Pricing & product elements
      '[data-price], .price, .pricing, [class*="plan"], [class*="package"]',
      '[class*="tier"], [class*="product"], [class*="service"], [class*="cost"]',
      
      // Social proof elements
      '[class*="testimonial"], [class*="review"], [class*="customer"]',
      '[class*="case-study"], [class*="quote"], [class*="feedback"]',
      
      // Features & benefits
      '.feature, .benefit, [class*="feature"], [class*="benefit"]',
      '[class*="advantage"], [class*="value"], [class*="capability"]',
      
      // Media & rich content
      'img[alt], figure, figcaption, video, [class*="hero"]',
      '[class*="banner"], [class*="media"], [class*="image"]',
      
      // Lists and structured content
      'ul, ol, li, dl, dt, dd, [class*="list"]'
    ].join(', ');
    
    // Find all visible elements
    const visibleElements = [];
    const elements = document.querySelectorAll(selectors);
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = viewportTop + rect.top;
      const elementBottom = elementTop + rect.height;
      
      // Check if element is at least 20% visible in viewport (reduced threshold for better detection)
      const visibleHeight = Math.min(elementBottom, viewportBottom) - Math.max(elementTop, viewportTop);
      const visibilityPercentage = visibleHeight / rect.height;
      
      if (visibilityPercentage > 0.2 && rect.height > 10) { // Also filter out very small elements
        const elementData = {
          tagName: el.tagName.toLowerCase(),
          text: extractElementText(el),
          className: el.className,
          id: el.id,
          
          // Enhanced element classification
          isButton: isButtonElement(el),
          isForm: el.tagName.toLowerCase() === 'form',
          isPricing: isPricingElement(el),
          isCTA: isCTAElement(el),
          isTestimonial: isTestimonialElement(el),
          isFeature: isFeatureElement(el),
          isMedia: isMediaElement(el),
          isList: isListElement(el),
          
          // Additional context
          href: el.href || null,
          alt: el.alt || null,
          role: el.getAttribute('role'),
          visibilityPercentage: Math.round(visibilityPercentage * 100),
          
          // Content hierarchy
          semanticLevel: getSemanticLevel(el),
          contentType: classifyContentType(el)
        };
        
        visibleElements.push(elementData);
      }
    });
    
    // Sort by visibility and semantic importance
    visibleElements.sort((a, b) => {
      const aImportance = a.semanticLevel * 10 + a.visibilityPercentage;
      const bImportance = b.semanticLevel * 10 + b.visibilityPercentage;
      return bImportance - aImportance;
    });
    
    return {
      visibleElements: visibleElements.slice(0, 15), // Increased limit for richer context
      scrollDepth: scrollPercentage,
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: viewportHeight,
      
      // Enhanced context summary
      contentSummary: {
        totalElements: visibleElements.length,
        contentTypes: [...new Set(visibleElements.map(el => el.contentType))],
        hasPricing: visibleElements.some(el => el.isPricing),
        hasCTA: visibleElements.some(el => el.isCTA),
        hasTestimonials: visibleElements.some(el => el.isTestimonial),
        hasFeatures: visibleElements.some(el => el.isFeature),
        hasMedia: visibleElements.some(el => el.isMedia)
      }
    };
  }
  
  // Helper functions for enhanced element classification
  function extractElementText(el) {
    let text = el.textContent.trim();
    
    // For images, use alt text
    if (el.tagName.toLowerCase() === 'img' && el.alt) {
      text = '[Image: ' + el.alt + ']';
    }
    
    // For videos, add context
    if (el.tagName.toLowerCase() === 'video') {
      text = '[Video: ' + (el.title || 'Video content') + ']';
    }
    
    // Limit text length but keep it meaningful
    return text.substring(0, 300);
  }
  
  function isButtonElement(el) {
    return el.tagName.toLowerCase() === 'button' || 
           el.getAttribute('role') === 'button' ||
           (el.tagName.toLowerCase() === 'a' && el.className.includes('btn'));
  }
  
  function isPricingElement(el) {
    const classNames = el.className.toLowerCase();
    const text = el.textContent.toLowerCase();
    return classNames.includes('price') || 
           classNames.includes('plan') || 
           classNames.includes('tier') ||
           classNames.includes('package') ||
           el.hasAttribute('data-price') ||
           /\$[\d,]+/.test(text) || // Contains dollar amounts
           text.includes('/month') ||
           text.includes('/year');
  }
  
  function isCTAElement(el) {
    const classNames = el.className.toLowerCase();
    const text = el.textContent.toLowerCase();
    return classNames.includes('cta') ||
           classNames.includes('call-to-action') ||
           classNames.includes('signup') ||
           classNames.includes('get-started') ||
           text.includes('get started') ||
           text.includes('sign up') ||
           text.includes('contact') ||
           text.includes('try free') ||
           text.includes('demo');
  }
  
  function isTestimonialElement(el) {
    const classNames = el.className.toLowerCase();
    return classNames.includes('testimonial') ||
           classNames.includes('review') ||
           classNames.includes('customer') ||
           classNames.includes('quote') ||
           classNames.includes('feedback');
  }
  
  function isFeatureElement(el) {
    const classNames = el.className.toLowerCase();
    return classNames.includes('feature') ||
           classNames.includes('benefit') ||
           classNames.includes('advantage') ||
           classNames.includes('capability') ||
           classNames.includes('value');
  }
  
  function isMediaElement(el) {
    const tagName = el.tagName.toLowerCase();
    const classNames = el.className.toLowerCase();
    return tagName === 'img' ||
           tagName === 'video' ||
           tagName === 'figure' ||
           classNames.includes('hero') ||
           classNames.includes('banner') ||
           classNames.includes('media');
  }
  
  function isListElement(el) {
    const tagName = el.tagName.toLowerCase();
    return tagName === 'ul' || tagName === 'ol' || tagName === 'li';
  }
  
  function getSemanticLevel(el) {
    const tagName = el.tagName.toLowerCase();
    const classNames = el.className.toLowerCase();
    
    // Higher numbers = higher importance
    if (tagName === 'h1') return 10;
    if (tagName === 'h2') return 8;
    if (tagName === 'h3') return 6;
    if (classNames.includes('cta') || classNames.includes('pricing')) return 9;
    if (tagName === 'button' || el.getAttribute('role') === 'button') return 7;
    if (tagName === 'form') return 8;
    if (classNames.includes('testimonial')) return 5;
    if (tagName === 'p') return 3;
    return 1;
  }
  
  function classifyContentType(el) {
    if (isPricingElement(el)) return 'pricing';
    if (isCTAElement(el)) return 'cta';
    if (isTestimonialElement(el)) return 'testimonial';
    if (isFeatureElement(el)) return 'feature';
    if (isMediaElement(el)) return 'media';
    if (el.tagName.toLowerCase().startsWith('h')) return 'heading';
    if (el.tagName.toLowerCase() === 'p') return 'paragraph';
    if (isListElement(el)) return 'list';
    if (el.tagName.toLowerCase() === 'form') return 'form';
    return 'content';
  }
  
  // Generate contextual questions based on what user is viewing
  async function generateContextualQuestions(sectionData) {
    const questions = [];
    const { sectionName, sectionContent, viewportContext } = sectionData;
    
    console.log('🤔 [WIDGET QUESTIONS] Generating questions for section:', sectionName);
    console.log('📊 [WIDGET QUESTIONS] Viewport context:', viewportContext);
    
    // Check if another contextual message delay is already active
    if (contextualMessageDelayActive) {
      console.log('⏸️ [WIDGET QUESTIONS] Another contextual message delay is active, skipping AI question generation');
      return;
    }
    
    console.log('🔀 [WIDGET FLOW] ===== STARTING CONTEXTUAL QUESTION GENERATION =====');
    
    // Try AI first for more intelligent questions
    let aiQuestion = null;
    try {
      aiQuestion = await generateAiContextualQuestion(sectionName, viewportContext, sectionData.scrollPercentage, sectionData);
      if (aiQuestion) {
        console.log('🤖 [WIDGET QUESTIONS] AI successfully generated and displayed question - returning');
        return; // AI function already handles display with proper timing, no need to continue
      }
    } catch (error) {
      console.warn('⚠️ [WIDGET QUESTIONS] AI generation failed, using fallback:', error);
    }
    
    // Fallback to rule-based questions (case-insensitive)
    const sectionLower = sectionName.toLowerCase();
    
    // Pricing section questions
    if (sectionLower.includes('pricing') || sectionContent.hasPricing) {
      questions.push(
        "Which pricing plan fits your team size?",
        "Would you like me to calculate the ROI for your use case?",
        "Do you have questions about what's included in each plan?",
        "Need help comparing our plans with competitors?"
      );
    }
    
    // Features section questions
    else if (sectionLower.includes('features') || sectionLower.includes('capabilities')) {
      questions.push(
        "Which of these features is most important for your workflow?",
        "Would you like to see a demo of any specific feature?",
        "How does your current solution handle these requirements?",
        "Do you need integration with any specific tools?"
      );
    }
    
    // Contact/Form section questions
    else if (sectionContent.hasForm || sectionLower.includes('contact')) {
      questions.push(
        "Would you like me to help you fill out this form?",
        "Do you prefer to schedule a call instead?",
        "What's the best time to reach you?",
        "Any specific questions I can answer before you submit?"
      );
    }
    
    // About/Company section questions
    else if (sectionLower.includes('about') || sectionLower.includes('company') || sectionLower.includes('mission')) {
      questions.push(
        "What drew you to learn more about our company?",
        "Are you evaluating us against other solutions?",
        "What's most important in a vendor partnership for you?",
        "Would you like to speak with someone from our team?"
      );
    }
    
    // Testimonials section questions
    else if (sectionLower.includes('testimonial') || sectionLower.includes('review') || sectionLower.includes('customer')) {
      questions.push(
        "Do any of these use cases sound similar to yours?",
        "Would you like to speak with one of our existing customers?",
        "What results are you hoping to achieve?",
        "How do you currently measure success in this area?"
      );
    }
    
    // Product/Solution section questions
    else if (sectionLower.includes('product') || sectionLower.includes('solution') || sectionLower.includes('how-it-works')) {
      questions.push(
        "How does this compare to your current process?",
        "What's your biggest challenge in this area?",
        "Would you like to see this in action?",
        "Do you have specific requirements I should know about?"
      );
    }
    
    // Default questions based on content type
    else {
      // Check visible elements for context clues
      const visibleText = viewportContext.visibleElements.map(el => el.text).join(' ').toLowerCase();
      
      if (visibleText.includes('demo') || visibleText.includes('try')) {
        questions.push("Ready to see how this works?", "Would you like to try it yourself?");
      }
      if (visibleText.includes('contact') || visibleText.includes('get started')) {
        questions.push("Ready to get started?", "What's your next step?");
      }
      if (visibleText.includes('benefit') || visibleText.includes('advantage')) {
        questions.push("Which of these benefits resonates most with you?");
      }
      if (visibleText.includes('integration') || visibleText.includes('api')) {
        questions.push("Do you need help with integrations?");
      }
      
      // Fallback general questions
      if (questions.length === 0) {
        questions.push(
          "What questions do you have about what you're reading?",
          "Is there anything specific you'd like to know more about?",
          "How can I help you evaluate this solution?"
        );
      }
    }
    
    // Send most relevant question as proactive message
    if (questions.length > 0) {
      const selectedQuestion = selectBestQuestion(questions, sectionData);
      console.log('💡 [WIDGET QUESTIONS] Selected fallback question:', selectedQuestion);
      
      // Check if another contextual message is already in delay period
      if (contextualMessageDelayActive) {
        console.log('⏸️ [WIDGET QUESTIONS] Another contextual message delay is active, skipping fallback question');
        return;
      }
      
      // Set delay flag to prevent other contextual messages
      contextualMessageDelayActive = true;
      
      // Don't send immediately - wait 2 minutes for user to read
      setTimeout(() => {
        contextualMessageDelayActive = false; // Reset flag when delay completes
        if (!userIsActive && currentViewportSection === sectionName) {
          sendContextualQuestion(selectedQuestion, sectionData);
        }
      }, 120000); // Wait 2 minutes before sending fallback contextual question
    }
  }
  
  // Select the best question based on context
  function selectBestQuestion(questions, sectionData) {
    const { timeOnPage, scrollPercentage, sectionContent } = sectionData;
    
    // If user has been on page for a while, ask more specific questions
    if (timeOnPage > 60000) { // More than 1 minute
      // Return questions that help move towards conversion
      const urgentQuestions = questions.filter(q => 
        q.includes('ready') || q.includes('next step') || q.includes('get started')
      );
      if (urgentQuestions.length > 0) {
        return urgentQuestions[0];
      }
    }
    
    // If user is in pricing section, prioritize ROI/comparison questions
    if (sectionContent.hasPricing) {
      const pricingQuestions = questions.filter(q => 
        q.includes('ROI') || q.includes('plan') || q.includes('compare')
      );
      if (pricingQuestions.length > 0) {
        return pricingQuestions[0];
      }
    }
    
    // If user has scrolled far, they're engaged - ask deeper questions
    if (scrollPercentage > 50) {
      const engagementQuestions = questions.filter(q => 
        q.includes('demo') || q.includes('speak') || q.includes('call')
      );
      if (engagementQuestions.length > 0) {
        return engagementQuestions[0];
      }
    }
    
    // Default to first question
    return questions[0];
  }
  
  // Send contextual question as proactive message
  function sendContextualQuestion(question, sectionData) {
    console.log('❓ [WIDGET CONTEXTUAL_QUESTION] Sending fallback contextual question:', question);
    
    const contextualMessage = {
      role: 'assistant',
      content: question,
      buttons: generateFollowUpButtons(question, sectionData),
      emailPrompt: '',
      isProactive: true,
      isContextual: true,
      sectionContext: sectionData.sectionName
    };
    
    messages.push(contextualMessage);
    console.log('❓ [WIDGET CONTEXTUAL_QUESTION] Fallback contextual question added to messages array. Total messages:', messages.length);
    
    // Auto-open chat if configured
    if (config.autoOpenProactive && !isOpen) {
      console.log('❓ [WIDGET CONTEXTUAL_QUESTION] Auto-opening chat for contextual question');
      toggleWidget();
      setTimeout(() => {
        renderMessages();
      }, 100);
    } else if (isOpen) {
      renderMessages();
    }
    
    // Speak the question if voice is enabled
    if (config.voiceEnabled && speechAllowed) {
      setTimeout(() => {
        speakText(question, true);
      }, 500);
    }
    
    // Update conversation tracking
    proactiveMessageCount++;
    localStorage.setItem('appointy_proactive_count', proactiveMessageCount.toString());
  }
  
  // Generate relevant follow-up buttons for questions
  function generateFollowUpButtons(question, sectionData) {
    console.log('🔘 [WIDGET BUTTONS] Generating enhanced filtered buttons for question:', question.substring(0, 50) + '...');
    
    const { sectionName, sectionContent } = sectionData;
    const allButtons = [];
    const userContext = getUserContext();
    
    // Generate all possible buttons with priority scores
    
    // === PRICING-RELATED BUTTONS ===
    if (question.includes('pricing') || question.includes('plan') || question.includes('cost') || sectionContent.hasPricing) {
      allButtons.push(
        { text: "Show me pricing", priority: 10, context: "pricing", category: "action" },
        { text: "Calculate ROI", priority: 9, context: "pricing", category: "analysis" },
        { text: "Compare plans", priority: 8, context: "pricing", category: "comparison" },
        { text: "Enterprise options", priority: 7, context: "pricing", category: "enterprise" },
        { text: "Free trial available?", priority: 6, context: "pricing", category: "trial" }
      );
    }
    
    // === DEMO-RELATED BUTTONS ===
    if (question.includes('demo') || question.includes('see this') || question.includes('show me')) {
      allButtons.push(
        { text: "Yes, show me a demo", priority: 10, context: "demo", category: "action" },
        { text: "Schedule a call", priority: 9, context: "demo", category: "meeting" },
        { text: "Send me a video", priority: 8, context: "demo", category: "async" },
        { text: "Live demo now", priority: 7, context: "demo", category: "immediate" }
      );
    }
    
    // === HELP/SUPPORT BUTTONS ===
    if (question.includes('help') || question.includes('questions') || question.includes('support')) {
      allButtons.push(
        { text: "Yes, I have questions", priority: 9, context: "help", category: "support" },
        { text: "Tell me more", priority: 8, context: "help", category: "info" },
        { text: "Show me benefits", priority: 7, context: "help", category: "benefits" },
        { text: "Contact support", priority: 6, context: "help", category: "contact" }
      );
    }
    
    // === CONVERSION/READY BUTTONS ===
    if (question.includes('ready') || question.includes('get started') || question.includes('begin')) {
      allButtons.push(
        { text: "Yes, let's get started", priority: 10, context: "conversion", category: "action" },
        { text: "I need more info", priority: 7, context: "conversion", category: "info" },
        { text: "Schedule onboarding", priority: 9, context: "conversion", category: "meeting" },
        { text: "Sign up now", priority: 8, context: "conversion", category: "immediate" }
      );
    }
    
    // === CONTACT/SALES BUTTONS ===
    if (question.includes('contact') || question.includes('call') || question.includes('sales')) {
      allButtons.push(
        { text: "Yes, contact me", priority: 10, context: "contact", category: "action" },
        { text: "Email me instead", priority: 8, context: "contact", category: "async" },
        { text: "Schedule a call", priority: 9, context: "contact", category: "meeting" },
        { text: "Chat with sales", priority: 7, context: "contact", category: "chat" }
      );
    }
    
    // === USER BEHAVIOR-BASED BUTTONS ===
    if (userContext.timeOnPage > 60000) { // More than 1 minute
      allButtons.push(
        { text: "I'm ready to buy", priority: 9, context: "behavior", category: "conversion" },
        { text: "Contact sales team", priority: 8, context: "behavior", category: "sales" }
      );
    }
    
    if (userContext.timeOnPage > 180000) { // More than 3 minutes
      allButtons.push(
        { text: "Need help deciding?", priority: 8, context: "behavior", category: "assistance" },
        { text: "Talk to an expert", priority: 7, context: "behavior", category: "expert" }
      );
    }
    
    if (userContext.scrollDepth > 80) { // Scrolled more than 80%
      allButtons.push(
        { text: "Seen enough?", priority: 7, context: "behavior", category: "engagement" },
        { text: "Ready for next step", priority: 6, context: "behavior", category: "progression" }
      );
    }
    
    // === SECTION-BASED FALLBACK BUTTONS ===
    if (allButtons.length === 0) {
      if (sectionName.includes('pricing')) {
        allButtons.push(
          { text: "Show pricing details", priority: 8, context: "section", category: "pricing" },
          { text: "Compare options", priority: 7, context: "section", category: "comparison" },
          { text: "Contact sales", priority: 6, context: "section", category: "sales" }
        );
      } else if (sectionName.includes('features')) {
        allButtons.push(
          { text: "Show me a demo", priority: 8, context: "section", category: "demo" },
          { text: "Tell me more", priority: 7, context: "section", category: "info" },
          { text: "How does it work?", priority: 6, context: "section", category: "explanation" }
        );
      } else {
        allButtons.push(
          { text: "Yes, help me", priority: 7, context: "section", category: "help" },
          { text: "Tell me more", priority: 6, context: "section", category: "info" },
          { text: "Not right now", priority: 4, context: "section", category: "decline" }
        );
      }
    }
    
    // === INTELLIGENT FILTERING AND RANKING ===
    
    // Apply context-based priority boosts
    allButtons.forEach(button => {
      // Boost priority for high-intent contexts
      if (userContext.timeOnPage > 120000 && button.context === 'conversion') {
        button.priority += 2;
      }
      
      // Boost priority for section-relevant buttons
      if (sectionName.includes('pricing') && button.context === 'pricing') {
        button.priority += 1;
      }
      
      // Boost priority for immediate action buttons if user seems engaged
      if (userContext.scrollDepth > 50 && button.category === 'action') {
        button.priority += 1;
      }
    });
    
    // Remove duplicate buttons (same text)
    const uniqueButtons = allButtons.filter((button, index, self) => 
      index === self.findIndex(b => b.text === button.text)
    );
    
    // Sort by priority (highest first) and take top candidates
    const topButtons = uniqueButtons
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Take top 5 candidates
    
    // Ensure diversity in button categories
    const finalButtons = [];
    const usedCategories = new Set();
    
    for (const button of topButtons) {
      if (finalButtons.length >= 3) break;
      
      // Add button if we haven't used this category yet, or if we need to fill slots
      if (!usedCategories.has(button.category) || finalButtons.length < 2) {
        finalButtons.push(button.text);
        usedCategories.add(button.category);
      }
    }
    
    // Fill remaining slots if needed
    while (finalButtons.length < 3 && topButtons.length > finalButtons.length) {
      const remainingButton = topButtons.find(b => !finalButtons.includes(b.text));
      if (remainingButton) {
        finalButtons.push(remainingButton.text);
      } else {
        break;
      }
    }
    
    console.log('🔘 [WIDGET BUTTONS] Generated buttons:', finalButtons);
    console.log('🔘 [WIDGET BUTTONS] All candidates considered:', allButtons.length);
    console.log('🔘 [WIDGET BUTTONS] User context:', userContext);
    
    return finalButtons;
  }
  
  // Get user context for button filtering
  function getUserContext() {
    const now = Date.now();
    const timeOnPage = now - (window.pageLoadTime || now);
    
    // Calculate scroll depth
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollDepth = documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0;
    
    return {
      timeOnPage: timeOnPage,
      scrollDepth: scrollDepth,
      hasInteracted: messages.length > 1,
      isReturnVisitor: localStorage.getItem('chatbot_visited') === 'true',
      deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
  }
  
  // Extract page summary for proactive messages
  function extractPageSummary() {
    const summary = {
      title: document.title || '',
      url: window.location.href,
      headings: [],
      mainContent: '',
      hasForm: false,
      hasPricing: false,
      hasVideo: false,
      ctaButtons: []
    };
    
    // Extract main headings
    document.querySelectorAll('h1, h2, h3').forEach(h => {
      if (h.textContent.trim() && summary.headings.length < 5) {
        summary.headings.push(h.textContent.trim());
      }
    });
    
    // Extract main content (first few paragraphs)
    const paragraphs = document.querySelectorAll('p');
    let contentText = '';
    for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
      const text = paragraphs[i].textContent.trim();
      if (text && text.length > 20) {
        contentText += text + ' ';
        if (contentText.length > 500) break;
      }
    }
    summary.mainContent = contentText.substring(0, 500);
    
    // Check for special elements
    summary.hasForm = document.querySelector('form') !== null;
    summary.hasPricing = document.querySelector('[class*="price"], [data-price], [class*="plan"]') !== null;
    summary.hasVideo = document.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]') !== null;
    
    // Extract CTA buttons
    document.querySelectorAll('a, button').forEach(element => {
      const text = element.textContent.trim().toLowerCase();
      if (text && (text.includes('contact') || text.includes('buy') || text.includes('sign up') || 
                   text.includes('get started') || text.includes('learn more') || text.includes('try')) && 
          summary.ctaButtons.length < 3) {
        summary.ctaButtons.push(element.textContent.trim());
      }
    });
    
    return summary;
  }
  
  // Extract meaningful content from section
  function extractSectionContent(element) {
    const content = {
      headings: [],
      text: '',
      links: [],
      hasForm: false,
      hasPricing: false,
      hasVideo: false
    };
    
    // Extract headings
    element.querySelectorAll('h1, h2, h3, h4').forEach(h => {
      if (h.textContent.trim()) content.headings.push(h.textContent.trim());
    });
    
    // Extract meaningful text (first paragraph or description)
    const firstParagraph = element.querySelector('p');
    if (firstParagraph) content.text = firstParagraph.textContent.trim().substring(0, 200);
    
    // Check for special elements
    content.hasForm = element.querySelector('form') !== null;
    content.hasPricing = element.querySelector('[class*="price"], [data-price]') !== null;
    content.hasVideo = element.querySelector('video, iframe[src*="youtube"], iframe[src*="vimeo"]') !== null;
    
    // Extract call-to-action links
    element.querySelectorAll('a').forEach(link => {
      const text = link.textContent.trim();
      if (text && (text.toLowerCase().includes('contact') || text.toLowerCase().includes('buy') || 
                   text.toLowerCase().includes('sign up') || text.toLowerCase().includes('get started'))) {
        content.links.push(text);
      }
    });
    
    return content;
  }
  
  // Send section context to API
  async function sendSectionContextToAPI(sectionData) {
    if (!isOpen || followupSent) return; // Don't spam if chat is closed or already sent followup
    
    // Check if AI contextual question system is already handling this section
    if (contextualMessageDelayActive) {
      console.log('⏸️ [WIDGET MIRROR] AI contextual system is active, skipping section context API to prevent interference');
      return;
    }
    
    console.log('📤 [WIDGET MIRROR] Sending section context to API:', sectionData);
    
    // Generate a contextual question first
    const questions = [];
    const { sectionName, sectionContent } = sectionData;
    
    // Generate questions based on section
    if (sectionName.includes('pricing') || sectionContent.hasPricing) {
      questions.push(
        "Which pricing plan fits your team size?",
        "Would you like me to calculate the ROI for your use case?",
        "Do you have questions about what's included in each plan?"
      );
    } else if (sectionName.includes('feature')) {
      questions.push(
        "Which of these features interests you most?",
        "Would you like to see how this feature works?",
        "How do you currently handle this in your workflow?"
      );
    } else if (sectionName.includes('testimonial')) {
      questions.push(
        "Are you curious about results like these for your business?",
        "Would you like to speak with one of these customers?",
        "What specific outcomes are you hoping to achieve?"
      );
    } else if (sectionName.includes('contact') || sectionName.includes('form')) {
      questions.push(
        "Would you like help filling out this form?",
        "Do you have any questions before getting started?",
        "Ready to see how this could work for your team?"
      );
    } else {
      questions.push(
        "What questions do you have about this section?",
        "Would you like me to explain this in more detail?",
        "How does this relate to your current challenges?"
      );
    }
    
    const selectedQuestion = questions[0]; // Use first question for now
    
    try {
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        question: selectedQuestion, // Add the generated question
        sectionContext: sectionData,
        contextual: true,
        hasBeenGreeted: hasBeenGreeted,
        proactiveMessageCount: proactiveMessageCount
      });
      
      if (data.mainText && data.mainText.trim()) {
        console.log('🎯 [WIDGET MIRROR] Received contextual message for section:', sectionData.sectionName);
        
        // Check if another contextual message is already in delay period
        if (contextualMessageDelayActive) {
          console.log('⏸️ [WIDGET MIRROR] Another contextual message delay is active, skipping section message');
          return;
        }
        
        console.log('🎯 [WIDGET MIRROR] Adding 2-minute delay before displaying section-based message');
        
        // Set delay flag to prevent other contextual messages
        contextualMessageDelayActive = true;
        
        // Add 2-minute delay before displaying section-based contextual message
        setTimeout(() => {
          contextualMessageDelayActive = false; // Reset flag when delay completes
          console.log('� [WIDGET SECTION] 2-minute delay complete, displaying section-based contextual message');
          sendProactiveMessage(data.mainText, data.buttons || [], data.emailPrompt || '', 'CONTEXTUAL_RESPONSE');
        }, 120000); // 2-minute delay before displaying section contextual message
      }
    } catch (error) {
      console.error('❌ [WIDGET MIRROR] Failed to send section context:', error);
    }
  }
  
  // Scale mirror to fit widget
  function scaleMirror() {
    if (!mirrorIframe || !mirrorEnabled) return;
    
    const container = mirrorIframe.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    let scale;
    
    if (config.mirrorScale === 'fit') {
      // Scale to fit entire page
      const pageWidth = document.documentElement.scrollWidth;
      const pageHeight = document.documentElement.scrollHeight;
      scale = Math.min(containerWidth / pageWidth, containerHeight / pageHeight);
    } else if (config.mirrorScale === 'auto') {
      // Scale to show current viewport nicely
      scale = Math.min(containerWidth / window.innerWidth, containerHeight / window.innerHeight) * 0.8;
    } else {
      // Custom scale
      scale = parseFloat(config.mirrorScale) || 0.3;
    }
    
    scale = Math.max(0.1, Math.min(1, scale)); // Clamp between 0.1 and 1
    
    mirrorIframe.style.transform = \`scale(\${scale})\`;
    mirrorIframe.style.transformOrigin = '0 0';
    
    console.log('🔍 [WIDGET MIRROR] Mirror scaled to:', scale);
  }
  
  // Check current viewport section without intersection observer
  function checkViewportSection() {
    // Simple fallback for immediate feedback
    const viewportCenter = window.scrollY + (window.innerHeight / 2);
    const sections = document.querySelectorAll('section, [data-section], .section');
    
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const sectionBottom = sectionTop + rect.height;
      
      if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
        const sectionName = getSectionName(section);
        if (sectionName !== currentViewportSection) {
          currentViewportSection = sectionName;
          // Don't trigger proactive message here to avoid spam
        }
        break;
      }
    }
  }
  
  // Toggle mirror visibility
  function toggleMirror() {
    if (!mirrorIframe) return;
    
    const isVisible = mirrorIframe.style.display !== 'none';
    mirrorIframe.style.display = isVisible ? 'none' : 'block';
    
    const toggleBtn = document.getElementById('appointy-mirror-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = isVisible ? '🙈' : '👁️';
      toggleBtn.title = isVisible ? 'Show Mirror View' : 'Hide Mirror View';
    }
    
    console.log('👁️ [WIDGET MIRROR] Mirror toggled:', !isVisible);
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
    console.log('🎨 [WIDGET HTML] Creating widget HTML with mirror enabled:', mirrorEnabled);
    
    const mirrorHTML = mirrorEnabled ? \`
      <iframe id="appointy-mirror" 
              class="appointy-mirror"
              sandbox="allow-same-origin allow-scripts"
              src="" 
              loading="lazy"
              style="
                position: absolute;
                inset: 0;
                border: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                opacity: 0.8;
                transform-origin: 0 0;
                background: #f8f9fa;
                z-index: 1;
              "></iframe>
    \` : '';

    console.log('🎨 [WIDGET HTML] Mirror HTML generated:', mirrorHTML ? 'YES' : 'NO');

    return \`
      <div style="display: flex; flex-direction: column; height: 100%; background: white; border-radius: 12px; overflow: hidden; position: relative;">
        \${mirrorHTML}
        <div style="background: \${currentTheme.primary}; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 10; backdrop-filter: blur(10px); background: rgba(\${hexToRgb(currentTheme.primary)}, 0.95);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">\${config.chatTitle}</h3>
            \${ONBOARDING_ONLY ? '<span id="appointy-onboarding-badge" style="padding: 2px 8px; font-size: 11px; font-weight: 600; border-radius: 10px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #fff; letter-spacing: 0.3px;">ONBOARDING</span>' : ''}
            <div id="appointy-bot-mode-indicator" style="width: 12px; height: 12px; border-radius: 50%; background-color: #7b1fa2; flex-shrink: 0;" title="Lead Mode">
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            \${mirrorEnabled ? '<button id="appointy-mirror-toggle" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" title="Toggle Mirror View">👁️</button>' : ''}
            <button id="appointy-copy-btn" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" title="Copy Conversation">📋</button>
            <button id="appointy-settings-btn" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" title="Voice Settings">⚙️</button>
            <button id="appointy-close-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
          </div>
        </div>
        <div id="appointy-settings" style="display: none; background: rgba(248, 249, 250, 0.98); backdrop-filter: blur(10px); padding: 12px; border-bottom: 1px solid #e5e7eb; position: relative; z-index: 15;">
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
          \${mirrorEnabled ? \`
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <div style="margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">Mirror Settings</div>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280;">
                <input type="checkbox" id="appointy-mirror-enabled" checked style="margin: 0;">
                Enable Page Mirror
              </label>
            </div>
          \` : ''}
        </div>
        <div id="appointy-messages" style="flex: 1; padding: 15px; overflow-y: auto; max-height: calc(100% - 140px); background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(5px); font-size: \${currentSize.fontSize}; position: relative; z-index: 10;">
          <div style="color: #666; font-size: \${currentSize.fontSize};">Loading...</div>
        </div>
        <div style="padding: 15px; border-top: 1px solid #e5e7eb; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); position: relative; z-index: 15;">
          <div style="display: flex; gap: 8px;">
            <input 
              id="appointy-input" 
              type="text" 
              placeholder="Type your message..." 
              style="flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; outline: none; font-size: \${currentSize.fontSize};"
            />
            <button 
              id="appointy-send-btn" 
              style="background: \${currentTheme.primary}; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: \${currentSize.fontSize}; font-weight: 500;"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    \`;
  }
  
  // Helper function to convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    if (!result) return '0, 112, 243'; // Default blue fallback
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return \`\${r}, \${g}, \${b}\`;
  }
  
  // Clear followup timer
  function clearFollowupTimer() {
    if (followupTimer) {
      console.log('[Widget] Clearing followup timer');
      clearTimeout(followupTimer);
      followupTimer = null;
    }
    followupSent = false;
  }
  
  // Reset user activity
  function resetUserActivity() {
    console.log('[Widget] Resetting user activity - clearing followup timer');
    clearFollowupTimer();
    userIsActive = false;
    lastUserAction = Date.now();
    followupCount = 0;
  }
  
  // Set user as active
  function setUserActive() {
    console.log('[Widget] User is now active');
    userIsActive = true;
    lastUserAction = Date.now();
    
    // Clear auto-response timer when user becomes active
    clearAutoResponseTimer();
  }
  
  // Auto-response system functions
  function clearAutoResponseTimer() {
    if (autoResponseTimer) {
      clearTimeout(autoResponseTimer);
      autoResponseTimer = null;
      console.log('[Widget] Auto-response timer cleared');
    }
  }
  
  function startAutoResponseTimer(contextualQuestion) {
    console.log('[Widget] Starting auto-response timer for 60 seconds');
    clearAutoResponseTimer();
    
    // Store the contextual question for auto-response
    lastContextualQuestion = contextualQuestion;
    contextualQuestionDisplayed = true;
    
    autoResponseTimer = setTimeout(async () => {
      console.log('[Widget] Auto-response timer triggered - user did not respond');
      await generateAutoResponse();
    }, 60000); // 60 seconds (1 minute)
  }
  
  async function generateAutoResponse() {
    if (!lastContextualQuestion || userIsActive) {
      console.log('[Widget] Skipping auto-response - no question or user is active');
      return;
    }
    
    console.log('[Widget] Generating auto-response for contextual question');
    
    try {
      // Generate an answer to the contextual question and ask for email
      const autoResponseData = await sendApiRequest('chat', {
        sessionId: sessionId,
        pageUrl: currentPageUrl,
        question: "Auto-response for: " + lastContextualQuestion.mainText,
        autoResponse: true,
        contextualQuestion: lastContextualQuestion
      });
      
      if (autoResponseData && autoResponseData.mainText) {
        console.log('[Widget] Auto-response generated, adding to chat');
        
        // Add auto-response message to chat
        addMessage('assistant', autoResponseData.mainText, autoResponseData.buttons || []);
        
        // Check if this should be an email collection request
        if (autoResponseData.emailPrompt) {
          console.log('[Widget] Auto-response includes email prompt');
        }
        
        // Clear the contextual question state
        contextualQuestionDisplayed = false;
        lastContextualQuestion = null;
        
        // Update UI
        updateWidget();
      }
    } catch (error) {
      console.error('[Widget] Error generating auto-response:', error);
    }
  }
  
  // Start followup timer
  function startFollowupTimer() {
    if (ONBOARDING_ONLY) {
      console.log('[Widget] Followup timer suppressed in onboarding-only mode');
      return;
    }
    console.log('[Widget] Starting followup timer - count:', followupCount, 'userIsActive:', userIsActive, 'speechSynthesis.speaking:', speechSynthesis.speaking);
    console.log('[Widget] Timer starts independently of speech playback status');
    clearFollowupTimer();
    followupTimer = setTimeout(() => {
      const timeSinceLastAction = Date.now() - lastUserAction;
      console.log('[Widget] Followup timer triggered:', {
        userIsActive,
        timeSinceLastAction,
        followupCount,
        timeSinceLastActionSeconds: Math.round(timeSinceLastAction / 1000)
      });
      
      if (!userIsActive && timeSinceLastAction >= 25000 && followupCount < 3) {
        console.log('[Widget] Conditions met for followup message - sending now');
        sendFollowupMessage();
      } else {
        console.log('[Widget] Followup conditions not met:', {
          userNotActive: !userIsActive,
          enoughTimePassed: timeSinceLastAction >= 25000,
          underLimit: followupCount < 3
        });
      }
    }, 120000); // 120 seconds (2 minutes)
    console.log('[Widget] Followup timer set for 2 minutes');
  }
  
  // Send API request
  async function sendApiRequest(endpoint, data) {
    console.log("🚀 [WIDGET API] Sending request to:", endpoint);
    console.log("📤 [WIDGET API] Request data:", data);
    
    // Add explicit response format specification
    const sanitized = { ...data };
    if (ONBOARDING_ONLY) {
      try {
        delete sanitized.proactive;
        delete sanitized.contextual;
        delete sanitized.contextualQuestionGeneration;
        delete sanitized.contextualResponse;
        delete sanitized.sectionContext;
        delete sanitized.contextualPageContext;
        delete sanitized.sectionName;
        delete sanitized.sectionAnalysis;
        delete sanitized.requestType;
        delete sanitized.followup;
        delete sanitized.followupType;
        delete sanitized.followupTopic;
      } catch {}
    }
    const requestData = {
      ...sanitized,
      responseFormat: {
        required: true,
        structure: {
          mainText: "string - REQUIRED main response text",
          buttons: "array - optional action buttons",
          emailPrompt: "string - optional email collection prompt",
          botMode: "string - bot behavior mode",
          userEmail: "string - user email if collected"
        },
        note: "Always use 'mainText' field for the main response content. Do not use 'answer' field."
      }
    };
    
    try {
      const effectiveEndpoint = endpoint;
      const response = await fetch(\`\${CHATBOT_API_BASE}/api/\${effectiveEndpoint}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'X-Widget-Mode': ONBOARDING_ONLY ? 'onboarding_only' : 'standard'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log("📥 [WIDGET API] Response status:", response.status);
      // Explicit 401 handling to avoid stuck loading state
      if (response.status === 401) {
        console.warn('🔒 [WIDGET API] Unauthorized: Invalid or missing API key');
        return {
          mainText: 'Authentication failed: Invalid or missing API key. Paste a valid API key and click "Load Widget".',
          buttons: [],
          emailPrompt: '',
          botMode: 'error',
          showBookingCalendar: false,
          bookingType: null
        };
      }
      
      const contentType = response.headers.get('content-type') || '';
      let responseData;
      try {
        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          responseData = { mainText: text || '' };
        }
      } catch (parseErr) {
        console.warn('⚠️ [WIDGET API] Failed to parse JSON, falling back to text:', parseErr);
        const text = await response.text().catch(() => '');
        responseData = { mainText: text || '' };
      }
      
      // 🔍 DEBUG: Log the raw response data BEFORE normalization
      console.log("🔍 [WIDGET API] RAW RESPONSE DATA (before normalization):", responseData);
      console.log("🔍 [WIDGET API] showBookingCalendar field:", responseData.showBookingCalendar);
      console.log("🔍 [WIDGET API] bookingType field:", responseData.bookingType);
      
      // Normalize response format to ensure consistency
      const normalizedResponse = normalizeApiResponse(responseData);
      
      // 🔍 DEBUG: Log the normalized response
      console.log("🔍 [WIDGET API] NORMALIZED RESPONSE DATA:", normalizedResponse);
      console.log("🔍 [WIDGET API] AFTER normalization - showBookingCalendar:", normalizedResponse.showBookingCalendar);
      console.log("🔍 [WIDGET API] AFTER normalization - bookingType:", normalizedResponse.bookingType);
      
      console.log("🤖 [WIDGET AI RESPONSE] Raw AI response received:");
      console.log("==========================================");
      console.log("Full response data:", responseData);
      console.log("AI Answer:", normalizedResponse.mainText || "No mainText field");
      console.log("Buttons:", normalizedResponse.buttons || "No buttons");
      console.log("Email Prompt:", normalizedResponse.emailPrompt || "No email prompt");
      console.log("Bot Mode:", normalizedResponse.botMode || "No bot mode");
      console.log("==========================================");
      
      return normalizedResponse;
    } catch (error) {
      console.error('❌ [WIDGET API] Error:', error);
      return {
        mainText: 'Connection failed. Please check your network and try again.',
        buttons: [],
        emailPrompt: '',
        botMode: 'error',
        showBookingCalendar: false,
        bookingType: null
      };
    }
  }
  
  // Normalize API response to ensure consistent format
  function normalizeApiResponse(responseData) {
    console.log("🔄 [WIDGET API] Normalizing response format");
    
    // Ensure we always have mainText field
    const mainText = responseData.mainText || responseData.answer || responseData.text || responseData.message || '';
    
    if (!responseData.mainText && (responseData.answer || responseData.text || responseData.message)) {
      console.log("⚠️ [WIDGET API] Converting legacy field to mainText:", {
        answer: responseData.answer ? 'found' : 'missing',
        text: responseData.text ? 'found' : 'missing', 
        message: responseData.message ? 'found' : 'missing'
      });
    }
    
    const normalized = {
      mainText: mainText,
      buttons: responseData.buttons || [],
      emailPrompt: responseData.emailPrompt || '',
      botMode: responseData.botMode || 'lead_generation',
      userEmail: responseData.userEmail || null,
      // 🎯 BOOKING CALENDAR FIELDS - ESSENTIAL FOR CALENDAR FUNCTIONALITY
      showBookingCalendar: responseData.showBookingCalendar || false,
      bookingType: responseData.bookingType || null,
      onboardingAction: responseData.onboardingAction || null,
      // New: support multi-field inputs from backend (or future extensions)
      inputFields: responseData.inputFields || responseData.registrationFields || null
    };
    
    console.log("✅ [WIDGET API] Response normalized to consistent format");
    
    // 🎯 Debug booking calendar fields
    if (normalized.showBookingCalendar) {
      console.log("📅 [WIDGET API] ✅ BOOKING CALENDAR DETECTED IN RESPONSE:", {
        showBookingCalendar: normalized.showBookingCalendar,
        bookingType: normalized.bookingType
      });
    }
    
    return normalized;
  }

  // Get followup topic for varied conversations
  function getFollowupTopic(followupCount) {
    const followupTopics = [
      'pricing_plans',
      'integration_options', 
      'advanced_features',
      'use_cases',
      'customization',
      'support_resources'
    ];
    
    // Get available topics (not used yet)
    const availableTopics = followupTopics.filter(topic => !usedFollowupTopics.has(topic));
    
    // If we've used all topics, reset and start over
    if (availableTopics.length === 0) {
      usedFollowupTopics.clear();
      return followupTopics[0];
    }
    
    // Use followupCount to cycle through topics predictably
    const topicIndex = followupCount % availableTopics.length;
    const selectedTopic = availableTopics[topicIndex];
    
    // Mark this topic as used
    usedFollowupTopics.add(selectedTopic);
    
    console.log('[WIDGET FOLLOWUP] Selected topic: ' + selectedTopic + ' (count: ' + followupCount + ', used: ' + Array.from(usedFollowupTopics).join(', ') + ')');
    
    return selectedTopic;
  }

  // Send followup message
  async function sendFollowupMessage() {
    console.log('🔀 [WIDGET FLOW] ===== STARTING FOLLOWUP MESSAGE GENERATION =====');
    console.log('⏰ [WIDGET FOLLOWUP] Sending followup message', { followupCount, sessionId });
    const currentUrl = window.location.href;
    
    // Check if user has asked any questions in this conversation
    const userMessages = messages.filter(msg => msg.role === 'user');
    const hasUserMessages = userMessages.length > 0;
    
    console.log('📝 [WIDGET FOLLOWUP] User message analysis:', {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      hasUserMessages: hasUserMessages,
      lastUserMessage: hasUserMessages ? userMessages[userMessages.length - 1].content : null
    });
    
    let followupData;
    
    if (hasUserMessages && followupCount === 0) {
      // First followup and user has asked questions - base it on their last question
      const lastUserMessage = userMessages[userMessages.length - 1].content;
      console.log('🎯 [WIDGET FOLLOWUP] First followup based on user question:', lastUserMessage);
      
      followupData = {
        sessionId,
        pageUrl: currentUrl,
        followup: true,
        followupCount,
        followupType: 'question_based',
        lastUserQuestion: lastUserMessage,
        userConversationHistory: userMessages.map(msg => msg.content),
        pageSummary: extractPageSummary()
      };
    } else {
      // No user messages or subsequent followups - use topic-based approach
      const followupTopic = getFollowupTopic(followupCount);
      console.log('📋 [WIDGET FOLLOWUP] Using topic-based followup:', followupTopic);
      
      followupData = {
        sessionId,
        pageUrl: currentUrl,
        followup: true,
        followupCount,
        followupType: 'topic_based',
        followupTopic: followupTopic,
        pageSummary: extractPageSummary()
      };
    }
    
    // Extract current page summary for contextual followups
    console.log('⏰ [WIDGET FOLLOWUP] Page summary for followup:', followupData.pageSummary);
    console.log('⏰ [WIDGET FOLLOWUP] Followup data:', followupData);
    
    try {
      const data = await sendApiRequest('chat', followupData);
      
      console.log('[Widget] Followup API response:', data);
      
      // Update bot mode indicator
      if (data.botMode) {
        updateBotModeIndicator(data.botMode, data.userEmail);
      }
      
      if (data.mainText) {
        const botMessage = {
          role: 'assistant',
          content: data.mainText,
          buttons: data.buttons || [],
          emailPrompt: data.emailPrompt || '',
          showBookingCalendar: data.showBookingCalendar || false,
          bookingType: data.bookingType || null,
          // Carry multi-field inputs if provided
          inputFields: data.inputFields || null
        };
        messages.push(botMessage);
        renderMessages();
        followupCount++;
        console.log('⏰ [WIDGET FOLLOWUP] Followup message added to messages array, new count:', followupCount);
        
        // Auto-open chat if it's closed and user hasn't opened it yet
        if (!isOpen && config.autoOpenProactive) {
          console.log('⏰ [WIDGET FOLLOWUP] Auto-opening chat for followup message');
          toggleWidget();
        }
        
        // Continue followup chain
        startFollowupTimer();
        console.log('🔀 [WIDGET FLOW] ===== FOLLOWUP MESSAGE FLOW COMPLETE =====');
      } else {
        console.log('⏰ [WIDGET FOLLOWUP] No followup message content received from API');
      }
    } catch (error) {
      console.error('⏰ [WIDGET FOLLOWUP] Error sending followup message:', error);
      console.log('🔀 [WIDGET FLOW] ===== FOLLOWUP MESSAGE FLOW FAILED =====');
    }
    
    followupSent = false;
  }
  
  // Send message
  async function sendMessage(text) {
    if (!text.trim()) return;
    
    console.log("💬 [WIDGET MESSAGE] User sending message:", text);
    
    resetUserActivity();
    lastUserMessage = Date.now(); // Track when user last sent a message
    
    // Ensure we have the latest page URL
    detectPageChange();
    
    // Add user message
    const userMessage = { role: 'user', content: text };
    messages.push(userMessage);
    console.log("📝 [WIDGET MESSAGE] User message added to chat, total messages:", messages.length);
    renderMessages();
    
    // Clear input
    const input = document.getElementById('appointy-input');
    if (input) input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    console.log("🔄 [WIDGET MESSAGE] Sending to API...");
    
    // Send to API with current page context
    const data = await sendApiRequest('chat', {
      question: text,
      sessionId,
      pageUrl: currentPageUrl
      // Don't specify adminId - let the API extract it from the API key
    });
    
    // Hide typing indicator
    hideTypingIndicator();
    
    console.log("✅ [WIDGET MESSAGE] API response processed");
    
    if (ONBOARDING_ONLY && data && data.onboardingAction === 'completed' && !isOpen) {
      toggleWidget();
    }

    // Update bot mode indicator
    if (data.botMode) {
      updateBotModeIndicator(data.botMode, data.userEmail);
    }
    
    let botResponse = '';
    if (data.error) {
      console.log("❌ [WIDGET MESSAGE] Error in API response:", data.error);
      const errorText = (data.mainText && data.mainText.trim()) ? data.mainText : 'Sorry, something went wrong. Please try again.';
      const errorMessage = { role: 'assistant', content: errorText };
      messages.push(errorMessage);
      botResponse = errorMessage.content;
    } else {
      console.log("🎯 [WIDGET MESSAGE] Creating bot response:");
      console.log("Main Text:", data.mainText || data.answer || 'I received your message.');
      console.log("Buttons:", data.buttons || []);
      console.log("Email Prompt:", data.emailPrompt || '');
      console.log("Show Booking Calendar:", data.showBookingCalendar || false);
      console.log("Booking Type:", data.bookingType || 'none');
      
      const isConfirmInput = /\b(confirm\s+and\s+submit|confirm|submit|looks\s*good|look\s*good|yes)\b/i.test(text);
      const lastAssistantWithConfirm = (() => {
        for (let i = messages.length - 1; i >= 0; i--) {
          const m = messages[i];
          if (m && m.role === 'assistant') {
            if (Array.isArray(m.buttons) && m.buttons.includes('Confirm and Submit')) return true;
            break;
          }
        }
        return false;
      })();
      const fallbackText = (() => {
        if (data.onboardingAction === 'completed') return '✅ You’re all set! Your account has been created.';
        if (data.onboardingAction === 'confirm') return '✅ Registration complete. Please review and confirm your setup details.';
        if (data.onboardingAction === 'ask_next') return 'Let’s continue your setup. Please provide the next required detail.';
        if (ONBOARDING_ONLY && (isConfirmInput || lastAssistantWithConfirm) && !data.error) return '✅ You’re all set! Your account has been created.';
        return ONBOARDING_ONLY ? 'Please try again.' : 'I received your message.';
      })();
      const inferredAction = (() => {
        if (data.onboardingAction) return data.onboardingAction;
        if (ONBOARDING_ONLY && (isConfirmInput || lastAssistantWithConfirm) && !data.error) return 'completed';
        return null;
      })();
      const hasServerMessage = !!(data.mainText && data.mainText.trim()) || !!(data.answer && String(data.answer).trim());
      const useFallbackForConfirm = ONBOARDING_ONLY && (isConfirmInput || lastAssistantWithConfirm) && !data.error && !hasServerMessage;
      const botMessage = {
        role: 'assistant',
        content: ((data.mainText && data.mainText.trim())
          ? data.mainText
          : ((data.answer && String(data.answer).trim())
            ? String(data.answer)
            : fallbackText)),
        buttons: data.buttons || [],
        emailPrompt: data.emailPrompt || '',
        showBookingCalendar: data.showBookingCalendar || false,
        bookingType: data.bookingType || null,
        inputFields: data.inputFields || null,
        onboardingAction: inferredAction
      };
      messages.push(botMessage);
      botResponse = botMessage.content;
      console.log('[Widget] Bot response received, starting followup timer');
      if (!ONBOARDING_ONLY) startFollowupTimer();
    }
    
    console.log("🎨 [WIDGET MESSAGE] Rendering messages to UI");
    renderMessages();
    
    // Speak bot response if voice is enabled and allowed
    if (config.voiceEnabled && speechAllowed && botResponse) {
      console.log("🔊 [WIDGET MESSAGE] Speaking bot response");
      setTimeout(() => {
        speakText(botResponse, false);
      }, 500);
    }
    
    console.log("✨ [WIDGET MESSAGE] Message processing complete");
  }
  
  // Smooth scroll to bottom function with enhanced reliability
  function scrollToBottom() {
    const messagesContainer = document.getElementById('appointy-messages');
    if (!messagesContainer) return;
    
    // Check if container is visible and has height
    const containerRect = messagesContainer.getBoundingClientRect();
    if (containerRect.height === 0) {
      // Container not ready, try again after a short delay
      setTimeout(() => scrollToBottom(), 50);
      return;
    }
    
    const targetScrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
    
    // Immediate scroll
    messagesContainer.scrollTop = targetScrollTop;
    
    // Additional scroll to handle any pending renders
    requestAnimationFrame(() => {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
      }
    });
  }
  
  // Enhanced scroll that accounts for content changes
  function scrollToBottomEnhanced() {
    scrollToBottom();
    
    // Multiple fallback scrolls to handle various timing issues
    const scrollAttempts = [100, 200, 400, 600];
    scrollAttempts.forEach(delay => {
      setTimeout(() => scrollToBottom(), delay);
    });
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
    scrollToBottom();
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
        // User message - right aligned with gray background
        messageDiv.style.cssText = \`
          margin: 8px 0;
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        \`;
        
        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = 'display: flex; align-items: flex-start; width: 100%;';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.style.cssText = \`
          background: #f1f1f1;
          color: #333;
          padding: 12px 16px;
          border-radius: 18px;
          min-width: 0;
          word-wrap: break-word;
          word-break: break-word;
          font-size: \${currentSize.fontSize};
          line-height: 1.4;
          flex: 1;
        \`;
        bubbleDiv.innerHTML = formatMessageText(msg.content);
        
        const userAvatar = createAvatar(false);
        userAvatar.style.marginRight = '0';
        userAvatar.style.marginLeft = '8px';
        
        contentWrapper.appendChild(bubbleDiv);
        contentWrapper.appendChild(userAvatar);
        messageDiv.appendChild(contentWrapper);
        
      } else {
        // Bot message - left aligned with theme color background
        messageDiv.style.cssText = \`
          margin: 8px 0;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        \`;
        
        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = 'display: flex; align-items: flex-start; max-width: 100%;';
        
        const botAvatar = createAvatar(true);
        botAvatar.style.marginRight = '8px';
        
        const bubbleDiv = document.createElement('div');
       bubbleDiv.style.cssText = \`
         background: \${currentTheme.primary};
         color: white;
         padding: 12px 16px;
         border-radius: 18px;
         min-width: 0;
         word-wrap: break-word;
         word-break: break-word;
         font-size: \${currentSize.fontSize};
         line-height: 1.4;
         flex: 1;
         box-sizing: border-box;
       \`;
        
        // For onboarding-only mode, limit bubble width and fix right padding
        if (ONBOARDING_ONLY) {
          bubbleDiv.style.maxWidth = '70%';
          bubbleDiv.style.paddingRight = '16px';
        }
        
        contentWrapper.appendChild(botAvatar);
        contentWrapper.appendChild(bubbleDiv);
        messageDiv.appendChild(contentWrapper);
        
        // Bot message with potential buttons and email prompt
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = formatMessageText(msg.content);
        bubbleDiv.appendChild(contentDiv);
        
        console.log("🔘 [WIDGET RENDER] Message buttons:", msg.buttons);
        console.log("📧 [WIDGET RENDER] Message emailPrompt:", msg.emailPrompt);
        console.log("📅 [WIDGET RENDER] Message showBookingCalendar:", msg.showBookingCalendar);
        
        // Hide buttons and email requests if calendar is being shown
        const hideInteractiveElements = msg.showBookingCalendar && msg.bookingType;
        
        if (hideInteractiveElements) {
          console.log("🚫 [WIDGET RENDER] Hiding interactive elements (buttons & email) - calendar is shown");
        }
        
        // Add buttons if present (skip if calendar is shown)
        if (msg.buttons && msg.buttons.length > 0 && !hideInteractiveElements) {
          console.log("✅ [WIDGET RENDER] Rendering", msg.buttons.length, "buttons");
          const buttonsDiv = document.createElement('div');
          buttonsDiv.style.cssText = 'margin-top: 8px;';
          
          msg.buttons.forEach((buttonText, index) => {
            const button = document.createElement('button');
            
            // Add bullet point before text
            const bulletSpan = document.createElement('span');
            bulletSpan.textContent = '• ';
            bulletSpan.style.cssText = \`
              color: rgba(255, 255, 255, 0.7);
              margin-right: 4px;
            \`;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = buttonText;
            
            button.appendChild(bulletSpan);
            button.appendChild(textSpan);
            
            button.style.cssText = \`
              background: transparent;
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 0;
              margin: 2px 0;
              border-radius: 4px;
              cursor: pointer;
              font-size: \${currentSize.fontSize};
              font-weight: 400;
              transition: all 0.2s ease;
              display: block;
              width: 100%;
              text-align: left;
              user-select: none;
              padding: 6px 8px;
              opacity: 0;
              animation: buttonFadeIn 0.3s ease forwards;
              animation-delay: \${index * 0.1}s;
            \`;
            
            // Fallback to ensure button becomes visible even if animation fails
            setTimeout(() => {
              if (button.style.opacity === '0') {
                button.style.opacity = '1';
              }
            }, (index * 100) + 400);
            
            // Update keyframes for simpler animation
            if (!document.getElementById('appointy-button-styles')) {
              const style = document.createElement('style');
              style.id = 'appointy-button-styles';
              style.textContent = \`
                @keyframes buttonFadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
              \`;
              document.head.appendChild(style);
            }
            
            button.addEventListener('mouseenter', () => {
              button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              button.style.borderColor = 'rgba(255, 255, 255, 0.6)';
              bulletSpan.style.color = 'white';
            });
            
            button.addEventListener('mouseleave', () => {
              button.style.backgroundColor = 'transparent';
              button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              bulletSpan.style.color = 'rgba(255, 255, 255, 0.7)';
            });
            
            button.addEventListener('mousedown', () => {
              button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            });
            
            button.addEventListener('mouseup', () => {
              button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            button.addEventListener('click', () => {
              console.log("🔘 [WIDGET BUTTON] Button clicked:", buttonText);
              resetUserActivity();
              sendMessage(buttonText);
            });
            
            buttonsDiv.appendChild(button);
          });
          
          bubbleDiv.appendChild(buttonsDiv);
        } else if (msg.buttons && msg.buttons.length > 0 && hideInteractiveElements) {
          console.log("🚫 [WIDGET RENDER] Skipping", msg.buttons.length, "buttons - calendar is shown");
        }
        
        // New: render multi-field inputs (name, email, password) with reasons if provided
        if (!hideInteractiveElements && msg.inputFields && Array.isArray(msg.inputFields) && msg.inputFields.length > 0) {
          console.log("✅ [WIDGET RENDER] Rendering multi-field registration form");
          const formWrap = document.createElement('div');
          formWrap.style.cssText = 'margin-top: 8px;';
          
          const form = document.createElement('form');
          form.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
          
          // Use plain object; avoid TS types in emitted client script
          const fieldInputs = {};
          msg.inputFields.forEach(field => {
            const fieldDiv = document.createElement('div');
            
            const label = document.createElement('div');
            label.textContent = field.label || field.name;
            label.style.cssText = 'color: white; font-size: 13px; margin-bottom: 4px;';
            fieldDiv.appendChild(label);
            
            const rationale = document.createElement('div');
            rationale.textContent = field.rationale || (
              field.name === 'fullName' ? 'We use your name to personalize setup and documentation.' :
              field.name === 'email' ? 'We use your email to set you up and send onboarding resources.' :
              field.name === 'password' ? 'We need a password to secure your account.' :
              ''
            );
            if (rationale.textContent) {
              rationale.style.cssText = 'color: rgba(255,255,255,0.85); font-size: 12px; margin-bottom: 6px;';
              fieldDiv.appendChild(rationale);
            }
            
            const input = document.createElement('input');
            input.type = field.type || 'text';
            input.placeholder = field.placeholder || '';
            input.required = !!field.required;
            if (field.minLength) input.minLength = field.minLength;
            input.style.cssText = \`
              width: 100%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 8px;
              font-size: 13px;
              outline: none;
              background: white;
              color: black;
              box-sizing: border-box;
            \`;
            input.addEventListener('input', () => {
              if (input.value.length > 0) {
                setUserActive();
              }
            });
            
            fieldInputs[field.name] = input;
            fieldDiv.appendChild(input);
            form.appendChild(fieldDiv);
          });
          
          const submit = document.createElement('button');
          submit.type = 'submit';
          submit.textContent = 'Submit';
          submit.style.cssText = \`
            background: #f1f1f1;
            color: #333;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            align-self: flex-start;
          \`;
          
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Collect provided values only; let backend ask for missing ones
            const fullName = (fieldInputs.fullName && fieldInputs.fullName.value.trim()) || '';
            const email = (fieldInputs.email && fieldInputs.email.value.trim()) || '';
            const password = (fieldInputs.password && fieldInputs.password.value.trim()) || '';

            // Validate provided password if present
            if (password && password.length < 8) {
              fieldInputs.password.focus();
              return;
            }

            // Build combined message with only provided fields (plain JS)
            const parts = [];
            if (fullName) parts.push('Name: ' + fullName);
            if (email) parts.push('Email: ' + email);
            if (password) parts.push('Password: ' + password);

            if (parts.length === 0) return; // nothing to submit

            resetUserActivity();
            const combined = parts.join(', ');
            sendMessage(combined);
          });
          
          form.appendChild(submit);
          formWrap.appendChild(form);
          bubbleDiv.appendChild(formWrap);
        } else if (msg.emailPrompt && msg.emailPrompt.trim() && !hideInteractiveElements) {
          console.log("✅ [WIDGET RENDER] Rendering email prompt");
          const emailDiv = document.createElement('div');
          emailDiv.style.cssText = 'margin-top: 8px;';
          
          const promptText = document.createElement('div');
          promptText.textContent = msg.emailPrompt;
          promptText.style.cssText = 'margin-bottom: 8px; color: white; font-size: 13px;';
          emailDiv.appendChild(promptText);

          // Add rationale explaining why the detail is needed
          const rationaleText = document.createElement('div');
          const lowerPrompt = msg.emailPrompt.toLowerCase();
          let rationale = 'We use your email to set you up and send onboarding resources.';
          if (lowerPrompt.includes('support')) {
            rationale = 'We use your email to contact you and share support follow-ups.';
          } else if (lowerPrompt.includes('setup')) {
            rationale = 'We use your email to send setup guides and account details.';
          } else if (lowerPrompt.includes('demo')) {
            rationale = 'We use your email to confirm your demo and send reminders.';
          }
          rationaleText.textContent = rationale;
          rationaleText.style.cssText = 'margin-bottom: 8px; color: rgba(255,255,255,0.85); font-size: 12px;';
          emailDiv.appendChild(rationaleText);
          
          const emailForm = document.createElement('form');
          emailForm.style.cssText = 'display: flex; gap: 8px;';
          
          const emailInput = document.createElement('input');
          emailInput.type = 'email';
          emailInput.placeholder = 'Type in your email';
          emailInput.required = true;
          emailInput.style.cssText = \`
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            background: white;
            color: black;
            box-sizing: border-box;
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
            background: #f1f1f1;
            color: #333;
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
        } else if (msg.emailPrompt && msg.emailPrompt.trim() && hideInteractiveElements) {
          console.log("🚫 [WIDGET RENDER] Skipping email prompt - calendar is shown");
        }

        // Add booking calendar if present
        console.log("🔍 [WIDGET DEBUG] Checking booking calendar flags:", {
          showBookingCalendar: msg.showBookingCalendar,
          bookingType: msg.bookingType,
          shouldRender: !!(msg.showBookingCalendar && msg.bookingType)
        });
        
        if (msg.showBookingCalendar && msg.bookingType) {
          console.log("📅 [WIDGET RENDER] ✅ RENDERING BOOKING CALENDAR FOR:", msg.bookingType);
          console.log("📊 [WIDGET RENDER] Current userBookingData:", userBookingData);
          
          // Check if we have user email already
          if (!userBookingData.email) {
            console.log("📧 [WIDGET RENDER] No email found, showing email collection form");
            showEmailCollectionForm(bubbleDiv, msg.bookingType);
          } else {
            console.log("📧 [WIDGET RENDER] Email found, showing booking calendar directly");
            showBookingCalendar(bubbleDiv, msg.bookingType);
          }
        }

      }
      
      messagesContainer.appendChild(messageDiv);
    });
    
    // Enhanced scroll to bottom that handles animated content
    scrollToBottomEnhanced();
  }
  
  // Initialize proactive message
  async function initializeChat() {
    console.log('[ChatWidget] Initializing chat for page:', currentPageUrl);
    
    // Wait for page context to be properly loaded first
    if (!isPageContextLoaded) {
      await loadPageContext();
    }

    // For onboarding-only mode, proactively start by asking for details on the FIRST message
    if (ONBOARDING_ONLY && messages.length === 0) {
      console.log('[ChatWidget] Onboarding-only mode detected, starting onboarding flow with detail-first prompt');
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true,
        question: 'get started'
      });

      const initialText = (data && data.mainText) ? data.mainText : 'Welcome! To start your registration, please share your name, email, and a password (min 8 chars).';
      const registrationFields = [
        { name: 'fullName', label: 'Your Name', type: 'text', placeholder: 'Jane Doe', rationale: 'We use your name to personalize setup and documentation.', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com', rationale: 'We use your email to set you up and send onboarding resources.', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters', rationale: 'We need a password to secure your account.', required: true, minLength: 8 }
      ];

      sendProactiveMessage(
        initialText,
        (data && data.buttons) ? data.buttons : [],
        '',
        'ONBOARDING',
        registrationFields
      );
      console.log('[ChatWidget] Onboarding init message sent with detail-first prompt');
      return;
    }
    
    // If page context loading didn't provide a proactive message, send default
    if (messages.length === 0) {
      console.log('[ChatWidget] No page-specific context found, using default message');
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true
        // Don't specify adminId - let the API extract it from the API key
      });
      
      if (data.mainText) {
        sendProactiveMessage(data.mainText);
      }
    }
    
    console.log('[ChatWidget] Chat initialized successfully');
  }
  
  // Toggle widget
  function toggleWidget() {
    isOpen = !isOpen;
    console.log('[Widget] Toggling widget, now open:', isOpen);
    widgetContainer.style.display = isOpen ? 'flex' : 'none';
    
    // In onboarding-only mode, control backdrop and interactivity
    if (ONBOARDING_ONLY) {
      if (isOpen) {
        widgetMainContainer.style.background = 'rgba(0,0,0,0.35)';
        widgetMainContainer.style.pointerEvents = 'auto';
      } else {
        widgetMainContainer.style.background = 'transparent';
        widgetMainContainer.style.pointerEvents = 'none';
      }
    }
    
    // Update button appearance
    toggleButton.innerHTML = isOpen ? '×' : config.buttonText;
    toggleButton.style.animation = 'none'; // Remove pulse animation
    
    if (isOpen) {
      console.log('[Widget] Widget opened');
      
      // Initialize mirror if enabled
      if (mirrorEnabled) {
        setTimeout(() => {
          initializeMirror();
        }, 100);
      }
      
      // If no messages exist, initialize chat
      if (messages.length === 0) {
        console.log('[Widget] No messages, initializing chat');
        initializeChat();
      } else {
        // Scroll to bottom when opening widget with existing messages
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
      
      resetUserActivity();
    } else {
      console.log('[Widget] Widget closed, clearing followup timer');
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
  
  // Copy conversation to clipboard
  function copyConversation() {
    try {
      let conversationText = 'Chat Conversation\\n';
      conversationText += '===================\\n\\n';
      
      messages.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'You' : 'Assistant';
        const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
        
        conversationText += \`[\${role}] \${timestamp ? '(' + timestamp + ')' : ''}\\n\`;
        conversationText += \`\${msg.content}\\n\`;
        
        // Add buttons if present
        if (msg.buttons && msg.buttons.length > 0) {
          conversationText += 'Options: ' + msg.buttons.join(', ') + '\\n';
        }
        
        conversationText += '\\n';
      });
      
      // Copy to clipboard
      navigator.clipboard.writeText(conversationText).then(() => {
        // Show success feedback
        showCopyFeedback(true);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = conversationText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyFeedback(true);
      });
    } catch (error) {
      console.error('Failed to copy conversation:', error);
      showCopyFeedback(false);
    }
  }
  
  // Show copy feedback
  function showCopyFeedback(success) {
    const copyBtn = document.getElementById('appointy-copy-btn');
    if (copyBtn) {
      const originalTitle = copyBtn.title;
      const originalText = copyBtn.innerHTML;
      
      copyBtn.title = success ? 'Copied!' : 'Copy failed';
      copyBtn.innerHTML = success ? '✅' : '❌';
      copyBtn.style.color = success ? '#10b981' : '#ef4444';
      
      setTimeout(() => {
        copyBtn.title = originalTitle;
        copyBtn.innerHTML = originalText;
        copyBtn.style.color = 'white';
      }, 2000);
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
    
    // Mirror toggle button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-mirror-toggle') {
        toggleMirror();
      }
    });
    
    // Copy conversation button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'appointy-copy-btn') {
        copyConversation();
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
      
      if (e.target.id === 'appointy-mirror-enabled') {
        mirrorEnabled = e.target.checked;
        if (mirrorEnabled && isOpen) {
          setTimeout(() => {
            initializeMirror();
          }, 100);
        } else if (!mirrorEnabled && mirrorIframe) {
          mirrorIframe.style.display = 'none';
        }
        console.log('Mirror enabled:', mirrorEnabled);
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
          console.log('[Widget] User started typing, setting active');
          setUserActive();
          clearFollowupTimer();
          
          // Restart timer with user activity consideration
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && followupCount < 3) {
            console.log('[Widget] Restarting followup timer after user typing');
            startFollowupTimer();
          }
        } else if (e.target.value.length === 0 && userIsActive) {
          console.log('[Widget] User cleared input, setting inactive');
          userIsActive = false;
        }
      }
    });
    
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[Widget] Page hidden, clearing followup timer');
        clearFollowupTimer();
      } else if (isOpen && messages.length > 0) {
        console.log('[Widget] Page visible again, checking if should restart followup timer');
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && followupCount < 3) {
          console.log('[Widget] Restarting followup timer after page became visible');
          startFollowupTimer();
        }
      }
    });
  }
  
  // Widget messages container scroll detection
  function setupWidgetScrollDetection() {
    const messagesContainer = document.getElementById('appointy-messages');
    if (!messagesContainer) return;
    
    messagesContainer.addEventListener('scroll', () => {
      if (!userIsActive) {
        console.log('[Widget] User scrolling in chat widget, setting active');
        setUserActive();
        clearFollowupTimer();
        
        // Clear existing scroll timeout
        if (widgetScrollTimeout) {
          clearTimeout(widgetScrollTimeout);
        }
        
        // Set timeout to detect when scrolling stops
        widgetScrollTimeout = setTimeout(() => {
          console.log('[Widget] Widget scroll stopped, checking followup timer');
          // Set user back to inactive since scrolling has stopped
          userIsActive = false;
          console.log('[Widget] User set to inactive after scroll stopped');
          
          // Check if we should restart followup timer
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && followupCount < 3) {
            console.log('[Widget] Restarting followup timer after widget scroll stopped');
            startFollowupTimer();
          }
        }, 3000); // 3 seconds after scrolling stops in widget
      }
    });
  }
  
  // Initialize widget
  function init() {
    console.log("🚀 [WIDGET INIT] Starting widget initialization...");
    
    // Track page load time for analytics
    window.appointyPageLoadTime = Date.now();
    
    // Add widget HTML
    widgetContainer.innerHTML = createWidgetHTML();
    
    // Setup scroll detection for the messages container
    setTimeout(setupWidgetScrollDetection, 100);
    
    // Add elements to column container in correct order
    widgetMainContainer.appendChild(widgetContainer); // Chat window first (top)
    widgetMainContainer.appendChild(toggleButton);    // Button second (bottom)
    
    // Add main container to page
    document.body.appendChild(widgetMainContainer);
    
    console.log("🎨 [WIDGET INIT] Widget HTML added to page");
    
    // Setup events
    setupEventListeners();
    
    console.log("🔗 [WIDGET INIT] Event listeners setup complete");
    
    // Initialize voices for speech functionality
    if (config.voiceEnabled) {
      initializeVoices();
    }
    
    // Add mirror iframe message listener
    if (mirrorEnabled) {
      setupMirrorMessageListener();
    }
    
    // Start page monitoring and load initial context (if enhanced detection is enabled)
    setTimeout(() => {
      if (config.enhancedDetection) {
        console.log("📡 [WIDGET INIT] Starting page monitoring and loading context");
        startPageMonitoring();
        // Load initial page context
        loadPageContext();
      }
    }, 1000);
    
    // Make sendMessage globally available for testing
    window.testSendMessage = sendMessage;
    
    console.log('✅ [WIDGET INIT] Widget initialized successfully');
    console.log('🧪 [WIDGET TEST] Test with: window.testSendMessage("I would like to schedule a demo")');
    
    // Track visitor for return visitor detection
    try {
      localStorage.setItem('chatbot_visited', 'true');
    } catch (e) {
      // Ignore localStorage errors (some browsers/modes block it)
    }
    
    // Add cleanup function for page monitoring
    window.addEventListener('beforeunload', cleanupPageMonitoring);

    // In onboarding-only mode, hide the floating toggle button and auto-open
    if (ONBOARDING_ONLY) {
      try {
        toggleButton.style.display = 'none';
      } catch (e) {}
      if (!isOpen) toggleWidget();
      try {
        sendProactiveMessage('Welcome! To start your registration, please share your name, email, and a password (min 8 chars).', [], '');
      } catch (e) {}
    }
  }
  
  // Setup message listener for mirror iframe
  function setupMirrorMessageListener() {
    window.addEventListener('message', (event) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;
      
      const data = event.data;
      if (data && data.type === 'mirror_ready') {
        console.log('🔍 [WIDGET MIRROR] Mirror iframe is ready');
        // Send initial scroll position
        if (mirrorIframe && mirrorIframe.contentWindow) {
          const scrollData = {
            type: 'sync_scroll',
            x: window.scrollX,
            y: window.scrollY,
            windowHeight: window.innerHeight,
            documentHeight: document.documentElement.scrollHeight
          };
          mirrorIframe.contentWindow.postMessage(scrollData, window.location.origin);
        }
      }
    });
  }
  
  // Cleanup page monitoring
  function cleanupPageMonitoring() {
    if (pageChangeCheckInterval) {
      clearInterval(pageChangeCheckInterval);
      pageChangeCheckInterval = null;
    }
    
    if (sectionObserver) {
      sectionObserver.disconnect();
      sectionObserver = null;
    }
    
    if (window.appointySectionTimeout) {
      clearTimeout(window.appointySectionTimeout);
      window.appointySectionTimeout = null;
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
      setBotAvatar: (avatarUrl) => {
        config.botAvatar = avatarUrl;
        // Re-render messages to update avatars
        if (isOpen && messages.length > 0) {
          renderMessages();
        }
      },
      setUserAvatar: (avatarUrl) => {
        config.userAvatar = avatarUrl;
        // Re-render messages to update avatars
        if (isOpen && messages.length > 0) {
          renderMessages();
        }
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
      isPageContextLoaded: () => isPageContextLoaded,
      
      // Mirror APIs
      setMirrorEnabled: (enabled) => {
        mirrorEnabled = !!enabled;
        config.mirrorMode = mirrorEnabled;
        console.log('🔍 [WIDGET MIRROR] Mirror enabled set to:', mirrorEnabled);
        
        const checkbox = document.getElementById('appointy-mirror-enabled');
        if (checkbox) checkbox.checked = mirrorEnabled;
        
        if (mirrorEnabled && isOpen) {
          console.log('🔍 [WIDGET MIRROR] Re-creating widget HTML with mirror enabled');
          // Re-create widget HTML with mirror
          widgetContainer.innerHTML = createWidgetHTML();
          setTimeout(() => initializeMirror(), 100);
          setTimeout(setupWidgetScrollDetection, 100);
        } else if (!mirrorEnabled && mirrorIframe) {
          mirrorIframe.style.display = 'none';
        }
        return mirrorEnabled;
      },
      toggleMirror: () => {
        if (mirrorEnabled) toggleMirror();
      },
      getMirrorEnabled: () => mirrorEnabled,
      getCurrentSection: () => currentViewportSection,
      sendSectionContext: (sectionName, customData) => {
        if (sectionName) {
          onSectionEnter(sectionName, document.body);
        }
      },
      
      // Debug functions
      debugMirror: () => {
        console.log('🔍 [WIDGET MIRROR DEBUG] Mirror state:', {
          mirrorEnabled,
          mirrorIframe,
          mirrorIframeDisplay: mirrorIframe?.style.display,
          mirrorIframeSrc: mirrorIframe?.src,
          isOpen,
          windowWidth: window.innerWidth
        });
        return {
          mirrorEnabled,
          mirrorIframe: !!mirrorIframe,
          isOpen,
          windowWidth: window.innerWidth
        };
      },
      forceMirrorInit: () => {
        console.log('🔍 [WIDGET MIRROR] Force initializing mirror...');
        mirrorEnabled = true;
        if (isOpen) {
          widgetContainer.innerHTML = createWidgetHTML();
          setTimeout(() => initializeMirror(), 100);
          setTimeout(setupWidgetScrollDetection, 100);
        }
        return 'Mirror force initialized';
      },
      
      // Question generation functions
      generateQuestionsForCurrentView: () => {
        const viewportContext = getViewportContext();
        const sectionData = {
          sectionName: currentViewportSection || 'current-view',
          sectionContent: extractSectionContent(document.body),
          scrollPosition: window.scrollY,
          scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
          timeOnPage: Date.now() - (window.appointyPageLoadTime || Date.now()),
          viewportContext: viewportContext
        };
        
        // Send the generated question to API immediately
        sendSectionContextToAPI(sectionData);
        console.log('🤔 [WIDGET QUESTIONS] Generated and sent questions for current view');
        return 'Questions generated and sent for current viewport';
      },
      
      getViewportContent: () => {
        return getViewportContext();
      },
      
      askContextualQuestion: (customQuestion) => {
        if (customQuestion) {
          const sectionData = {
            sectionName: currentViewportSection || 'custom',
            sectionContent: extractSectionContent(document.body),
            scrollPosition: window.scrollY,
            scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
            timeOnPage: Date.now() - (window.appointyPageLoadTime || Date.now())
          };
          
          // Send custom question to API
          sendApiRequest('chat', {
            sessionId,
            pageUrl: currentPageUrl,
            question: customQuestion,
            sectionContext: sectionData,
            contextual: true,
            hasBeenGreeted: hasBeenGreeted,
            proactiveMessageCount: proactiveMessageCount
          }).then(data => {
            if (data.mainText && data.mainText.trim()) {
              sendProactiveMessage(data.mainText);
            }
          }).catch(error => {
            console.error('❌ [WIDGET QUESTIONS] Failed to send custom question:', error);
          });
          
          console.log('💬 [WIDGET QUESTIONS] Sent custom contextual question:', customQuestion);
          return 'Custom question sent: ' + customQuestion;
        }
        return 'No question provided';
      }
    };
    
    console.log('AI Chatbot Widget loaded successfully');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Add mirror support script for iframe handling
  // This script handles messages from the host page when this page is loaded in a mirror iframe
  (function() {
    // Only run this in iframe context
    if (window !== window.parent) {
      console.log('🔍 [MIRROR] Page loaded in iframe, setting up mirror mode');
      
      // Listen for scroll sync messages from host
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        const data = event.data;
        if (data && data.type === 'sync_scroll') {
          // Sync scroll position with host page
          const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          const clampedY = Math.min(data.y || 0, maxY);
          window.scrollTo(data.x || 0, clampedY);
        }
      });
      
      // Notify host that mirror is ready
      window.parent.postMessage({ type: 'mirror_ready' }, window.location.origin);
      
      // Optimize for mirror mode
      document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('appointy-mirror-mode');
        
        // Pause videos and audio
        document.querySelectorAll('video, audio').forEach(media => {
          media.muted = true;
          if (media.pause) media.pause();
        });
        
        // Disable form interactions
        document.querySelectorAll('input, textarea, button, select').forEach(element => {
          element.disabled = true;
        });
        
        // Add mirror-specific styles
        const mirrorStyles = document.createElement('style');
        mirrorStyles.textContent = '' +
          '.appointy-mirror-mode * {' +
            'animation: none !important;' +
            'transition: none !important;' +
            'pointer-events: none !important;' +
          '}' +
          '.appointy-mirror-mode video,' +
          '.appointy-mirror-mode audio {' +
            'opacity: 0.7;' +
          '}' +
          '.appointy-mirror-mode form {' +
            'opacity: 0.8;' +
          '}';
        document.head.appendChild(mirrorStyles);
      });
    }
  })();
})();
`;

  return new Response(widgetScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate", // Disable cache for debugging
      Pragma: "no-cache",
      Expires: "0",
      ...corsHeaders, // Add CORS headers
    },
  });
}
