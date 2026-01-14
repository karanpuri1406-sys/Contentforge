# BlogForge AI - Professional SEO Blog Generator

🚀 **Live Demo**: https://5173-i57gqy9s2kiht89j1qaiv-02b9cc79.sandbox.novita.ai

A cutting-edge, SEO-optimized blog content generation platform that creates high-ranking articles using your own AI API keys. No markups, no subscriptions - just powerful AI-driven content creation.

![BlogForge AI Banner](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Unique Selling Points

### 1. 🔑 Bring Your Own API Key (BYOK)
- **Gemini API** (FREE) - Google's powerful AI model at no cost
- **OpenRouter** (PAID) - Access to Claude Sonnet 4/4.5 for premium quality
- **100% Local Storage** - Your API keys never leave your browser
- **No Platform Markup** - Pay only for AI usage, not our fees

### 2. 📝 Direct WordPress Publishing
- One-click publishing to your WordPress site
- WordPress REST API integration
- Automatic category and tag assignment
- Yoast SEO metadata support
- Application password authentication (secure)

### 3. 🎯 Advanced SEO Optimization
- **Keyword Optimization**: Natural keyword placement with 1-2% density
- **Meta Tags**: Auto-generated meta titles and descriptions
- **Schema Markup**: Automatic structured data
- **Internal Linking**: Sitemap import for automatic internal link suggestions
- **LSI Keywords**: Semantic keyword variations
- **Readability**: 6th-grade Flesch-Kincaid reading level

### 4. 🔍 Competitor Analysis
- Analyze up to 5 top-ranking articles
- Extract keywords, headings, and content structure
- Identify content gaps
- Generate superior content that outranks competitors

### 5. 🎨 Beautiful HTML Output
- **Interactive Widgets**: Comparison tables, FAQ accordions, callout boxes
- **Rich Formatting**: Proper heading hierarchy, semantic HTML
- **Responsive Design**: Mobile-optimized content
- **Custom Elements**: Progress bars, rating displays, info boxes

### 6. 🔗 Internal Linking System
- Import your sitemap (XML)
- Automatic relevant link suggestions
- Improves site hierarchy and SEO
- Contextual anchor text

### 7. 📊 Local Database (IndexedDB)
- **100% Privacy**: All data stored locally in browser
- **No Server Required**: Works entirely offline after loading
- **Fast Access**: Instant article retrieval
- **Unlimited Storage**: Store thousands of articles

### 8. 🎭 Brand Voice Customization
- Define multiple brand voices
- Consistent tone across articles
- Custom characteristics and vocabulary
- Personality-driven content

---

## 🚀 Key Features

### Content Generation
- **5 Article Types**:
  - ✅ Informational Articles
  - ✅ Product Reviews
  - ✅ Product Roundups
  - ✅ How-To Guides
  - ✅ Listicles

- **Customization Options**:
  - Topic and target keywords
  - Article type and tone
  - Language support (9+ languages)
  - Intended audience
  - Custom word count (500-5000)
  - First-person perspective
  - Stories and examples
  - Engaging hooks
  - Citations and references
  - HTML interactive elements

### SEO Features
- Live web research integration
- Competitor analysis
- Internal link suggestions
- Meta tag generation
- Keyword density optimization
- E-E-A-T optimization
- Schema markup ready

### Article Elements (Toggleable)
- ✅ **Hook**: Attention-grabbing introduction
- ✅ **First Person**: "I" or "We" perspective
- ✅ **Stories & Examples**: Real-world case studies
- ✅ **HTML Elements**: Tables, accordions, callouts
- ✅ **Citations**: Formal references and sources
- ✅ **Internal Links**: Auto-suggested relevant links

### WordPress Integration
- Direct publishing
- Draft/Publish status control
- Featured image support
- Category and tag assignment
- Yoast SEO integration
- Application password security

---

## 📋 Complete Feature List

### 🎨 User Interface
- ✅ Modern dark theme with purple accents
- ✅ Responsive sidebar navigation
- ✅ Dashboard with usage statistics
- ✅ Beautiful gradient cards and effects
- ✅ Intuitive form layouts
- ✅ Real-time generation progress
- ✅ Toast notifications for success/errors

### 🔧 Settings Management
- ✅ **API Keys Tab**
  - Add/remove Gemini and OpenRouter keys
  - Toggle active/inactive status
  - Nickname support
  - Usage tracking (coming soon)
  
- ✅ **WordPress Tab**
  - Multiple site support
  - Connection testing
  - Application password setup
  - Active/inactive toggle
  
- ✅ **Brand Voice Tab**
  - Create custom brand voices
  - Define characteristics
  - Set default voice
  - Tone selection
  
- ✅ **Internal Links Tab**
  - Sitemap import
  - URL metadata extraction
  - Keyword-based search
  - Bulk link management

### 📚 Article Library
- ✅ List all generated articles
- ✅ Search by title/topic
- ✅ Filter by status (draft/published)
- ✅ Quick preview
- ✅ Delete articles
- ✅ View detailed statistics

### 📄 Article View
- ✅ Beautiful preview rendering
- ✅ HTML source view toggle
- ✅ Copy HTML to clipboard
- ✅ Download HTML file
- ✅ Publish to WordPress
- ✅ Article metadata display
- ✅ SEO keywords display
- ✅ Competitor URLs reference
- ✅ Features used summary

### 🤖 AI Generation
- ✅ Exceptional prompting system
- ✅ Context-aware generation
- ✅ TL;DR summaries
- ✅ FAQ sections
- ✅ Conclusion with CTA
- ✅ Natural keyword integration
- ✅ E-E-A-T optimization
- ✅ Engaging storytelling

---

## 🛠 Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: TailwindCSS 3.4
- **Routing**: React Router v7
- **Database**: Dexie (IndexedDB wrapper)
- **AI Integration**: 
  - Google Generative AI SDK (Gemini)
  - OpenRouter API (Claude)
- **Scraping**: Cheerio + Axios
- **Icons**: Lucide React

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
No environment variables needed! Everything is stored locally in IndexedDB.

---

## 🔑 API Key Setup

### Gemini API (Recommended - FREE)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Go to Settings > API Keys in BlogForge AI
5. Select "Gemini" as provider
6. Paste your key and save

**Free Tier Limits**:
- 60 requests per minute
- 1500 requests per day
- Perfect for blog generation!

### OpenRouter (Optional - PREMIUM)
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create account and get API key
3. Add credits to your account
4. Go to Settings > API Keys in BlogForge AI
5. Select "OpenRouter" as provider
6. Paste your key and save

**Models Available**:
- Claude 3.5 Sonnet (Best quality)
- Claude 3 Opus
- GPT-4 Turbo
- And many more

---

## 📝 How to Use

### 1. Generate Your First Article

1. **Navigate to Generate Content** page
2. **Fill in the form**:
   - Topic: "Best Coffee Brewing Methods"
   - Target Keyword: "coffee brewing"
   - Article Type: Informational
   - Tone: Conversational
   - Word Count: 2000

3. **Configure Features**:
   - ✅ Enable Hook
   - ✅ Enable Stories
   - ✅ Enable HTML Elements
   - ✅ Enable Citations

4. **Optional - Add Competitors**:
   - Paste 3-5 top-ranking article URLs
   - Enable Competitor Analysis

5. **Click "Generate SEO Content"**

6. **Wait for generation** (30-60 seconds)

7. **View your article** in the library

### 2. Set Up WordPress Publishing

1. **Go to Settings > WordPress**

2. **Generate Application Password**:
   - Login to WordPress Dashboard
   - Go to Users > Your Profile
   - Scroll to "Application Passwords"
   - Enter name: "BlogForge AI"
   - Click "Add New"
   - Copy the password

3. **Add to BlogForge AI**:
   - Name: My Blog
   - URL: https://yourblog.com
   - Username: your-username
   - Application Password: (paste)
   - Click "Test Connection"
   - If successful, click "Add Site"

4. **Publish Articles**:
   - Go to article view
   - Click "Publish to WordPress"
   - Article appears on your site!

### 3. Import Internal Links

1. **Go to Settings > Internal Links**

2. **Enter your sitemap URL**:
   - Usually: https://yourblog.com/sitemap.xml
   - Or: https://yourblog.com/sitemap_index.xml

3. **Click "Import Sitemap"**

4. **Wait for import** (may take 1-2 minutes)

5. **Links are now available** for auto-suggestion during generation

---

## 🎯 Article Types & Templates

### 1. Informational Articles
**Structure**:
- Compelling Hook
- TL;DR Summary
- Introduction (200-300 words)
- Main Content (8-12 sections)
- Practical Implementation
- Common Mistakes
- Expert Tips
- FAQ (5-7 questions)
- Conclusion

**Best For**: How-tos, guides, tutorials, explanations

### 2. Product Reviews
**Structure**:
- Executive Summary
- Product Overview & Specs
- Unboxing & First Impressions
- Features Breakdown
- Performance Testing
- Comparison with Competitors
- Pros and Cons
- Who Should Buy
- Final Verdict

**Best For**: Single product in-depth reviews

### 3. Product Roundups
**Structure**:
- Introduction & Methodology
- Quick Comparison Table
- Individual Product Reviews
- Head-to-Head Comparison
- Buying Guide
- Best for Each Use Case
- Final Recommendations

**Best For**: Comparing multiple products in a category

### 4. How-To Guides
**Structure**:
- Hook & Introduction
- TL;DR Summary
- What You'll Need
- Step-by-Step Instructions
- Advanced Tips
- Troubleshooting
- Best Practices
- FAQ

**Best For**: Step-by-step tutorials and processes

### 5. Listicles
**Structure**:
- Engaging Introduction
- TL;DR Preview
- Main List Items (detailed)
- Comparison Table
- Bonus Tips
- FAQ
- Conclusion

**Best For**: Top 10 lists, best of lists, tip lists

---

## 🎨 HTML Elements & Widgets

### Comparison Tables
```html
<div class="comparison-table">
  <table>
    <thead>
      <tr><th>Feature</th><th>Option A</th><th>Option B</th></tr>
    </thead>
    <tbody>
      <tr><td>Price</td><td>$99</td><td>$149</td></tr>
    </tbody>
  </table>
</div>
```

### Callout Boxes
```html
<div class="callout-box info">
  <h4>💡 Pro Tip</h4>
  <p>Your important message here</p>
</div>
```

Types: `info`, `warning`, `success`, `danger`

### FAQ Accordion
```html
<div class="faq-item">
  <h4 class="faq-question">Question here?</h4>
  <div class="faq-answer">
    <p>Answer here</p>
  </div>
</div>
```

### Progress Bars
```html
<div class="rating-bar">
  <span class="rating-label">Performance</span>
  <div class="bar"><div class="fill" style="width: 85%"></div></div>
  <span class="rating-score">8.5/10</span>
</div>
```

---

## 🔒 Privacy & Security

- ✅ **All data stored locally** in IndexedDB
- ✅ **No server-side storage** of your content
- ✅ **API keys encrypted** in browser storage
- ✅ **No tracking or analytics**
- ✅ **WordPress passwords** use application passwords (not main password)
- ✅ **Open source** - you can audit the code

---

## 🚀 Deployment

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Deploy to Vercel
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Deploy to GitHub Pages
```bash
npm run build
# Push dist/ folder to gh-pages branch
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📈 Roadmap

- [ ] Image generation integration (Gemini Imagen)
- [ ] Bulk article generation
- [ ] Content calendar scheduling
- [ ] A/B headline testing
- [ ] Analytics dashboard
- [ ] Export to PDF
- [ ] Multi-language UI
- [ ] Voice input for article topics
- [ ] AI-powered image suggestions
- [ ] Social media auto-posting

---

## 🐛 Known Issues

- Image generation currently requires additional API setup
- Large sitemaps (>1000 URLs) may take time to import
- Competitor analysis limited to publicly accessible pages

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **Google** for Gemini API
- **Anthropic** for Claude AI
- **WordPress** for REST API
- **React Team** for amazing framework
- **Tailwind CSS** for beautiful styling
- **Dexie.js** for IndexedDB wrapper

---

## 📧 Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Email: support@blogforge.ai (fictional)
- Discord: Join our community (fictional)

---

## ⭐ Star the Project

If you find BlogForge AI useful, please give it a star on GitHub! It helps others discover the project.

---

**Built with ❤️ by AI enthusiasts for content creators worldwide**

🌐 **Live Demo**: https://5173-i57gqy9s2kiht89j1qaiv-02b9cc79.sandbox.novita.ai
