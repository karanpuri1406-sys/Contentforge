import type { ArticleGenerationSettings, BrandVoice, CompetitorAnalysisResult, InternalLink } from '../types/article';

export class PromptGenerator {
  private settings: ArticleGenerationSettings;
  private brandVoice?: BrandVoice;
  private competitorAnalysis?: CompetitorAnalysisResult[];
  private internalLinks?: InternalLink[];
  private researchData?: string;

  constructor(
    settings: ArticleGenerationSettings,
    brandVoice?: BrandVoice,
    competitorAnalysis?: CompetitorAnalysisResult[],
    internalLinks?: InternalLink[],
    researchData?: string
  ) {
    this.settings = settings;
    this.brandVoice = brandVoice;
    this.competitorAnalysis = competitorAnalysis;
    this.internalLinks = internalLinks;
    this.researchData = researchData;
  }

  generateSystemPrompt(): string {
    return `You are an expert content strategist and SEO specialist. You create world-class, highly optimized articles that rank on Google and are featured in AI search engines (ChatGPT, Perplexity, Google AI Overviews).

Your articles are:
- Thoroughly researched with current 2026+ data
- SEO-optimized with natural keyword usage
- Engaging and readable (6th grade reading level)
- Structured for both human readers and AI parsing
- Rich with specific statistics, expert quotes, and examples
- Mobile-friendly and accessible

You MUST follow all instructions precisely and output in the requested format.`;
  }

  generateMainPrompt(): string {
    const { 
      topic, 
      targetKeyword, 
      articleType, 
      outputFormat, 
      tone, 
      intendedAudience,
      additionalContext,
      wordCount,
      customOutline
    } = this.settings;

    let prompt = `# Task: Write a ${articleType.replace('_', ' ')} article

## Article Details:
- **Topic**: ${topic}
- **Target Keyword**: ${targetKeyword || topic}
- **Article Type**: ${this.getArticleTypeDescription()}
- **Output Format**: ${this.getOutputFormatDescription()}
- **Tone**: ${tone}
- **Target Audience**: ${intendedAudience || 'General audience'}
- **Word Count**: ${wordCount} words (aim for approximately this length)
- **Language**: ${this.settings.language}

${additionalContext ? `## Additional Context:\n${additionalContext}\n` : ''}

## SEO Requirements:
1. Include the main keyword "${targetKeyword || topic}" in the first 50 words
2. Use the main keyword and variations in at least one H2 heading
3. Target Flesch-Kincaid 6th grade readability level
4. Use year "2026" or "2026+" for freshness signals throughout
5. Create an SEO-optimized slug (lowercase, hyphens, no special characters)
6. Generate compelling meta title (50-60 characters) and meta description (150-160 characters)

${this.generateStructureSection()}

${this.generateContentGuidelines()}

${this.generateElementsInstructions()}

${this.generateResearchSection()}

${this.generateCompetitorSection()}

${this.generateBrandVoiceSection()}

${this.generateLinksSection()}

${this.generateSchemaMarkupSection()}

${customOutline ? `## Custom Outline:\nFollow this outline structure:\n${customOutline}\n` : ''}

## Output Format:
You must return ONLY a valid JSON object with the following structure:

\`\`\`json
{
  "title": "Main article title",
  "content": "${outputFormat === 'markdown' ? 'Full article in Markdown format' : outputFormat === 'multimedia' ? 'Full article with HTML including widgets, embeds, etc.' : 'Plain text article'}",
  "metaTitle": "SEO meta title (50-60 chars)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "slug": "seo-friendly-url-slug",
  "schemaMarkup": {
    "@context": "https://schema.org",
    "@type": "${articleType === 'product_review' ? 'Review' : 'Article'}",
    // Complete schema markup
  },
  "externalLinks": [
    {
      "url": "https://example.com",
      "anchorText": "Link text",
      "title": "Brief description"
    }
  ],
  "internalLinksUsed": [
    {
      "url": "/related-article",
      "anchorText": "Link text"
    }
  ],
  "wordCount": ${wordCount},
  "imagePrompts": [
    "Detailed image generation prompt 1",
    "Detailed image generation prompt 2"
  ]
}
\`\`\`

DO NOT include any text before or after the JSON. Output ONLY valid JSON.`;

    return prompt;
  }

