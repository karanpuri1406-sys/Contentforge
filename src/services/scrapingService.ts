import axios from 'axios';
import * as cheerio from 'cheerio';
import { db, InternalLink, CompetitorAnalysis } from '../lib/db';

export interface SitemapEntry {
  url: string;
  title?: string;
  lastmod?: string;
}

export interface CompetitorData {
  url: string;
  title: string;
  wordCount: number;
  keywords: string[];
  headings: string[];
  content: string;
  metaDescription?: string;
  images: number;
  links: number;
}

/**
 * Parse XML sitemap and extract URLs
 */
export async function parseSitemap(sitemapUrl: string): Promise<SitemapEntry[]> {
  try {
    // Use CORS proxy for client-side scraping
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      sitemapUrl // Try direct first
    ];
    
    let response;
    let lastError;
    
    // Try different methods to fetch the sitemap
    for (const proxy of corsProxies) {
      try {
        const url = proxy === sitemapUrl ? sitemapUrl : proxy + encodeURIComponent(sitemapUrl);
        response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEOBlogBot/1.0)',
          },
          timeout: 15000,
        });
        break; // Success, exit loop
      } catch (err) {
        lastError = err;
        continue; // Try next proxy
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to fetch sitemap');
    }

    const $ = cheerio.load(response.data, { xmlMode: true });
    const entries: SitemapEntry[] = [];

    $('url').each((_, element) => {
      const loc = $(element).find('loc').text();
      const lastmod = $(element).find('lastmod').text();
      
      if (loc) {
        entries.push({
          url: loc,
          lastmod: lastmod || undefined,
        });
      }
    });

    // Handle sitemap index files
    if (entries.length === 0) {
      $('sitemap').each((_, element) => {
        const loc = $(element).find('loc').text();
        const lastmod = $(element).find('lastmod').text();
        
        if (loc) {
          entries.push({
            url: loc,
            lastmod: lastmod || undefined,
          });
        }
      });
    }

    return entries;
  } catch (error: any) {
    console.error('Sitemap parsing error:', error.message);
    throw new Error(`Failed to parse sitemap: ${error.message}`);
  }
}

/**
 * Fetch and extract metadata from URLs
 */
export async function fetchPageMetadata(url: string): Promise<{
  title: string;
  excerpt?: string;
  keywords?: string[];
}> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOBlogBot/1.0)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    const title = $('title').text() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('h1').first().text() || 
                  'Untitled';

    const excerpt = $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || 
                    undefined;

    const keywordsContent = $('meta[name="keywords"]').attr('content');
    const keywords = keywordsContent ? keywordsContent.split(',').map(k => k.trim()) : undefined;

    return {
      title: title.trim(),
      excerpt: excerpt?.trim(),
      keywords,
    };
  } catch (error: any) {
    console.error(`Failed to fetch metadata for ${url}:`, error.message);
    return {
      title: url,
    };
  }
}

/**
 * Import sitemap URLs into internal links database
 */
export async function importSitemap(sitemapUrl: string, batchSize: number = 10): Promise<number> {
  const entries = await parseSitemap(sitemapUrl);
  
  // Check if URLs are already sitemap URLs (sitemap index)
  const sitemaps = entries.filter(e => e.url.includes('sitemap') && e.url.endsWith('.xml'));
  
  let allUrls: SitemapEntry[] = [];
  
  if (sitemaps.length > 0) {
    // Parse child sitemaps
    for (const sitemap of sitemaps) {
      try {
        const childEntries = await parseSitemap(sitemap.url);
        allUrls = [...allUrls, ...childEntries];
      } catch (error) {
        console.error(`Failed to parse child sitemap ${sitemap.url}`);
      }
    }
  } else {
    allUrls = entries;
  }

  // Filter out non-page URLs (images, etc.)
  const pageUrls = allUrls.filter(e => {
    const url = e.url.toLowerCase();
    return !url.match(/\.(jpg|jpeg|png|gif|pdf|xml)$/i);
  });

  // Process in batches
  let importedCount = 0;
  
  for (let i = 0; i < pageUrls.length; i += batchSize) {
    const batch = pageUrls.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (entry) => {
      try {
        const metadata = await fetchPageMetadata(entry.url);
        
        // Check if URL already exists
        const existing = await db.internalLinks
          .where('url')
          .equals(entry.url)
          .first();
        
        if (!existing) {
          await db.internalLinks.add({
            url: entry.url,
            title: metadata.title,
            excerpt: metadata.excerpt,
            keywords: metadata.keywords,
            sitemapUrl: sitemapUrl,
            createdAt: new Date(),
          });
          importedCount++;
        }
      } catch (error) {
        console.error(`Failed to import ${entry.url}`);
      }
    }));
  }

  return importedCount;
}

