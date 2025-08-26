# 📋 Enhanced Content Detection Implementation Plan

## 🎯 Goal

Make visible content detection more accurate so AI generates highly relevant questions and responses based on what users are actually viewing.

## 📊 Current State Analysis

### ✅ What Works:

- Basic viewport detection (30% visibility threshold)
- Simple element detection (headings, paragraphs, forms, buttons)
- Basic pricing/form detection
- Widget injection working properly

### ❌ What Needs Enhancement:

- **Limited content depth** - only captures first paragraph
- **Poor semantic understanding** - no content categorization
- **Weak business intent detection** - minimal CTA recognition
- **Basic section detection** - simple string matching only
- **Missing content hierarchy** - no understanding of content relationships
- **No dynamic content detection** - misses SPA/React updates

## 🚀 Enhancement Plan

### **Phase 1: Enhanced Viewport Content Analysis**

**Goal**: Capture more meaningful content from visible areas

#### 1.1 Advanced Element Detection

- **Current**: `h1, h2, h3, h4, h5, h6, p, form, button, a, [data-price], .price, .pricing, .feature, .benefit`
- **Enhanced**: Add semantic selectors:

  ```javascript
  // Business Intent Elements
  '[class*="cta"], [class*="call-to-action"], [class*="signup"], [class*="trial"]';

  // Content Structure
  'article, section, main, aside, [role="main"], [role="article"]';

  // Pricing & Product
  '[class*="plan"], [class*="package"], [class*="tier"], [class*="product"], [class*="service"]';

  // Social Proof
  '[class*="testimonial"], [class*="review"], [class*="customer"], [class*="case-study"]';

  // Media & Rich Content
  'img[alt], figure, figcaption, video, [class*="hero"], [class*="banner"]';
  ```

#### 1.2 Smarter Text Extraction

- **Current**: Only first paragraph (200 chars)
- **Enhanced**:
  - Extract ALL visible paragraphs within viewport
  - Capture list items (`li`, `ul`, `ol`)
  - Get image alt text and captions
  - Extract button/link text with context
  - Capture form labels and placeholders

#### 1.3 Content Hierarchy Detection

```javascript
// Detect content structure
const contentStructure = {
  mainHeading: "", // h1 or largest heading
  subHeadings: [], // h2-h6 in order
  keyParagraphs: [], // All visible paragraphs
  bulletPoints: [], // List items
  ctaElements: [], // Buttons, links with action intent
  socialProof: [], // Testimonials, reviews, logos
  mediaElements: [], // Images, videos with descriptions
};
```

### **Phase 2: Semantic Content Understanding**

**Goal**: Understand WHAT the content is about, not just what elements exist

#### 2.1 Business Intent Classification

```javascript
const contentIntent = {
  type:
    "pricing" |
    "features" |
    "testimonials" |
    "hero" |
    "contact" |
    "about" |
    "product" |
    "comparison",
  confidence: 0.85, // 0-1 confidence score
  indicators: [
    "pricing table detected",
    "dollar amounts found",
    "plan comparison",
  ],
  businessStage: "awareness" | "consideration" | "decision" | "action",
};
```

#### 2.2 Content Categorization Engine

- **Product Information**: Features, benefits, capabilities
- **Social Proof**: Reviews, testimonials, case studies, logos
- **Pricing**: Plans, packages, cost comparisons
- **Call-to-Action**: Contact forms, signup buttons, trial offers
- **Company**: About, team, mission, values
- **Support**: FAQ, documentation, help content

#### 2.3 User Journey Stage Detection

- **Awareness**: Blog posts, educational content, problem descriptions
- **Consideration**: Feature comparisons, case studies, demos
- **Decision**: Pricing, trials, ROI calculators
- **Action**: Contact forms, signup processes, onboarding

### **Phase 3: Dynamic Content Intelligence**

**Goal**: Handle modern web apps and dynamic content

#### 3.1 SPA/React Content Detection

- Listen for DOM mutations
- Detect route changes
- Re-analyze content after dynamic updates
- Handle lazy-loaded content

#### 3.2 Real-time Content Monitoring

```javascript
// Monitor content changes
const contentObserver = new MutationObserver((mutations) => {
  // Re-analyze visible content when DOM changes
  if (hasSignificantContentChange(mutations)) {
    updateContentAnalysis();
  }
});
```

#### 3.3 Context Accumulation

- Track content viewing history
- Build user interest profile
- Understand content relationships
- Detect content patterns

### **Phase 4: AI-Optimized Content Delivery**

**Goal**: Package content perfectly for AI question generation

#### 4.1 Rich Content Context

```javascript
const aiContentContext = {
  // Current visible content
  primaryContent: {
    section: "pricing",
    heading: "Choose Your Plan",
    description: "Three tiers designed for different team sizes...",
    keyPoints: ["Basic: $9/month", "Pro: $29/month", "Enterprise: Custom"],
    contentType: "pricing_comparison",
    businessIntent: "decision_stage",
  },

  // Content relationships
  relatedContent: {
    previousSections: ["features", "benefits"],
    nextSection: "testimonials",
    contentFlow: "features → pricing → social_proof",
  },

  // User behavior context
  userContext: {
    timeOnSection: 45000, // 45 seconds
    scrollDepth: 0.7,
    interactionHistory: ["clicked_feature_demo", "viewed_pricing"],
    visitedSections: ["hero", "features", "pricing"],
  },
};
```

#### 4.2 Content Summarization

- Extract key value propositions
- Identify unique selling points
- Summarize complex technical content
- Highlight important benefits/features

## 🛠️ Implementation Strategy

### **Incremental Rollout:**

1. **Phase 1A**: Enhanced element detection (low risk)
2. **Phase 1B**: Improved text extraction (medium risk)
3. **Phase 2A**: Basic content categorization (medium risk)
4. **Phase 2B**: Business intent detection (high value)
5. **Phase 3**: Dynamic content handling (advanced)

### **Testing Protocol:**

- Test widget injection after each phase
- Validate AI question quality improvement
- Monitor performance impact
- A/B test question relevance

### **Success Metrics:**

- **Accuracy**: Questions match visible content 90%+
- **Relevance**: User engagement with AI questions +50%
- **Performance**: Content analysis <100ms
- **Reliability**: Widget injection success rate 99%+

## 📈 Expected Outcomes

### **Before Enhancement:**

- Generic questions: "What questions do you have about what you're reading?"
- Limited context: Only basic element detection
- Poor accuracy: ~60% relevance to actual content

### **After Enhancement:**

- Specific questions: "I see you're comparing our Pro and Enterprise plans. Which team size range are you planning for?"
- Rich context: Full semantic understanding of content
- High accuracy: 90%+ relevance to visible content

## 🔄 Next Steps

1. **Choose starting phase** (recommend Phase 1A)
2. **Implement incrementally** with testing after each step
3. **Validate widget injection** continues working
4. **Measure improvement** in question quality
5. **Iterate based on results**

Ready to start with Phase 1A - Enhanced Element Detection? 🚀
