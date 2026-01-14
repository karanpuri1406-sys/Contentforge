import axios from 'axios';
import { db, WordPressSite, Article } from '../lib/db';

export interface WordPressPost {
  title: string;
  content: string;
  status: 'draft' | 'publish' | 'pending';
  excerpt?: string;
  slug?: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: {
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
    _yoast_wpseo_focuskw?: string;
  };
}

export interface WordPressResponse {
  id: number;
  link: string;
  title: { rendered: string };
  status: string;
}

export async function publishToWordPress(
  siteId: number,
  article: Article
): Promise<WordPressResponse> {
  const site = await db.wordPressSites.get(siteId);
  
  if (!site) {
    throw new Error('WordPress site not found');
  }

  if (!site.isActive) {
    throw new Error('WordPress site is not active');
  }

  // Prepare the post data
  const postData: WordPressPost = {
    title: article.title,
    content: article.htmlContent,
    status: article.status === 'published' ? 'publish' : 'draft',
    excerpt: article.metaDescription,
    slug: article.slug,
  };

  // Add Yoast SEO metadata if available
  if (article.metaTitle || article.metaDescription || article.targetKeyword) {
    postData.meta = {
      _yoast_wpseo_title: article.metaTitle,
      _yoast_wpseo_metadesc: article.metaDescription,
      _yoast_wpseo_focuskw: article.targetKeyword,
    };
  }

  try {
    // WordPress REST API endpoint
    const apiUrl = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/posts`;

    // Create authentication header
    const auth = Buffer.from(`${site.username}:${site.applicationPassword}`).toString('base64');

    const response = await axios.post<WordPressResponse>(
      apiUrl,
      postData,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update last publish time
    await db.wordPressSites.update(siteId, {
      lastPublishAt: new Date(),
    });

    return response.data;
  } catch (error: any) {
    console.error('WordPress publishing error:', error.response?.data || error.message);
    throw new Error(
      `Failed to publish to WordPress: ${error.response?.data?.message || error.message}`
    );
  }
}

export async function uploadImageToWordPress(
  siteId: number,
  imageUrl: string,
  altText?: string
): Promise<number> {
  const site = await db.wordPressSites.get(siteId);
  
  if (!site) {
    throw new Error('WordPress site not found');
  }

  try {
    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = imageResponse.data;

    // Upload to WordPress
    const apiUrl = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/media`;
    const auth = Buffer.from(`${site.username}:${site.applicationPassword}`).toString('base64');

    // Get filename from URL
    const filename = imageUrl.split('/').pop() || 'image.jpg';

    const formData = new FormData();
    const blob = new Blob([imageBuffer]);
    formData.append('file', blob, filename);
    
    if (altText) {
      formData.append('alt_text', altText);
    }

    const response = await axios.post(
      apiUrl,
      formData,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.id;
  } catch (error: any) {
    console.error('Image upload error:', error.response?.data || error.message);
    throw new Error(
      `Failed to upload image to WordPress: ${error.response?.data?.message || error.message}`
    );
  }
}

export async function testWordPressConnection(site: Omit<WordPressSite, 'id' | 'createdAt' | 'lastPublishAt'>): Promise<boolean> {
  try {
    const apiUrl = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/users/me`;
    const auth = Buffer.from(`${site.username}:${site.applicationPassword}`).toString('base64');

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error('WordPress connection test failed:', error);
    return false;
  }
}

export async function getWordPressCategories(siteId: number): Promise<Array<{ id: number; name: string }>> {
  const site = await db.wordPressSites.get(siteId);
  
  if (!site) {
    throw new Error('WordPress site not found');
  }

  try {
    const apiUrl = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/categories?per_page=100`;
    const auth = Buffer.from(`${site.username}:${site.applicationPassword}`).toString('base64');

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    return response.data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
    }));
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    throw new Error('Failed to fetch WordPress categories');
  }
}

export async function getWordPressTags(siteId: number): Promise<Array<{ id: number; name: string }>> {
  const site = await db.wordPressSites.get(siteId);
  
  if (!site) {
    throw new Error('WordPress site not found');
  }

  try {
    const apiUrl = `${site.url.replace(/\/$/, '')}/wp-json/wp/v2/tags?per_page=100`;
    const auth = Buffer.from(`${site.username}:${site.applicationPassword}`).toString('base64');

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    return response.data.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
    }));
  } catch (error: any) {
    console.error('Failed to fetch tags:', error);
    throw new Error('Failed to fetch WordPress tags');
  }
}
