import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { db, getActiveApiKey } from '../lib/db';

export interface GenerationOptions {
  topic: string;
  targetKeyword?: string;
  webSearchTerm?: string;
  articleType: 'informational' | 'product-review' | 'product-roundup' | 'guide' | 'listicle';
  tone: 'conversational' | 'professional' | 'authoritative' | 'friendly' | 'technical';
  language: string;
  intendedAudience?: string;
  additionalContext?: string;
  wordCount: number;
  brandVoice?: string;
  competitorUrls?: string[];
  enableFirstPerson?: boolean;
  enableStories?: boolean;
  enableHook?: boolean;
  enableHtmlElements?: boolean;
  enableCitations?: boolean;
  enableInternalLinks?: boolean;
  customOutline?: string;
  internalLinksData?: Array<{ url: string; title: string; excerpt?: string }>;
  competitorAnalysis?: string;
  webResearchData?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: string;
  provider: 'gemini' | 'openrouter';
}

// Exceptional prompting system for high-quality content
export function buildArticlePrompt(options: GenerationOptions): string {
  const {
    topic,
    targetKeyword,
    articleType,
    tone,
    language,
    intendedAudience,
    additionalContext,
    wordCount,
    brandVoice,
    enableFirstPerson,
    enableStories,
    enableHook,
    enableHtmlElements,
    enableCitations,
    enableInternalLinks,
    customOutline,
    internalLinksData,
    competitorAnalysis,
    webResearchData,
  } = options;

  let prompt = `You are an exceptional SEO content writer and expert blogger. Your task is to create a comprehensive, engaging, and highly SEO-optimized article that will rank on the first page of Google search results.

# ARTICLE SPECIFICATIONS

**Topic**: ${topic}
${targetKeyword ? `**Primary Keyword**: ${targetKeyword} (use naturally throughout)` : ''}
**Article Type**: ${articleType}
**Target Word Count**: ${wordCount} words (aim for +/- 10%)
**Tone**: ${tone}
**Language**: ${language}
${intendedAudience ? `**Target Audience**: ${intendedAudience}` : ''}
${additionalContext ? `**Additional Context**: ${additionalContext}` : ''}
${brandVoice ? `**Brand Voice Guidelines**: ${brandVoice}` : ''}

`;

  // Add research data
  if (webResearchData) {
    prompt += `\n# WEB RESEARCH DATA\n\nUse this current information in your article:\n${webResearchData}\n\n`;
  }

  if (competitorAnalysis) {
    prompt += `\n# COMPETITOR ANALYSIS\n\nAnalyze these top-ranking articles and create something better:\n${competitorAnalysis}\n\n`;
  }

  // Article structure based on type
  prompt += `\n# ARTICLE STRUCTURE\n\n`;

  if (customOutline) {
    prompt += `Follow this custom outline:\n${customOutline}\n\n`;
  } else {
    switch (articleType) {
      case 'informational':
        prompt += `1. **Compelling Hook** (2-3 sentences that grab attention)
2. **TL;DR Summary** (3-5 bullet points, key takeaways)
3. **Introduction** (200-300 words)
   - Address the reader's pain point or question
   - Explain what they'll learn
   - Build credibility
4. **Main Content Sections** (8-12 sections with H2 headings)
   - Each section 300-500 words
   - Use H3 subheadings for organization
   - Include practical examples and case studies
   - Add statistics and data points
5. **Visual Elements**
   - Comparison tables
   - Step-by-step guides
   - Key points callout boxes
6. **Practical Implementation** (How to apply the information)
7. **Common Mistakes to Avoid**
8. **Expert Tips & Best Practices**
9. **FAQ Section** (5-7 questions)
10. **Conclusion with Clear CTA**
11. **Additional Resources & Further Reading**\n\n`;
        break;

      case 'product-review':
        prompt += `1. **Executive Summary** (TL;DR - Verdict, Rating, Pros/Cons)
2. **Compelling Introduction**
3. **Product Overview & Specifications** (Table format)
4. **Unboxing & First Impressions**
5. **Design & Build Quality**
6. **Features Breakdown** (detailed analysis of each feature)
7. **Performance Testing** (Real-world usage scenarios)
8. **User Experience**
9. **Comparison with Competitors** (Table)
10. **Pros and Cons** (Detailed breakdown)
11. **Who Should Buy This?** (Use cases and scenarios)
12. **Where to Buy & Pricing**
13. **Final Verdict & Rating**
14. **FAQ Section**\n\n`;
        break;

      case 'product-roundup':
        prompt += `1. **Introduction & Selection Methodology**
2. **TL;DR** (Quick winner for each category)
3. **Quick Comparison Table** (All products side-by-side)
4. **Detailed Reviews** (Each product: 400-600 words)
   - Overview
   - Key Features
   - Pros & Cons
   - Best For
   - Rating
5. **Head-to-Head Comparison**
6. **Buying Guide** (What to look for)
7. **Best Product for Each Use Case**
8. **FAQ Section**
9. **Final Recommendations**\n\n`;
        break;

      case 'guide':
        prompt += `1. **Hook & Introduction**
2. **TL;DR Summary**
3. **What You'll Need** (Prerequisites/requirements)
4. **Step-by-Step Instructions** (Numbered sections)
   - Each step with clear explanation
   - Screenshots/diagrams placeholders
   - Pro tips and warnings
5. **Advanced Tips & Techniques**
6. **Troubleshooting Common Issues**
7. **Best Practices**
8. **FAQ**
9. **Conclusion & Next Steps**\n\n`;
        break;

      case 'listicle':
        prompt += `1. **Engaging Introduction**
2. **TL;DR** (Quick list preview)
3. **Main List Items** (Each item: 200-400 words)
   - Catchy subheading
   - Detailed explanation
   - Why it matters
   - Real-world example
4. **Comparison Table** (if applicable)
5. **Bonus Tips**
6. **FAQ**
7. **Conclusion**\n\n`;
        break;
    }
  }

  // Content requirements
  prompt += `\n# WRITING REQUIREMENTS\n\n`;

  prompt += `## SEO Optimization
- Use the primary keyword naturally in:
  * Title (H1)
  * First paragraph (within first 100 words)
  * At least 3-4 H2 headings
  * Meta description
  * Throughout body (1-2% keyword density)
- Include LSI keywords and semantic variations
- Use descriptive, keyword-rich H2 and H3 headings
- Write engaging meta title (50-60 characters)
- Write compelling meta description (150-160 characters)
- Include relevant internal links with descriptive anchor text
- Add external links to authoritative sources

## Content Quality
- **E-E-A-T Optimization**:
  * Demonstrate Expertise through detailed knowledge
  * Show Experience with real-world examples
  * Build Authority with citations and data
  * Establish Trust with transparency and accuracy
  
- **Readability**:
  * 6th-grade Flesch-Kincaid reading level
  * Short paragraphs (2-4 sentences)
  * Use transition words
  * Varied sentence structure
  * Active voice (80%+)
  
- **Engagement**:
  * Tell compelling stories
  * Use rhetorical questions
  * Include specific numbers and data
  * Add quotes from experts
  * Use powerful, descriptive language
  * Create mental images
  * Address reader directly

`;

  // Feature-specific requirements
  if (enableHook) {
    prompt += `## Opening Hook
Create a powerful opening hook that:
- Starts with a surprising statistic or bold statement
- Uses storytelling or an anecdote
- Poses a thought-provoking question
- Creates urgency or FOMO
- Relates directly to reader's pain point\n\n`;
  }

  if (enableFirstPerson) {
    prompt += `## First-Person Perspective
- Write from first-person perspective ("I", "my", "we")
- Share personal experiences and insights
- Build connection with reader
- Be authentic and relatable\n\n`;
  }

  if (enableStories) {
    prompt += `## Stories & Examples
- Include real-world case studies
- Tell success/failure stories
- Use specific examples and scenarios
- Add customer testimonials or user experiences
- Make abstract concepts concrete\n\n`;
  }

  if (enableCitations) {
    prompt += `## Citations & References
- Cite statistics with sources
- Reference studies and research
- Link to authoritative sources
- Include expert quotes
- Format citations properly\n\n`;
  }

  if (enableInternalLinks && internalLinksData && internalLinksData.length > 0) {
    prompt += `## Internal Linking
Naturally incorporate these internal links where contextually relevant:
${internalLinksData.map((link, idx) => `${idx + 1}. [${link.title}](${link.url})${link.excerpt ? ` - ${link.excerpt}` : ''}`).join('\n')}

Use descriptive anchor text that indicates what the linked page is about.\n\n`;
  }

  if (enableHtmlElements) {
    prompt += `## HTML Elements & Widgets
Include these interactive elements where appropriate:

### Comparison Tables
Use HTML tables for comparisons:
\`\`\`html
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
\`\`\`

### Callout Boxes
For important information:
\`\`\`html
<div class="callout-box info">
  <h4>💡 Pro Tip</h4>
  <p>Your important message here</p>
</div>
\`\`\`

Types: info (blue), warning (yellow), success (green), danger (red)

### FAQ Accordion
\`\`\`html
<div class="faq-item">
  <h4 class="faq-question">Question here?</h4>
  <div class="faq-answer">
    <p>Answer here</p>
  </div>
</div>
\`\`\`

### Progress Bars / Ratings
\`\`\`html
<div class="rating-bar">
  <span class="rating-label">Performance</span>
  <div class="bar"><div class="fill" style="width: 85%"></div></div>
  <span class="rating-score">8.5/10</span>
</div>
\`\`\`

Use these elements strategically to enhance readability and user experience. DO NOT include any styling emojis like ✅, ❌, arrows, or decorative symbols within the HTML.\n\n`;
  }

  // Output format
  prompt += `\n# OUTPUT FORMAT\n\n`;
  prompt += `Provide the article in clean, semantic HTML format with:
- Proper heading hierarchy (H1 → H2 → H3)
- Paragraphs wrapped in <p> tags
- Lists using <ul>/<ol> and <li>
- Emphasis using <strong> and <em>
- Links using <a href=""> tags
- Tables with proper structure
- Image placeholders: <img src="{{IMAGE_PLACEHOLDER}}" alt="descriptive alt text">

## Metadata (provide at the end)
\`\`\`json
{
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "Compelling description (150-160 chars)",
  "slug": "url-friendly-slug",
  "seoKeywords": ["primary keyword", "lsi keyword 1", "lsi keyword 2"],
  "wordCount": actual_word_count
}
\`\`\`

# FINAL CHECKLIST
- [ ] Engaging hook that grabs attention
- [ ] TL;DR summary in introduction
- [ ] Natural keyword usage (not stuffing)
- [ ] Clear value proposition
- [ ] Specific examples and data
- [ ] Proper heading structure
- [ ] Internal and external links
- [ ] FAQ section
- [ ] Strong conclusion with CTA
- [ ] Metadata optimized

Write the article now:`;

  return prompt;
}