/**
 * Search internal links by keyword
 */
export async function searchInternalLinks(keyword: string, limit: number = 10): Promise<InternalLink[]> {
  const allLinks = await db.internalLinks.toArray();
  
  const scored = allLinks.map(link => {
    let score = 0;
    const lowerKeyword = keyword.toLowerCase();
    
    // Check title
    if (link.title.toLowerCase().includes(lowerKeyword)) {
      score += 10;
    }
    
    // Check excerpt
    if (link.excerpt?.toLowerCase().includes(lowerKeyword)) {
      score += 5;
    }
    
    // Check keywords
    if (link.keywords?.some(k => k.toLowerCase().includes(lowerKeyword))) {
      score += 8;
    }
    
    // Check URL
    if (link.url.toLowerCase().includes(lowerKeyword)) {
      score += 3;
    }
    
    return { link, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.link);
}

/**
 * Analyze competitor article
 */
export async function analyzeCompetitorArticle(url: string): Promise<CompetitorData> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Remove script, style, and nav elements
    $('script, style, nav, header, footer, aside').remove();

    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled';

    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') || 
                           $('meta[property="og:description"]').attr('content');

    // Extract main content
    const contentSelectors = [
      'article',
      '.post-content',
      '.entry-content', 
      '.content',
      'main',
      '.main-content',
    ];

    let $content = $('body');
    for (const selector of contentSelectors) {
      const $found = $(selector);
      if ($found.length > 0) {
        $content = $found.first();
        break;
      }
    }

    // Extract text content
    const content = $content.text().replace(/\s+/g, ' ').trim();
    const wordCount = content.split(/\s+/).length;

    // Extract headings
    const headings: string[] = [];
    $content.find('h1, h2, h3, h4').each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        headings.push(text);
      }
    });

    // Extract potential keywords
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4);

    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const keywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    // Count images and links
    const images = $content.find('img').length;
    const links = $content.find('a').length;

    return {
      url,
      title: title.trim(),
      wordCount,
      keywords,
      headings,
      content: content.substring(0, 5000), // First 5000 chars
      metaDescription,
      images,
      links,
    };
  } catch (error: any) {
    console.error(`Failed to analyze ${url}:`, error.message);
    throw new Error(`Failed to analyze competitor article: ${error.message}`);
  }
}

/**
 * Analyze multiple competitors and save to database
 */
export async function analyzeCompetitors(urls: string[], articleId?: number): Promise<CompetitorAnalysis[]> {
  const analyses: CompetitorAnalysis[] = [];

  for (const url of urls) {
    try {
      const data = await analyzeCompetitorArticle(url);
      
      const analysis = await db.competitorAnalyses.add({
        url,
        articleId,
        title: data.title,
        wordCount: data.wordCount,
        keywords: data.keywords,
        headings: data.headings,
        content: data.content,
        analyzedAt: new Date(),
      });

      const saved = await db.competitorAnalyses.get(analysis);
      if (saved) {
        analyses.push(saved);
      }
    } catch (error) {
      console.error(`Failed to analyze ${url}`);
    }
  }

  return analyses;
}

/**
 * Generate competitor analysis summary for prompting
 */
export function generateCompetitorSummary(analyses: CompetitorData[]): string {
  if (analyses.length === 0) {
    return '';
  }

  let summary = `Analysis of ${analyses.length} top-ranking articles:\n\n`;

  analyses.forEach((analysis, idx) => {
    summary += `## Competitor ${idx + 1}: ${analysis.title}\n`;
    summary += `- URL: ${analysis.url}\n`;
    summary += `- Word Count: ${analysis.wordCount}\n`;
    summary += `- Top Keywords: ${analysis.keywords.slice(0, 10).join(', ')}\n`;
    summary += `- Main Sections: ${analysis.headings.slice(0, 8).join(', ')}\n`;
    summary += `- Images: ${analysis.images}, Links: ${analysis.links}\n\n`;
  });

  summary += `\n**Strategy**: Create content that surpasses these articles by:\n`;
  summary += `- Targeting average word count: ${Math.round(analyses.reduce((sum, a) => sum + a.wordCount, 0) / analyses.length)}\n`;
  summary += `- Covering all major topics they discuss\n`;
  summary += `- Adding unique insights and examples\n`;
  summary += `- Better visual formatting and structure\n`;

  return summary;
}