  private getArticleTypeDescription(): string {
    switch (this.settings.articleType) {
      case 'product_review':
        return 'In-depth product review with personal testing, pros/cons, and recommendations';
      case 'product_roundup':
        return 'Comparison of multiple products with side-by-side analysis';
      case 'information':
        return 'Ultimate guide or comprehensive tutorial';
      default:
        return 'Informational article';
    }
  }

  private getOutputFormatDescription(): string {
    switch (this.settings.outputFormat) {
      case 'multimedia':
        return 'Rich HTML with custom widgets, comparison tables, FAQs, accordions, and embedded media';
      case 'markdown':
        return 'Clean Markdown format with proper heading hierarchy';
      case 'text':
        return 'Plain text with simple formatting';
      default:
        return 'Text format';
    }
  }

  private generateStructureSection(): string {
    const structures = {
      product_review: `## Article Structure (Product Review):
1. **Introduction & Hook** (50-100 words)
   - Start with key takeaway or surprising finding
   - Include target keyword in first 50 words
   - Set context and your credentials

2. **Product Overview** (150-200 words)
   - What it is and who it's for
   - Key specifications
   - Price point and value proposition

3. **Design & Build Quality** (200-300 words)
   - Visual appeal and materials
   - Ergonomics and usability
   - Durability observations

4. **Performance Analysis** (400-600 words)
   - Core functionality testing
   - Quantitative measurements and benchmarks
   - Real-world usage scenarios
   - Key performance categories

5. **User Experience** (200-300 words)
   - Setup process
   - Daily usage observations
   - Learning curve

6. **Comparative Analysis** (200-300 words)
   - Direct competitors comparison
   - Price vs. value analysis
   - Unique selling points

7. **Pros and Cons** (150-200 words)
   - What We Loved (specific benefits)
   - Areas for Improvement (honest drawbacks)

8. **Purchase Recommendations** (150-200 words)
   - Best For (specific user types)
   - Skip If (deal-breakers)
   - Alternatives to Consider

9. **Where to Buy** (100-150 words)
   - Best deals and trusted retailers
   - Current pricing

10. **Final Verdict** (150-200 words)
    - Overall assessment
    - Clear recommendation

11. **FAQ Section** (200-300 words)
    - 5-7 common questions with detailed answers`,

      product_roundup: `## Article Structure (Product Roundup):
1. **Introduction & Methodology** (100-150 words)
   - Hook with key finding
   - What products are covered
   - Selection criteria and testing methodology

2. **Quick Comparison Table**
   - Interactive HTML table with key specs
   - Sortable by price, rating, features

3. **Individual Product Reviews** (300-400 words each)
   - Product name and overview
   - Key specifications
   - Performance highlights
   - Pros and cons
   - Best for scenario
   - Where to buy

4. **Side-by-Side Performance Analysis** (300-400 words)
   - Charts comparing key metrics
   - Winner in each category

5. **Best-For Scenarios** (200-300 words)
   - Matrix of recommendations by use case
   - Budget picks
   - Premium choices

6. **Buying Guide** (200-300 words)
   - What to look for
   - Common mistakes to avoid

7. **Final Recommendations** (150-200 words)
   - Overall best pick
   - Runner-ups
   - Value choice

8. **FAQ Section** (200-300 words)
   - 5-7 common questions`,

      information: `## Article Structure (Information Guide):
1. **Introduction** (100-150 words)
   - Hook with surprising statistic or key takeaway
   - Include target keyword in first 50 words
   - What readers will learn
   - Why you're qualified to write this

2. **Executive Summary** (100-150 words)
   - 3-4 key findings or takeaways in bullet points

3. **Main Content Sections** (8-12 H2 sections, each 250-400 words)
   - Each H2 should be a question users would ask
   - Include subsections (H3) as needed
   - Break up long sections with lists and subheadings
   - Include specific statistics and data points
   - Add expert quotes where relevant
   - Use transitional phrases between sections

4. **Case Studies/Examples** (300-400 words)
   - Real-world examples with specific, measurable results
   - Before/after comparisons
   - Year-over-year data from 2025-2026

5. **Implementation Guide** (300-500 words)
   - Step-by-step process with numbered lists
   - Specific timelines and milestones
   - Tools and resources needed

6. **Common Mistakes/Pitfalls** (200-300 words)
   - What to avoid
   - How to troubleshoot

7. **Future Trends** (150-200 words)
   - Predictions for 2026-2027
   - Emerging developments

8. **FAQ Section** (300-400 words)
   - 7-10 conversational Q&As using natural language

9. **Conclusion & Next Steps** (150-200 words)
   - Summary of key points
   - Actionable next steps with implementation timeline

10. **Resources & Further Reading** (100-150 words)
    - Tools, templates, additional articles`
    };

    return structures[this.settings.articleType] || structures.information;
  }