export async function generateArticle(options: GenerationOptions): Promise<{
  content: string;
  htmlContent: string;
  metadata: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    seoKeywords: string[];
    wordCount: number;
  };
}> {
  // Try Gemini first (free)
  const geminiKey = await getActiveApiKey('gemini');
  
  if (geminiKey) {
    return await generateWithGemini(geminiKey.keyValue, options);
  }

  // Fall back to OpenRouter
  const openRouterKey = await getActiveApiKey('openrouter');
  if (openRouterKey) {
    return await generateWithOpenRouter(openRouterKey.keyValue, options);
  }

  throw new Error('No active API key found. Please add a Gemini or OpenRouter API key in Settings.');
}

async function generateWithGemini(apiKey: string, options: GenerationOptions): Promise<{
  content: string;
  htmlContent: string;
  metadata: any;
}> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });

  const prompt = buildArticlePrompt(options);
  const result = await model.generateContent(prompt);
  const response = result.response;
  const fullText = response.text();

  // Extract metadata from JSON block at the end
  const metadataMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
  let metadata = {
    metaTitle: options.topic,
    metaDescription: `Comprehensive guide about ${options.topic}`,
    slug: options.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    seoKeywords: [options.targetKeyword || options.topic],
    wordCount: options.wordCount,
  };

  if (metadataMatch) {
    try {
      const parsed = JSON.parse(metadataMatch[1]);
      metadata = { ...metadata, ...parsed };
    } catch (e) {
      console.error('Failed to parse metadata:', e);
    }
  }

  // Extract HTML content (everything before metadata)
  let htmlContent = fullText;
  if (metadataMatch) {
    htmlContent = fullText.substring(0, metadataMatch.index).trim();
  }

  // Convert markdown-style to HTML if needed
  htmlContent = convertMarkdownToHTML(htmlContent);

  return {
    content: stripHTML(htmlContent),
    htmlContent,
    metadata,
  };
}

