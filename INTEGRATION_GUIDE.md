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

#### 🎨 **Visual Customization**

The widget comes with default styling, but you can customize it by adding CSS:

```css
/* Customize the toggle button */
#appointy-chatbot-toggle {
  background: your-brand-color !important;
  width: 70px !important;
  height: 70px !important;
}

/* Customize the widget */
#appointy-chatbot-widget {
  width: 400px !important;
  height: 600px !important;
}
```

#### ⚙️ **Advanced Configuration**

You can modify the widget behavior by updating the script parameters:

```html
<script
  src="YOUR_CHATBOT_DOMAIN/api/widget"
  data-api-key="YOUR_API_KEY"
  data-position="bottom-left"
  data-theme="dark"
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

Here's a complete example of how to add the chatbot to your website:

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

    <!-- Chatbot Widget Script -->
    <script
      src="https://your-chatbot-domain.com/api/widget"
      data-api-key="ak_your_api_key_here"
    ></script>
  </body>
</html>
```

The widget will automatically:

- Load when the page loads
- Detect the current page URL
- Provide contextual responses
- Handle user interactions
- Manage follow-up timing
- Collect leads when appropriate

That's it! Your chatbot is now live and ready to engage with your website visitors.