  private generateContentGuidelines(): string {
    return `## Content Quality Guidelines:

### Writing Style:
- Write in ${this.settings.enableFirstPerson ? 'first person (I, we, my)' : 'third person'}
- Use conversational, natural language (avoid corporate jargon)
- Keep sentences under 20 words for AI parsing efficiency
- Use active voice and present tense predominantly
- ${this.settings.enableStories ? 'Include personal anecdotes and specific examples' : 'Focus on facts and data'}
- ${this.settings.enableHook ? 'Start with a compelling hook (surprising stat, counterintuitive finding, or bold statement)' : 'Start with direct introduction'}

### Readability:
- Target 6th grade Flesch-Kincaid reading level
- Use simple words (avoid: "utilize" → use: "use")
- Break paragraphs at 150-200 words maximum
- Use bullet points and numbered lists liberally
- Add whitespace between sections

### Data & Authority:
- Include at least one specific statistic per 150 words
- Use exact percentages, dollar amounts, timeframes, quantities
- ${this.settings.enableCitations ? 'Cite sources with "According to [Source]," "Research shows," "Data reveals"' : ''}
- Reference 2026 data and current year for freshness
- ${this.settings.enableCitations ? 'Quote 3-5 industry experts with titles and affiliations' : ''}
- Include measurable results in examples (X% increase, $Y savings, Z days)`;
  }

  private generateElementsInstructions(): string {
    if (this.settings.outputFormat !== 'multimedia') {
      return '';
    }

    return `## HTML Interactive Elements:

${this.settings.enableHtmlElements ? `
### Required HTML Widgets:
Create these custom interactive elements using clean HTML/CSS:

1. **Comparison Tables**
   - Responsive HTML tables with hover effects
   - Sticky headers for long tables
   - Highlight best values in each column
   - Mobile-friendly card layout on small screens

2. **FAQ Accordions**
   - Click-to-expand Q&A sections
   - Use <details> and <summary> tags
   - Each FAQ should be collapsible
   - Add structured data markup

3. **Callout Boxes**
   - Info boxes for key statistics
   - Warning boxes for pitfalls
   - Tip boxes for pro advice
   - Use distinct colors and icons

4. **Progress Bars / Rating Displays**
   - Visual representations of scores
   - Use HTML/CSS (no images)
   - Accessible with ARIA labels

5. **Sticky Table of Contents**
   - Left sidebar navigation
   - Auto-highlights current section
   - Smooth scroll to sections
   - Mobile-friendly hamburger menu

${this.settings.htmlElementInstructions ? `\n### Additional HTML Element Instructions:\n${this.settings.htmlElementInstructions}` : ''}

### HTML Guidelines:
- Use semantic HTML5 tags (<article>, <section>, <aside>)
- All HTML must be mobile-responsive
- Include proper ARIA labels for accessibility
- Use inline CSS for styling (no external stylesheets)
- Ensure all interactive elements work without JavaScript (progressive enhancement)
- DO NOT use tick marks, arrows, or emojis that clash with themes
- Use clean, modern design with plenty of whitespace
- Stick to a simple color palette (grays, blues, accent colors)
` : ''}

### Media Embeds:
- Suggest relevant YouTube embeds (provide embed codes)
- Use placeholder comments for images: <!-- IMAGE: [description] -->
- Ensure all media is properly sized and responsive`;
  }

  private generateResearchSection(): string {
    if (!this.settings.enableWebResearch || !this.researchData) {
      return '';
    }

    return `## Research Data:

The following information was gathered from recent web research. Use this data to enrich your article with current, accurate information:

${this.researchData}

Make sure to:
- Verify and cross-reference statistics
- Cite sources appropriately
- Use the most recent data available (prefer 2026 data)
- Include specific numbers, percentages, and dates`;
  }

