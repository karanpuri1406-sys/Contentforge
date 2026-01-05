# BlogForge AI - SEO Blog Generation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

A powerful AI-powered blog writing platform that produces highly SEO-optimized content with stunning HTML multimedia articles and direct WordPress publishing.

**🌟 [Live Demo](https://5173-ixulet3iirxv4edpetxnn-583b4d74.sandbox.novita.ai) | 📖 [Setup Guide](SETUP.md) | 🤝 [Contributing](CONTRIBUTING.md)**

## 📸 Screenshots

> **Note**: Add screenshots of your application here once deployed

- Dashboard with usage stats
- Advanced article generation form
- API keys management
- Generated article preview

---

## 🚀 Key Features

### Content Generation
- **Three Article Types**:
  - Product Reviews (in-depth analysis with pros/cons)
  - Product Roundups (multi-product comparisons)
  - Information Guides (comprehensive tutorials)

- **Output Formats**:
  - Multimedia HTML (with interactive widgets, tables, accordions)
  - Markdown (clean, portable format)
  - Plain Text

### SEO Optimization
- Keyword optimization and LSI keywords
- Meta titles and descriptions
- SEO-friendly URL slugs
- Schema markup (Article, Review, HowTo, FAQ)
- Internal and external linking
- 2026+ freshness signals
- 6th grade Flesch-Kincaid readability

### AI-Powered Features
- Live web research for current data
- Competitor analysis (analyze up to 5 top-ranking articles)
- Smart image generation with Gemini
- Automatic image placement in content
- Expert quotes and citations
- Case studies and statistics

### Customization
- Multiple tones (Authoritative, Conversational, Technical, Friendly, Professional)
- Brand voice consistency
- Custom outlines
- First-person or third-person perspective
- Adjustable word count (500-5000 words)

### Interactive HTML Elements
- Comparison tables
- FAQ accordions
- Callout boxes
- Progress bars and ratings
- Sticky table of contents
- Mobile-responsive design

## 🎯 Unique Value Proposition

**BYOK (Bring Your Own Key)** - Unlike competitors who mark up API costs:
- Use your own Gemini API key for **FREE article generation**
- Optional OpenRouter integration for Claude Sonnet 4/4.5 premium quality
- Pay only for platform features, not AI generation

## 💰 Pricing

- **Free**: 10 articles/month (with own Gemini API key)
- **Starter**: $8/month
- **Pro**: $19/month
- **Premium**: $35/month

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Gemini API, OpenRouter (optional)
- **Routing**: React Router v7
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd webapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials

# Run migrations
npx supabase db push

# Start development server
npm run dev
```

## 🗄 Database Schema

### Core Tables
- `profiles` - User profiles with plan limits and usage tracking
- `blog_posts` - Generated articles with full metadata
- `api_keys` - User's AI provider API keys (encrypted)
- `brand_voices` - Custom brand voice definitions
- `wordpress_sites` - Connected WordPress sites
- `internal_links` - Parsed sitemap links for internal linking
- `generated_images` - AI-generated images with metadata

### Key Features
- Row Level Security (RLS) enabled
- Automatic profile creation on signup
- Monthly usage tracking with auto-reset
- Plan limit enforcement

## 🎨 Article Generation Flow

1. **User Input**: Topic, keywords, settings
2. **Web Research**: Live search for current data (optional)
3. **Competitor Analysis**: Analyze top articles (optional)
4. **Prompt Generation**: Build customized prompts based on article type
5. **AI Generation**: Create content using Gemini or Claude
6. **Image Generation**: Create cover and content images
7. **Post-Processing**: Insert images, format HTML, add schema
8. **Save & Publish**: Store in database, optional WordPress publish

## 🔑 API Key Setup

### Gemini API (Recommended for Free Tier)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to BlogForge AI in Settings > API Keys

### OpenRouter (Premium Quality)
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account and get API key
3. Add to BlogForge AI for Claude Sonnet 4/4.5 access

## 📝 Article Types & Templates

### Product Review Template
- Introduction & First Impressions
- Product Overview & Specifications
- Design & Build Quality
- Performance Analysis
- User Experience
- Comparative Analysis
- Pros and Cons
- Purchase Recommendations
- Where to Buy
- Final Verdict
- FAQ

### Product Roundup Template
- Introduction & Methodology
- Quick Comparison Table
- Individual Product Reviews
- Side-by-Side Analysis
- Best-For Scenarios
- Buying Guide
- Final Recommendations
- FAQ

### Information Guide Template
- Introduction with Hook
- Executive Summary
- Main Content Sections (8-12)
- Case Studies/Examples
- Implementation Guide
- Common Mistakes
- Future Trends
- FAQ
- Resources

## 🌟 Roadmap

- [ ] WordPress direct publishing integration
- [ ] Web search API integration (Serper, Brave Search)
- [ ] Bulk article generation
- [ ] Content calendar and scheduling
- [ ] Brand voice training from sample content
- [ ] A/B testing for headlines
- [ ] Analytics dashboard
- [ ] Collaboration features
- [ ] API for programmatic access

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@blogforge.ai or join our Discord community.

---

**Built with ❤️ by the BlogForge AI Team**
