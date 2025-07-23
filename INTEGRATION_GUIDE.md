# Chatbot Integration Guide

## How to Embed the Chatbot on Your Website

### Step 1: Get Your API Key

1. Log into your admin panel at your chatbot domain
2. Navigate to the "Website Integration" section
3. Click "Generate API Key" to create your authentication token
4. Copy and securely store your API key

### Step 2: Add the Widget Script

Add this script tag to your website's HTML, preferably before the closing `</body>` tag:

```html
<script
  src="YOUR_CHATBOT_DOMAIN/api/widget"
  data-api-key="YOUR_API_KEY"
></script>
```

Replace:

- `YOUR_CHATBOT_DOMAIN` with your actual chatbot domain
- `YOUR_API_KEY` with the API key from Step 1

### Step 3: How It Works

The chatbot widget will:

#### 🎯 **Automatic Page Detection**

- Detects which page the user is currently viewing
- Uses `window.location.href` to get the current URL
- Matches the URL against your crawled sitemap data
- Provides contextual responses based on page content

#### 🤖 **Smart Conversation Flow**

- **Proactive Welcome**: Greets users with page-specific information
- **Contextual Responses**: Answers based on your uploaded content
- **Follow-up Messages**: Sends relevant follow-ups after 30 seconds of inactivity
- **Lead Generation**: Collects email addresses when appropriate

#### 📱 **User Experience**

- **Floating Button**: Appears in bottom-right corner
- **Expandable Widget**: Clean, responsive chat interface
- **Activity Detection**: Pauses follow-ups when user is typing
- **Smart Timing**: Resets timers when user interacts

### Step 4: Authentication & Security

#### 🔐 **API Key Authentication**

- Each request includes your API key in headers
- All conversations are linked to your admin account
- Email leads are automatically captured and stored

#### 🛡️ **Security Best Practices**

- Keep your API key secure and never expose it in client-side code
- The widget script handles authentication automatically
- Regenerate API keys if you suspect compromise

### Step 5: Customization Options

#### 🎨 **Basic Customization**

The widget supports extensive customization through data attributes:

```html
<script
  src="YOUR_CHATBOT_DOMAIN/api/widget"
  data-api-key="YOUR_API_KEY"
  data-theme="blue"
  data-size="medium"
  data-position="bottom-right"
  data-chat-title="Chat with us"
  data-button-text="💬"
></script>
```

#### 🎯 **Available Themes**

Choose from pre-built themes:

```html
<!-- Blue Theme (Default) -->
data-theme="blue"

<!-- Green Theme -->
data-theme="green"

<!-- Purple Theme -->
data-theme="purple"

<!-- Orange Theme -->
data-theme="orange"

<!-- Dark Theme -->
data-theme="dark"

<!-- Custom Brand Colors -->
data-theme="custom" data-brand-color="#ff6b35"
```

#### 📏 **Widget Sizes**

```html
<!-- Small: 300x400px -->
data-size="small"

<!-- Medium: 350x500px (Default) -->
data-size="medium"

<!-- Large: 400x600px -->
data-size="large"
```

#### 📍 **Widget Position**

```html
<!-- Bottom Right (Default) -->
data-position="bottom-right"

<!-- Bottom Left -->
data-position="bottom-left"

<!-- Top Right -->
data-position="top-right"

<!-- Top Left -->
data-position="top-left"
```

#### ✏️ **Text Customization**

```html
<!-- Custom chat title -->
data-chat-title="Need Help?"

<!-- Custom button icon/text -->
data-button-text="🚀" data-button-text="Help"

<!-- Custom welcome message -->
data-welcome-message="Hi! How can we help you today?"
```

#### 🎨 **Advanced CSS Customization**

For even more control, add custom CSS:

```css
/* Customize the toggle button */
#appointy-chatbot-toggle {
  background: linear-gradient(45deg, #ff6b35, #f7931e) !important;
  width: 70px !important;
  height: 70px !important;
  font-size: 28px !important;
}

/* Customize the widget container */
#appointy-chatbot-widget {
  width: 400px !important;
  height: 600px !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
}

/* Customize the header */
#appointy-chatbot-widget .header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
```

