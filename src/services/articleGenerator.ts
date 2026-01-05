import { PromptGenerator } from './promptGenerator';
import { AIService, type AIServiceConfig } from './aiService';
import type { 
  ArticleGenerationSettings, 
  BrandVoice, 
  CompetitorAnalysisResult, 
  InternalLink,
  GeneratedArticle 
} from '../types/article';

export interface ArticleGenerationResult {
  article: GeneratedArticle;
  images: Array<{
    url: string;
    prompt: string;
    altText: string;
    type: 'cover' | 'content';
  }>;
  tokensUsed?: number;
  model: string;
}

export class ArticleGenerator {
  private aiService: AIService;
  private settings: ArticleGenerationSettings;
  private brandVoice?: BrandVoice;
  private internalLinks?: InternalLink[];

  constructor(
    aiConfig: AIServiceConfig,
    settings: ArticleGenerationSettings,
    brandVoice?: BrandVoice,
    internalLinks?: InternalLink[]
  ) {
    this.aiService = new AIService(aiConfig);
    this.settings = settings;
    this.brandVoice = brandVoice;
    this.internalLinks = internalLinks;
  }

  async generate(
    onProgress?: (step: string, progress: number) => void
  ): Promise<ArticleGenerationResult> {
    try {
      // Step 1: Web Research (if enabled)
      onProgress?.('Performing web research...', 10);
      let researchData: string | undefined;
      if (this.settings.enableWebResearch && this.settings.webSearchTerm) {
        researchData = await this.performWebResearch(this.settings.webSearchTerm);
      }

      // Step 2: Competitor Analysis (if enabled)
      onProgress?.('Analyzing competitors...', 25);
      let competitorAnalysis: CompetitorAnalysisResult[] | undefined;
      if (this.settings.enableCompetitorAnalysis && this.settings.competitorUrls.length > 0) {
        competitorAnalysis = await this.analyzeCompetitors(this.settings.competitorUrls);
      }

      // Step 3: Generate article content
      onProgress?.('Generating article content...', 40);
      const article = await this.generateArticleContent(researchData, competitorAnalysis);

      // Step 4: Generate images (if enabled)
      onProgress?.('Generating images...', 70);
      const images = await this.generateImages(article);

      // Step 5: Post-processing
      onProgress?.('Finalizing article...', 90);
      const finalArticle = this.postProcessArticle(article, images);

      onProgress?.('Complete!', 100);

      return {
        article: finalArticle,
        images,
        model: this.aiService['config'].model || 'gemini-2.0-flash-exp'
      };
    } catch (error) {
      console.error('Article generation error:', error);
      throw error;
    }
  }

  private async performWebResearch(query: string): Promise<string> {
    // In production, this would call a real search API
    // For now, we'll return placeholder instructions
    return await this.aiService.performWebSearch(query);
  }

  private async analyzeCompetitors(urls: string[]): Promise<CompetitorAnalysisResult[]> {
    // In production, this would scrape and analyze competitor articles
    // For MVP, we'll create placeholder data
    const results: CompetitorAnalysisResult[] = [];

    for (const url of urls.slice(0, 5)) {
      try {
        // Fetch and analyze the competitor content
        // This is a simplified version - in production you'd use a proper scraping service
        const response = await fetch(url);
        const html = await response.text();
        
        // Extract basic info (title, headings)
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'Unknown';
        
        // Extract H2 headings for structure
        const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
        const structure = h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()).slice(0, 10);

        results.push({
          url,
          title,
          keywords: [], // Would extract keywords in production
          structure,
          contentGaps: [] // Would identify gaps in production
        });
      } catch (error) {
        console.error(`Failed to analyze competitor: ${url}`, error);
      }
    }

