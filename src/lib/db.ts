import Dexie, { Table } from 'dexie';

export interface Article {
  id?: number;
  title: string;
  content: string;
  htmlContent: string;
  topic: string;
  targetKeyword?: string;
  webSearchTerm?: string;
  articleType: 'informational' | 'product-review' | 'product-roundup' | 'guide' | 'listicle';
  tone: 'conversational' | 'professional' | 'authoritative' | 'friendly' | 'technical';
  language: string;
  intendedAudience?: string;
  additionalContext?: string;
  wordCount: number;
  coverImage?: string;
  contentImages?: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  seoKeywords?: string[];
  status: 'draft' | 'published' | 'scheduled';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  brandVoiceId?: number;
  competitorUrls?: string[];
  enableFirstPerson?: boolean;
  enableStories?: boolean;
  enableHook?: boolean;
  enableHtmlElements?: boolean;
  enableCitations?: boolean;
  enableInternalLinks?: boolean;
  customOutline?: string;
  internalLinks?: Array<{ url: string; anchorText: string }>;
  citations?: Array<{ text: string; source: string; url: string }>;
}

export interface ApiKey {
  id?: number;
  provider: 'gemini' | 'openrouter';
  keyValue: string;
  nickname?: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  usage?: number;
}

export interface BrandVoice {
  id?: number;
  name: string;
  description: string;
  characteristics: string[];
  sampleText?: string;
  tone: string;
  vocabulary?: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WordPressSite {
  id?: number;
  name: string;
  url: string;
  username: string;
  applicationPassword: string;
  isActive: boolean;
  lastPublishAt?: Date;
  createdAt: Date;
}

export interface InternalLink {
  id?: number;
  url: string;
  title: string;
  excerpt?: string;
  keywords?: string[];
  sitemapUrl: string;
  createdAt: Date;
}

export interface GeneratedImage {
  id?: number;
  prompt: string;
  imageUrl: string;
  imageType: 'cover' | 'content';
  articleId?: number;
  provider: 'gemini' | 'openrouter' | 'other';
  createdAt: Date;
}

export interface AppSettings {
  id?: number;
  enableLiveWebResearch: boolean;
  defaultArticleType: string;
  defaultTone: string;
  defaultLanguage: string;
  defaultWordCount: number;
  enableCompetitorAnalysis: boolean;
  maxCompetitorUrls: number;
  numberOfContentImages: number;
  generateCoverImage: boolean;
  autoPublishToWordPress: boolean;
  defaultWordPressSiteId?: number;
  updatedAt: Date;
}

export interface CompetitorAnalysis {
  id?: number;
  url: string;
  articleId?: number;
  title?: string;
  wordCount?: number;
  keywords?: string[];
  headings?: string[];
  content?: string;
  analyzedAt: Date;
}

class SEOBlogDatabase extends Dexie {
  articles!: Table<Article>;
  apiKeys!: Table<ApiKey>;
  brandVoices!: Table<BrandVoice>;
  wordPressSites!: Table<WordPressSite>;
  internalLinks!: Table<InternalLink>;
  generatedImages!: Table<GeneratedImage>;
  appSettings!: Table<AppSettings>;
  competitorAnalyses!: Table<CompetitorAnalysis>;

  constructor() {
    super('SEOBlogDatabase');
    this.version(1).stores({
      articles: '++id, title, status, createdAt, updatedAt, articleType, brandVoiceId',
      apiKeys: '++id, provider, isActive, createdAt',
      brandVoices: '++id, name, isDefault, createdAt',
      wordPressSites: '++id, name, isActive, createdAt',
      internalLinks: '++id, url, sitemapUrl, createdAt',
      generatedImages: '++id, articleId, imageType, createdAt',
      appSettings: '++id',
      competitorAnalyses: '++id, url, articleId, analyzedAt',
    });
  }
}

export const db = new SEOBlogDatabase();

// Initialize default settings
export async function initializeDatabase() {
  const settingsCount = await db.appSettings.count();
  if (settingsCount === 0) {
    await db.appSettings.add({
      enableLiveWebResearch: true,
      defaultArticleType: 'informational',
      defaultTone: 'conversational',
      defaultLanguage: 'English',
      defaultWordCount: 2000,
      enableCompetitorAnalysis: false,
      maxCompetitorUrls: 5,
      numberOfContentImages: 3,
      generateCoverImage: true,
      autoPublishToWordPress: false,
      updatedAt: new Date(),
    });
  }

  // Add default brand voice if none exists
  const voicesCount = await db.brandVoices.count();
  if (voicesCount === 0) {
    await db.brandVoices.add({
      name: 'Default Professional',
      description: 'Clear, authoritative, and engaging professional voice',
      characteristics: [
        'Uses clear, concise language',
        'Maintains professional tone',
        'Includes data and evidence',
        'Engages readers with questions',
        'Balances expertise with accessibility',
      ],
      tone: 'professional',
      vocabulary: ['innovative', 'comprehensive', 'effective', 'strategic', 'optimize'],
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// Helper functions
export async function getActiveApiKey(provider: 'gemini' | 'openrouter'): Promise<ApiKey | undefined> {
  return await db.apiKeys.where({ provider, isActive: true }).first();
}

export async function getAllArticles(): Promise<Article[]> {
  return await db.articles.orderBy('createdAt').reverse().toArray();
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  return await db.articles.get(id);
}

export async function saveArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  return await db.articles.add({
    ...article,
    createdAt: now,
    updatedAt: now,
  } as Article);
}

export async function updateArticle(id: number, updates: Partial<Article>): Promise<number> {
  return await db.articles.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteArticle(id: number): Promise<void> {
  await db.articles.delete(id);
}

export async function getDefaultBrandVoice(): Promise<BrandVoice | undefined> {
  return await db.brandVoices.where({ isDefault: true }).first();
}

export async function getAppSettings(): Promise<AppSettings | undefined> {
  return await db.appSettings.toCollection().first();
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<number> {
  const existing = await getAppSettings();
  if (existing && existing.id) {
    return await db.appSettings.update(existing.id, {
      ...settings,
      updatedAt: new Date(),
    });
  }
  return 0;
}