#### 🔧 **Complete Customization Example**

```html
<script
  src="YOUR_CHATBOT_DOMAIN/api/widget"
  data-api-key="YOUR_API_KEY"
  data-theme="custom"
  data-brand-color="#ff6b35"
  data-size="large"
  data-position="bottom-left"
  data-chat-title="🚀 Support Chat"
  data-button-text="Help"
  data-welcome-message="Welcome! How can our team assist you today?"
></script>
```

### Step 6: Analytics & Lead Management

#### 📊 **Conversation Tracking**

- All conversations are stored in your admin dashboard
- Email addresses are automatically captured and linked
- Track user engagement and response patterns

#### 📧 **Lead Generation**

- Users can provide email addresses during conversations
- Email leads are stored with conversation context
- Access leads through your admin panel

### Step 7: Content Management

#### 📝 **Sitemap Integration**

- Upload your sitemap.xml to enable page-specific responses
- The system crawls and indexes your content automatically
- Updates reflect immediately in chat responses

#### 🔄 **Content Updates**

- Re-crawl your sitemap when content changes
- Upload additional documents for broader knowledge base
- Manage content through the admin panel

### Troubleshooting

#### Common Issues:

**Widget not appearing:**

- Check that the API key is correct
- Verify the script URL is accessible
- Check browser console for JavaScript errors

**No contextual responses:**

- Ensure your sitemap has been crawled
- Check that the current page URL exists in your sitemap
- Verify content was successfully extracted

**Authentication errors:**

- Regenerate your API key if needed
- Ensure the API key hasn't expired
- Check that your account is active

### Support

For technical support or questions:

1. Check your admin panel for error logs
2. Verify your sitemap crawl status
3. Test the widget on different pages
4. Contact support with specific error messages

### Example Implementation

Here are examples of how to add the chatbot with different customizations:

#### 🔵 **Basic Implementation**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Your Website</title>
  </head>
  <body>
    <!-- Your website content -->
    <h1>Welcome to our website</h1>
    <p>Your content here...</p>

    <!-- Basic Chatbot Widget -->
    <script
      src="https://your-chatbot-domain.com/api/widget"
      data-api-key="ak_your_api_key_here"
    ></script>
  </body>
</html>
```

#### 🎨 **Fully Customized Implementation**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Your Website</title>
    <style>
      /* Optional: Additional custom styling */
      #appointy-chatbot-toggle {
        background: linear-gradient(45deg, #667eea, #764ba2) !important;
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3) !important;
      }
    </style>
  </head>
  <body>
    <!-- Your website content -->
    <h1>Welcome to our website</h1>
    <p>Your content here...</p>

    <!-- Customized Chatbot Widget -->
    <script
      src="https://your-chatbot-domain.com/api/widget"
      data-api-key="ak_your_api_key_here"
      data-theme="purple"
      data-size="large"
      data-position="bottom-left"
      data-chat-title="🚀 Get Help"
      data-button-text="Support"
      data-welcome-message="Hi there! Our team is here to help you."
    ></script>
  </body>
</html>
```

#### 🏢 **E-commerce Example**

```html
<script
  src="https://your-chatbot-domain.com/api/widget"
  data-api-key="ak_your_api_key_here"
  data-theme="green"
  data-size="medium"
  data-chat-title="🛍️ Shop Assistant"
  data-button-text="🛒"
  data-welcome-message="Looking for something? Let me help you find it!"
></script>
```

#### 🏥 **Healthcare Example**

```html
<script
  src="https://your-chatbot-domain.com/api/widget"
  data-api-key="ak_your_api_key_here"
  data-theme="blue"
  data-size="large"
  data-chat-title="🏥 Patient Support"
  data-button-text="💊"
  data-welcome-message="How can we assist with your healthcare needs today?"
></script>
```

The widget will automatically:

- Load when the page loads
- Detect the current page URL
- Provide contextual responses
- Handle user interactions
- Manage follow-up timing
- Collect leads when appropriate

That's it! Your chatbot is now live and ready to engage with your website visitors.