    return results;
  }

  private async generateArticleContent(
    researchData?: string,
    competitorAnalysis?: CompetitorAnalysisResult[]
  ): Promise<GeneratedArticle> {
    const promptGenerator = new PromptGenerator(
      this.settings,
      this.brandVoice,
      competitorAnalysis,
      this.internalLinks,
      researchData
    );

    const systemPrompt = promptGenerator.generateSystemPrompt();
    const mainPrompt = promptGenerator.generateMainPrompt();

    return await this.aiService.generateArticle(systemPrompt, mainPrompt);
  }

  private async generateImages(article: GeneratedArticle): Promise<Array<{
    url: string;
    prompt: string;
    altText: string;
    type: 'cover' | 'content';
  }>> {
    if (!this.settings.generateImages) {
      return [];
    }

    const images: Array<{
      url: string;
      prompt: string;
      altText: string;
      type: 'cover' | 'content';
    }> = [];

    try {
      // Use image prompts from the article or generate default ones
      const imagePrompts = article.imagePrompts && article.imagePrompts.length > 0
        ? article.imagePrompts
        : this.generateDefaultImagePrompts();

      // Generate cover image
      if (this.settings.generateCoverImage && imagePrompts[0]) {
        try {
          const imageUrl = await this.aiService.generateImage(imagePrompts[0]);
          images.push({
            url: imageUrl,
            prompt: imagePrompts[0],
            altText: `Cover image for ${article.title}`,
            type: 'cover'
          });
        } catch (error) {
          console.error('Failed to generate cover image:', error);
        }
      }

      // Generate content images
      const numContentImages = Math.min(
        this.settings.numContentImages,
        imagePrompts.length - (this.settings.generateCoverImage ? 1 : 0)
      );

      for (let i = 0; i < numContentImages; i++) {
        const promptIndex = (this.settings.generateCoverImage ? 1 : 0) + i;
        if (imagePrompts[promptIndex]) {
          try {
            const imageUrl = await this.aiService.generateImage(imagePrompts[promptIndex]);
            images.push({
              url: imageUrl,
              prompt: imagePrompts[promptIndex],
              altText: `Illustration ${i + 1} for ${this.settings.topic}`,
              type: 'content'
            });
          } catch (error) {
            console.error(`Failed to generate content image ${i + 1}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // Continue without images rather than failing the whole generation
    }

    return images;
  }

  private generateDefaultImagePrompts(): string[] {
    const prompts: string[] = [];
    
    if (this.settings.generateCoverImage) {
      prompts.push(
        `Create a professional, modern cover image for an article titled "${this.settings.topic}". ` +
        `Style: clean, professional, eye-catching. 16:9 aspect ratio. No text overlays.`
      );
    }

    for (let i = 0; i < this.settings.numContentImages; i++) {
      prompts.push(
        `Create an informative illustration for a blog article about "${this.settings.topic}". ` +
        `Section ${i + 1}. Style: professional, clean, modern. No text.`
      );
    }

    return prompts;
  }

  private postProcessArticle(
    article: GeneratedArticle,
    images: Array<{ url: string; prompt: string; altText: string; type: 'cover' | 'content' }>
  ): GeneratedArticle {
    let content = article.content;

    // If multimedia format, inject images into the content
    if (this.settings.outputFormat === 'multimedia') {
      // Add cover image at the top
      const coverImage = images.find(img => img.type === 'cover');
      if (coverImage) {
        content = `<img src="${coverImage.url}" alt="${coverImage.altText}" class="cover-image" style="width: 100%; height: auto; margin-bottom: 2rem; border-radius: 8px;" />\n\n${content}`;
      }

      // Insert content images at appropriate places
      const contentImages = images.filter(img => img.type === 'content');
      if (contentImages.length > 0) {
        // Find major sections (H2 tags) and insert images
        const h2Regex = /<h2[^>]*>/gi;
        const h2Matches = [...content.matchAll(h2Regex)];
        
        if (h2Matches.length > 0) {
          const sectionsPerImage = Math.max(1, Math.floor(h2Matches.length / contentImages.length));
          
          contentImages.forEach((image, index) => {
            const sectionIndex = (index + 1) * sectionsPerImage;
            if (sectionIndex < h2Matches.length) {
              const insertPosition = h2Matches[sectionIndex].index!;
              const imageHtml = `\n<figure style="margin: 2rem 0;"><img src="${image.url}" alt="${image.altText}" style="width: 100%; height: auto; border-radius: 8px;" /><figcaption style="text-align: center; margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${image.altText}</figcaption></figure>\n`;
              content = content.slice(0, insertPosition) + imageHtml + content.slice(insertPosition);
            }
          });
        }
      }

      // Add styling for better readability
      content = this.wrapWithStyledContainer(content);
    }

    return {
      ...article,
      content
    };
  }

  private wrapWithStyledContainer(content: string): string {
    return `
<style>
  .article-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.8;
    color: #333;
  }
  .article-container h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  .article-container h2 {
    font-size: 2rem;
    font-weight: 600;
    margin-top: 3rem;
    margin-bottom: 1rem;
    color: #2563eb;
  }
  .article-container h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }
  .article-container p {
    margin-bottom: 1.5rem;
  }
  .article-container ul, .article-container ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }
  .article-container li {
    margin-bottom: 0.5rem;
  }
  .article-container blockquote {
    border-left: 4px solid #2563eb;
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: #555;
  }
  .article-container table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
  }
  .article-container th, .article-container td {
    padding: 0.75rem;
    border: 1px solid #ddd;
    text-align: left;
  }
  .article-container th {
    background-color: #f3f4f6;
    font-weight: 600;
  }
  .cover-image {
    width: 100%;
    height: auto;
    margin-bottom: 2rem;
    border-radius: 8px;
  }
  @media (max-width: 768px) {
    .article-container {
      padding: 1rem;
    }
    .article-container h1 {
      font-size: 2rem;
    }
    .article-container h2 {
      font-size: 1.5rem;
    }
  }
</style>
<div class="article-container">
${content}
</div>
    `.trim();
  }
}
