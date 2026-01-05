export type ArticleType = 'product_review' | 'product_roundup' | 'information';
export type OutputFormat = 'text' | 'multimedia' | 'markdown';
export type ToneType = 'authoritative' | 'conversational' | 'technical' | 'friendly' | 'professional';

export interface ArticleGenerationSettings {
  // Basic Settings
  topic: string;
  webSearchTerm?: string;
  targetKeyword?: string;
  articleType: ArticleType;
  outputFormat: OutputFormat;
  tone: ToneType;
  language: string;
  intendedAudience?: string;
  additionalContext?: string;
  wordCount: number;
  customOutline?: string;

  // Features
  enableWebResearch: boolean;
  enableCompetitorAnalysis: boolean;
  competitorUrls: string[];
  
  // Article Elements
  enableFirstPerson: boolean;
  enableStories: boolean;
  enableHook: boolean;
  enableHtmlElements: boolean;
  htmlElementInstructions?: string;
  enableCitations: boolean;
  enableInternalLinks: boolean;
  enableExternalLinks: boolean;

  // Images
  generateImages: boolean;
  numContentImages: number;
  generateCoverImage: boolean;

  // Brand & WordPress
  brandVoiceId?: string;
  wordpressSiteId?: string;
}

export interface BrandVoice {
  id: string;
  name: string;
  description: string;
  tone?: string;
  styleGuidelines?: string;
  sampleContent?: string;
}

export interface CompetitorAnalysisResult {
  url: string;
  title: string;
  keywords: string[];
  structure: string[];
  contentGaps: string[];
}

export interface GeneratedArticle {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  schemaMarkup: any;
  externalLinks: Array<{
    url: string;
    anchorText: string;
    title: string;
  }>;
  internalLinksUsed: Array<{
    url: string;
    anchorText: string;
  }>;
  wordCount: number;
  imagePrompts?: string[];
}

export interface APIKey {
  id: string;
  provider: 'gemini' | 'openrouter';
  apiKey: string;
  isActive: boolean;
}

export interface WordPressSite {
  id: string;
  name: string;
  url: string;
  sitemapUrl?: string;
  internalLinksCount?: number;
}

export interface InternalLink {
  url: string;
  title: string;
  excerpt?: string;
  keywords?: string[];
}
