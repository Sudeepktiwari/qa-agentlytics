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

  // Conversation state tracking
  let hasBeenGreeted = localStorage.getItem('appointy_has_been_greeted') === 'true';
  let proactiveMessageCount = parseInt(localStorage.getItem('appointy_proactive_count') || '0');
  let visitedPages = JSON.parse(localStorage.getItem('appointy_visited_pages') || '[]');

  let followupTimer = null;
  let followupCount = 0;
  let followupSent = false;
  let lastUserAction = Date.now();
  let userIsActive = false;
  
  // Enhanced page detection variables
  let currentPageUrl = window.location.href;
  let isPageContextLoaded = false;
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
  
  // Send proactive message with voice and auto-opening
  function sendProactiveMessage(text) {
    if (!text) {
      console.log('[ChatWidget] No proactive message text provided');
      return;
    }
    
    console.log('🎯 [WIDGET PROACTIVE] Sending proactive message:', text.substring(0, 100) + '...');
    
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
    
    const proactiveMessage = {
      role: 'assistant',
      content: text,
      buttons: [],
      emailPrompt: '',
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
      console.log('📋 [WIDGET CONTEXT] Page context already loaded, skipping');
      return;
    }
    
    try {
      console.log('🔍 [WIDGET CONTEXT] Loading context for page:', currentPageUrl);
      
      // Get page-specific proactive message
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true,
        hasBeenGreeted: hasBeenGreeted,
        proactiveMessageCount: proactiveMessageCount,
        visitedPages: visitedPages
        // Don't specify adminId - let the API extract it from the API key
      });
      
      console.log('📨 [WIDGET CONTEXT] API response for proactive request:', data);
      
      // Update bot mode indicator
      if (data.botMode) {
        updateBotModeIndicator(data.botMode, data.userEmail);
      }
      
      if (data.answer) {
        console.log('✉️ [WIDGET CONTEXT] Received proactive message from API:', data.answer.substring(0, 100) + '...');
        // Send proactive message if auto-open is enabled
        if (config.autoOpenProactive) {
          console.log('🎯 [WIDGET CONTEXT] Auto-open enabled, sending proactive message');
          sendProactiveMessage(data.answer);
        } else {
          console.log('🔒 [WIDGET CONTEXT] Auto-open disabled, not sending proactive message');
        }
        isPageContextLoaded = true;
        console.log('✅ [WIDGET CONTEXT] Page context loaded successfully');
      } else {
        console.log('❌ [WIDGET CONTEXT] No proactive message received from API');
        console.log('🔍 [WIDGET CONTEXT] Full API response:', data);
      }
    } catch (error) {
      console.error('❌ [WIDGET CONTEXT] Failed to load page context:', error);
    }
  }
  
  // Update bot mode indicator
  function updateBotModeIndicator(botMode, userEmail) {
    const indicator = document.getElementById('appointy-bot-mode-indicator');
    if (!indicator) return;
    
    console.log('[Widget] Updating bot mode indicator:', { botMode, userEmail });
    
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
    // Send contextual data to API for potential proactive messages
    const sectionData = {
      sectionName,
      sectionContent: extractSectionContent(element),
      scrollPosition: window.scrollY,
      scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
      timeOnPage: Date.now() - (window.appointyPageLoadTime || Date.now()),
      viewportContext: getViewportContext()
    };
    
    // Generate contextual questions immediately
    generateContextualQuestions(sectionData);
    
    // Debounce section-based proactive messages
    clearTimeout(window.appointySectionTimeout);
    window.appointySectionTimeout = setTimeout(() => {
      sendSectionContextToAPI(sectionData);
    }, 3000); // Wait 3 seconds before sending section context
  }
  
  // Get current viewport context
  function getViewportContext() {
    const viewportHeight = window.innerHeight;
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + viewportHeight;
    const scrollPercentage = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    
    // Find all visible elements
    const visibleElements = [];
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, form, button, a, [data-price], .price, .pricing, .feature, .benefit');
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = viewportTop + rect.top;
      const elementBottom = elementTop + rect.height;
      
      // Check if element is at least 30% visible in viewport
      const visibleHeight = Math.min(elementBottom, viewportBottom) - Math.max(elementTop, viewportTop);
      const visibilityPercentage = visibleHeight / rect.height;
      
      if (visibilityPercentage > 0.3) {
        visibleElements.push({
          tagName: el.tagName.toLowerCase(),
          text: el.textContent.trim().substring(0, 200),
          className: el.className,
          id: el.id,
          isButton: el.tagName.toLowerCase() === 'button' || el.getAttribute('role') === 'button',
          isForm: el.tagName.toLowerCase() === 'form',
          isPricing: el.className.includes('price') || el.hasAttribute('data-price'),
          href: el.href || null,
          visibilityPercentage: Math.round(visibilityPercentage * 100)
        });
      }
    });
    
    return {
      visibleElements: visibleElements.slice(0, 10), // Limit to top 10 visible elements
      scrollDepth: scrollPercentage,
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: viewportHeight
    };
  }
  
  // Generate contextual questions based on what user is viewing
  function generateContextualQuestions(sectionData) {
    const questions = [];
    const { sectionName, sectionContent, viewportContext } = sectionData;
    
    console.log('🤔 [WIDGET QUESTIONS] Generating questions for section:', sectionName);
    console.log('📊 [WIDGET QUESTIONS] Viewport context:', viewportContext);
    
    // Pricing section questions
    if (sectionName.includes('pricing') || sectionContent.hasPricing) {
      questions.push(
        "Which pricing plan fits your team size?",
        "Would you like me to calculate the ROI for your use case?",
        "Do you have questions about what's included in each plan?",
        "Need help comparing our plans with competitors?"
      );
    }
    
    // Features section questions
    else if (sectionName.includes('features') || sectionName.includes('capabilities')) {
      questions.push(
        "Which of these features is most important for your workflow?",
        "Would you like to see a demo of any specific feature?",
        "How does your current solution handle these requirements?",
        "Do you need integration with any specific tools?"
      );
    }
    
    // Contact/Form section questions
    else if (sectionContent.hasForm || sectionName.includes('contact')) {
      questions.push(
        "Would you like me to help you fill out this form?",
        "Do you prefer to schedule a call instead?",
        "What's the best time to reach you?",
        "Any specific questions I can answer before you submit?"
      );
    }
    
    // About/Company section questions
    else if (sectionName.includes('about') || sectionName.includes('company') || sectionName.includes('mission')) {
      questions.push(
        "What drew you to learn more about our company?",
        "Are you evaluating us against other solutions?",
        "What's most important in a vendor partnership for you?",
        "Would you like to speak with someone from our team?"
      );
    }
    
    // Testimonials section questions
    else if (sectionName.includes('testimonial') || sectionName.includes('review') || sectionName.includes('customer')) {
      questions.push(
        "Do any of these use cases sound similar to yours?",
        "Would you like to speak with one of our existing customers?",
        "What results are you hoping to achieve?",
        "How do you currently measure success in this area?"
      );
    }
    
    // Product/Solution section questions
    else if (sectionName.includes('product') || sectionName.includes('solution') || sectionName.includes('how-it-works')) {
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
      console.log('💡 [WIDGET QUESTIONS] Selected question:', selectedQuestion);
      
      // Don't send immediately - wait a bit for user to read
      setTimeout(() => {
        if (!userIsActive && currentViewportSection === sectionName) {
          sendContextualQuestion(selectedQuestion, sectionData);
        }
      }, 5000); // Wait 5 seconds
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
    console.log('💬 [WIDGET QUESTIONS] Sending contextual question:', question);
    
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
    
    // Auto-open chat if configured
    if (config.autoOpenProactive && !isOpen) {
      console.log('🚪 [WIDGET QUESTIONS] Auto-opening chat for contextual question');
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
    const buttons = [];
    const { sectionName, sectionContent } = sectionData;
    
    if (question.includes('pricing') || question.includes('plan') || sectionContent.hasPricing) {
      buttons.push("Show me pricing", "Calculate ROI", "Compare plans", "I need enterprise features");
    } else if (question.includes('demo') || question.includes('see this')) {
      buttons.push("Yes, show me a demo", "Schedule a call", "Send me a video", "Not right now");
    } else if (question.includes('help') || question.includes('questions')) {
      buttons.push("Yes, I have questions", "Tell me more", "Show me benefits", "Contact sales");
    } else if (question.includes('ready') || question.includes('get started')) {
      buttons.push("Yes, let's get started", "I need more info", "Schedule a call", "Send me details");
    } else if (question.includes('contact') || question.includes('call')) {
      buttons.push("Yes, contact me", "Email me instead", "I'll reach out later", "More questions first");
    } else {
      // Default buttons based on section
      if (sectionName.includes('pricing')) {
        buttons.push("Show pricing details", "Compare options", "Contact sales");
      } else if (sectionName.includes('features')) {
        buttons.push("Show me a demo", "Tell me more", "How does it work?");
      } else {
        buttons.push("Yes, help me", "Tell me more", "Not right now");
      }
    }
    
    return buttons.slice(0, 3); // Limit to 3 buttons max
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
      
      if (data.answer && data.answer.trim()) {
        console.log('🎯 [WIDGET MIRROR] Received contextual message for section:', sectionData.sectionName);
        sendProactiveMessage(data.answer);
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
            <div id="appointy-bot-mode-indicator" style="width: 12px; height: 12px; border-radius: 50%; background-color: #7b1fa2; flex-shrink: 0;" title="Lead Mode">
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            \${mirrorEnabled ? '<button id="appointy-mirror-toggle" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" title="Toggle Mirror View">👁️</button>' : ''}
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
  }
  
  // Start followup timer
  function startFollowupTimer() {
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
    }, 30000); // 30 seconds
    console.log('[Widget] Followup timer set for 30 seconds');
  }
  
  // Send API request
  async function sendApiRequest(endpoint, data) {
    console.log("🚀 [WIDGET API] Sending request to:", endpoint);
    console.log("📤 [WIDGET API] Request data:", data);
    
    try {
      const response = await fetch(\`\${CHATBOT_API_BASE}/api/\${endpoint}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(data)
      });
      
      console.log("📥 [WIDGET API] Response status:", response.status);
      
      const responseData = await response.json();
      
      console.log("🤖 [WIDGET AI RESPONSE] Raw AI response received:");
      console.log("==========================================");
      console.log("Full response data:", responseData);
      console.log("AI Answer:", responseData.answer || responseData.mainText || "No answer field");
      console.log("Buttons:", responseData.buttons || "No buttons");
      console.log("Email Prompt:", responseData.emailPrompt || "No email prompt");
      console.log("Bot Mode:", responseData.botMode || "No bot mode");
      console.log("==========================================");
      
      return responseData;
    } catch (error) {
      console.error('❌ [WIDGET API] Error:', error);
      return { error: 'Connection failed' };
    }
  }
  
  // Send followup message
  async function sendFollowupMessage() {
    console.log('[Widget] Sending followup message', { followupCount, sessionId });
    const currentUrl = window.location.href;
    
    try {
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentUrl,
        followup: true,
        followupCount
        // Don't specify adminId - let the API extract it from the API key
      });
      
      console.log('[Widget] Followup API response:', data);
      
      // Update bot mode indicator
      if (data.botMode) {
        updateBotModeIndicator(data.botMode, data.userEmail);
      }
      
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
        console.log('[Widget] Followup message added, new count:', followupCount);
        
        // Auto-open chat if it's closed and user hasn't opened it yet
        if (!isOpen && config.autoOpenProactive) {
          console.log('[Widget] Auto-opening chat for followup message');
          toggleWidget();
        }
        
        // Continue followup chain
        startFollowupTimer();
      } else {
        console.log('[Widget] No followup message content received from API');
      }
    } catch (error) {
      console.error('[Widget] Error sending followup message:', error);
    }
    
    followupSent = false;
  }
  
  // Send message
  async function sendMessage(text) {
    if (!text.trim()) return;
    
    console.log("💬 [WIDGET MESSAGE] User sending message:", text);
    
    resetUserActivity();
    
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
    
    // Update bot mode indicator
    if (data.botMode) {
      updateBotModeIndicator(data.botMode, data.userEmail);
    }
    
    let botResponse = '';
    if (data.error) {
      console.log("❌ [WIDGET MESSAGE] Error in API response:", data.error);
      const errorMessage = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
      messages.push(errorMessage);
      botResponse = errorMessage.content;
    } else {
      console.log("🎯 [WIDGET MESSAGE] Creating bot response:");
      console.log("Main Text:", data.mainText || data.answer || 'I received your message.');
      console.log("Buttons:", data.buttons || []);
      console.log("Email Prompt:", data.emailPrompt || '');
      
      const botMessage = {
        role: 'assistant',
        content: data.mainText || data.answer || 'I received your message.',
        buttons: data.buttons || [],
        emailPrompt: data.emailPrompt || ''
      };
      messages.push(botMessage);
      botResponse = botMessage.content;
      console.log('[Widget] Bot response received, starting followup timer');
      startFollowupTimer();
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
        \`;
        
        contentWrapper.appendChild(botAvatar);
        contentWrapper.appendChild(bubbleDiv);
        messageDiv.appendChild(contentWrapper);
        
        // Bot message with potential buttons and email prompt
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = formatMessageText(msg.content);
        bubbleDiv.appendChild(contentDiv);
        
        console.log("🔘 [WIDGET RENDER] Message buttons:", msg.buttons);
        console.log("📧 [WIDGET RENDER] Message emailPrompt:", msg.emailPrompt);
        
        // Add buttons if present
        if (msg.buttons && msg.buttons.length > 0) {
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
        }
        
        // Add email prompt if present
        if (msg.emailPrompt && msg.emailPrompt.trim()) {
          const emailDiv = document.createElement('div');
          emailDiv.style.cssText = 'margin-top: 8px;';
          
          const promptText = document.createElement('div');
          promptText.textContent = msg.emailPrompt;
          promptText.style.cssText = 'margin-bottom: 8px; color: white; font-size: 13px;';
          emailDiv.appendChild(promptText);
          
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
        }
        
        messageDiv.appendChild(bubbleDiv);
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
    
    // If page context loading didn't provide a proactive message, send default
    if (messages.length === 0) {
      console.log('[ChatWidget] No page-specific context found, using default message');
      const data = await sendApiRequest('chat', {
        sessionId,
        pageUrl: currentPageUrl,
        proactive: true
        // Don't specify adminId - let the API extract it from the API key
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
    console.log('[Widget] Toggling widget, now open:', isOpen);
    widgetContainer.style.display = isOpen ? 'flex' : 'none';
    
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
  
  // Initialize widget
  function init() {
    console.log("🚀 [WIDGET INIT] Starting widget initialization...");
    
    // Track page load time for analytics
    window.appointyPageLoadTime = Date.now();
    
    // Add widget HTML
    widgetContainer.innerHTML = createWidgetHTML();
    
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
    
    console.log('✅ [WIDGET INIT] Widget initialized successfully');
    // Add cleanup function for page monitoring
    window.addEventListener('beforeunload', cleanupPageMonitoring);
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
            if (data.answer && data.answer.trim()) {
              sendProactiveMessage(data.answer);
            }
          }).catch(error => {
            console.error('❌ [WIDGET QUESTIONS] Failed to send custom question:', error);
          });
          
          console.log('💬 [WIDGET QUESTIONS] Sent custom contextual question:', customQuestion);
          return 'Custom question sent: ' + customQuestion;
        }
        return 'No question provided';
      },
          return 'Custom question sent';
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
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      ...corsHeaders, // Add CORS headers
    },
  });
}