async function generateWithOpenRouter(apiKey: string, options: GenerationOptions): Promise<{
  content: string;
  htmlContent: string;
  metadata: any;
}> {
  const prompt = buildArticlePrompt(options);
  
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 8192,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SEO Blog Generator',
      },
    }
  );

  const fullText = response.data.choices[0].message.content;

  // Extract metadata
  const metadataMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
  let metadata = {
    metaTitle: options.topic,
    metaDescription: `Comprehensive guide about ${options.topic}`,
    slug: options.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    seoKeywords: [options.targetKeyword || options.topic],
    wordCount: options.wordCount,
  };

  if (metadataMatch) {
    try {
      const parsed = JSON.parse(metadataMatch[1]);
      metadata = { ...metadata, ...parsed };
    } catch (e) {
      console.error('Failed to parse metadata:', e);
    }
  }

  let htmlContent = fullText;
  if (metadataMatch) {
    htmlContent = fullText.substring(0, metadataMatch.index).trim();
  }

  htmlContent = convertMarkdownToHTML(htmlContent);

  return {
    content: stripHTML(htmlContent),
    htmlContent,
    metadata,
  };
}

function convertMarkdownToHTML(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Paragraphs
  const lines = html.split('\n\n');
  html = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('<')) {
      return `<p>${trimmed}</p>`;
    }
    return trimmed;
  }).join('\n');
  
  return html;
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function generateImage(options: ImageGenerationOptions): Promise<string> {
  const { provider, prompt } = options;
  
  if (provider === 'gemini') {
    const geminiKey = await getActiveApiKey('gemini');
    if (!geminiKey) {
      throw new Error('Gemini API key not found');
    }
    
    // Note: Gemini doesn't directly support image generation in the free tier
    // This is a placeholder for when using Gemini Imagen
    throw new Error('Image generation with Gemini requires Imagen API access');
  }

  // OpenRouter for image generation
  const openRouterKey = await getActiveApiKey('openrouter');
  if (!openRouterKey) {
    throw new Error('OpenRouter API key required for image generation');
  }

  // Use OpenRouter with image generation models
  throw new Error('Image generation via OpenRouter requires specific model implementation');
}