  private generateCompetitorSection(): string {
    if (!this.settings.enableCompetitorAnalysis || !this.competitorAnalysis?.length) {
      return '';
    }

    return `## Competitor Analysis:

The following top-ranking articles have been analyzed. Use insights to create better, more comprehensive content:

${this.competitorAnalysis.map((comp, idx) => `
### Competitor ${idx + 1}: ${comp.title}
- **URL**: ${comp.url}
- **Key Keywords**: ${comp.keywords.join(', ')}
- **Content Structure**: ${comp.structure.join(' → ')}
- **Content Gaps** (topics they missed): ${comp.contentGaps.join(', ')}
`).join('\n')}

Your article should:
- Cover all topics competitors covered
- Fill the content gaps identified
- Provide more depth and better examples
- Include more recent data (2026+)
- Offer unique insights or perspectives`;
  }

  private generateBrandVoiceSection(): string {
    if (!this.brandVoice) {
      return '';
    }

    return `## Brand Voice:

Maintain the following brand voice throughout the article:

**Brand**: ${this.brandVoice.name}
**Description**: ${this.brandVoice.description}
${this.brandVoice.tone ? `**Tone**: ${this.brandVoice.tone}` : ''}
${this.brandVoice.styleGuidelines ? `\n**Style Guidelines**:\n${this.brandVoice.styleGuidelines}` : ''}
${this.brandVoice.sampleContent ? `\n**Sample Content**:\n${this.brandVoice.sampleContent}` : ''}

Ensure the article matches this voice, tone, and style consistently.`;
  }

  private generateLinksSection(): string {
    let section = '';

    if (this.settings.enableExternalLinks) {
      section += `## External Links:

Include 5-7 high-quality external links to authoritative sources:
- Government websites (.gov)
- Educational institutions (.edu)
- Major news outlets (NYTimes, WSJ, BBC)
- Industry leaders and official websites
- Research papers and studies
- Statistics sources (Statista, Pew Research, etc.)

For each external link, provide:
- Relevant anchor text (not "click here")
- Context about why the source is authoritative
- Ensure links support claims or provide additional value

Add external links naturally within the content where they add value.

`;
    }

    if (this.settings.enableInternalLinks && this.internalLinks?.length) {
      section += `## Internal Links:

You have access to the following articles from the website. Include 5-7 relevant internal links:

${this.internalLinks.slice(0, 20).map((link, idx) => `
${idx + 1}. **${link.title}**
   - URL: ${link.url}
   ${link.excerpt ? `- Excerpt: ${link.excerpt}` : ''}
   ${link.keywords?.length ? `- Keywords: ${link.keywords.join(', ')}` : ''}
`).join('\n')}

Choose the most relevant internal links based on:
- Topic relevance to current section
- Keyword overlap
- Complementary information

Use descriptive anchor text that tells readers what they'll find.
`;
    } else if (this.settings.enableInternalLinks) {
      section += `## Internal Links:

Include 3-5 placeholder internal links with suggestions:
- Format: [Link to: "Suggested Article Title"] 
- Suggest relevant topics that would naturally link from this content
- These will be filled in later based on the site's existing content

`;
    }

    return section;
  }

  private generateSchemaMarkupSection(): string {
    const schemaTypes = {
      product_review: 'Review',
      product_roundup: 'ItemList with Review items',
      information: 'Article with HowTo (if applicable)'
    };

    return `## Schema Markup:

Generate appropriate schema.org structured data:
- Primary type: ${schemaTypes[this.settings.articleType]}
- Include Article schema with: headline, author, datePublished (2026-01-05), publisher
- Add FAQ schema for the FAQ section
${this.settings.articleType !== 'information' ? '- Add Review schema with rating (1-5 scale) and reviewBody' : ''}
${this.settings.articleType === 'product_roundup' ? '- Add AggregateRating if reviewing multiple products' : ''}
- Add HowTo schema if article includes step-by-step instructions
- Ensure all required properties are included
- Use proper nesting and valid JSON-LD format`;
  }

  generateImagePrompts(): string[] {
    const prompts: string[] = [];
    
    if (this.settings.generateCoverImage) {
      prompts.push(
        `Create a professional, eye-catching cover image for an article about "${this.settings.topic}". ` +
        `Style: modern, clean, professional. Include relevant visual elements that represent the topic. ` +
        `No text overlays. High quality, 16:9 aspect ratio, suitable for blog hero image.`
      );
    }

    for (let i = 0; i < this.settings.numContentImages; i++) {
      prompts.push(
        `Create a supporting illustration for section ${i + 1} of an article about "${this.settings.topic}". ` +
        `Style: clean, professional, informative. Visual should complement written content. ` +
        `No text. High quality, appropriate for blog content image.`
      );
    }

    return prompts;
  }
}
