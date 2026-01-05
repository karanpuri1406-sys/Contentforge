import type { GeneratedArticle } from '../types/article';

export interface AIServiceConfig {
  provider: 'gemini' | 'openrouter';
  apiKey: string;
  model?: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateArticle(systemPrompt: string, mainPrompt: string): Promise<GeneratedArticle> {
    if (this.config.provider === 'gemini') {
      return this.generateWithGemini(systemPrompt, mainPrompt);
    } else {
      return this.generateWithOpenRouter(systemPrompt, mainPrompt);
    }
  }

  private async generateWithGemini(systemPrompt: string, mainPrompt: string): Promise<GeneratedArticle> {
    const model = this.config.model || 'gemini-2.0-flash-exp';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${mainPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content generated from Gemini');
    }

    // Parse JSON response
    try {
      const article = JSON.parse(content);
      return this.validateArticle(article);
    } catch (error) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const article = JSON.parse(jsonMatch[0]);
        return this.validateArticle(article);
      }
      throw new Error('Failed to parse article JSON from Gemini response');
    }
  }

  private async generateWithOpenRouter(systemPrompt: string, mainPrompt: string): Promise<GeneratedArticle> {
    const model = this.config.model || 'anthropic/claude-3.5-sonnet';
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ContentForge AI'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: mainPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from OpenRouter');
    }

    // Parse JSON response
    try {
      const article = JSON.parse(content);
      return this.validateArticle(article);
    } catch (error) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const article = JSON.parse(jsonMatch[0]);
        return this.validateArticle(article);
      }
      throw new Error('Failed to parse article JSON from OpenRouter response');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    if (this.config.provider !== 'gemini') {
      throw new Error('Image generation is only supported with Gemini API');
    }

    const model = 'imagen-3.0-generate-001';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateImages?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        number_of_images: 1,
        aspect_ratio: '16:9',
        safety_filter_level: 'block_some',
        person_generation: 'allow_all'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini Image API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const imageData = data.generatedImages?.[0]?.image;

    if (!imageData) {
      throw new Error('No image generated from Gemini');
    }

    // Convert base64 to blob URL (temporary)
    // In production, you'd upload this to storage
    const byteCharacters = atob(imageData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  }

  async performWebSearch(query: string): Promise<string> {
    // This would integrate with a search API like Serper, Brave Search, or Google Custom Search
    // For now, returning a placeholder that instructs to use current data
    return `Note: Perform web research for: "${query}" and use the most current 2026 data available.`;
  }

  private validateArticle(article: any): GeneratedArticle {
    // Validate required fields
    if (!article.title || !article.content) {
      throw new Error('Article must have title and content');
    }

    // Ensure all fields exist with defaults
    return {
      title: article.title,
      content: article.content,
      metaTitle: article.metaTitle || article.title.substring(0, 60),
      metaDescription: article.metaDescription || '',
      slug: article.slug || this.generateSlug(article.title),
      schemaMarkup: article.schemaMarkup || {},
      externalLinks: Array.isArray(article.externalLinks) ? article.externalLinks : [],
      internalLinksUsed: Array.isArray(article.internalLinksUsed) ? article.internalLinksUsed : [],
      wordCount: article.wordCount || this.estimateWordCount(article.content),
      imagePrompts: Array.isArray(article.imagePrompts) ? article.imagePrompts : []
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private estimateWordCount(content: string): number {
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/);
    return words.length;
  }
}

export async function testAPIKey(provider: 'gemini' | 'openrouter', apiKey: string): Promise<boolean> {
  try {
    const service = new AIService({ provider, apiKey });
    
    if (provider === 'gemini') {
      const model = 'gemini-2.0-flash-exp';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } else {
      const url = 'https://openrouter.ai/api/v1/models';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    }
  } catch {
    return false;
  }
}
