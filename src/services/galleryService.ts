import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GalleryItem } from '../types';

const ALLOWED_GALLERY_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const OFFLINE_GALLERY_KEY = 'sdc_offline_gallery_v2';

export const galleryService = {
  // Fetch all gallery items from Supabase (or offline persistent cache)
  async fetchGalleryItems(): Promise<GalleryItem[]> {
    if (!isSupabaseConfigured()) {
      try {
        const cached = localStorage.getItem(OFFLINE_GALLERY_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items from Supabase:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        imageUrl: row.image_url,
        description: row.description || '',
        date: row.date,
        photographer: row.photographer || '',
        aspectRatio: row.aspect_ratio || '16:9',
        tags: row.tags || [],
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Failed to fetch gallery items:', err);
      return [];
    }
  },

  // Upload an image file directly to Supabase Storage Bucket 'gallery-uploads' & record in DB
  async uploadPhoto(
    file: File,
    metadata: {
      title: string;
      category: string;
      description?: string;
      photographer?: string;
      aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4';
      tags?: string[];
    }
  ): Promise<GalleryItem | null> {
    if (!file || !ALLOWED_GALLERY_MIMES.includes(file.type.toLowerCase())) {
      throw new Error('Security Error: Only JPEG, PNG, WEBP, and GIF images are permitted for upload.');
    }

    if (!isSupabaseConfigured()) {
      // Local persistent fallback: convert file to Base64 data URL so it never vanishes on reload
      const base64Url: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const localItem: GalleryItem = {
        id: `local-img-${Date.now()}`,
        title: metadata.title,
        category: metadata.category,
        imageUrl: base64Url,
        description: metadata.description,
        date: new Date().toISOString().split('T')[0],
        photographer: metadata.photographer || 'SDC Member',
        aspectRatio: metadata.aspectRatio || '16:9',
        tags: metadata.tags || [],
        createdAt: new Date().toISOString(),
      };

      try {
        const cached = localStorage.getItem(OFFLINE_GALLERY_KEY);
        const existing: GalleryItem[] = cached ? JSON.parse(cached) : [];
        localStorage.setItem(OFFLINE_GALLERY_KEY, JSON.stringify([localItem, ...existing]));
      } catch {}

      return localItem;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      // 1. Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('gallery-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading photo to storage bucket:', uploadError);
        throw uploadError;
      }

      // 2. Get public CDN URL
      const { data: urlData } = supabase.storage
        .from('gallery-uploads')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Save record in gallery_items table
      const dbPayload = {
        title: metadata.title,
        category: metadata.category,
        image_url: publicUrl,
        description: metadata.description || '',
        date: new Date().toISOString().split('T')[0],
        photographer: metadata.photographer || 'SDC Member',
        aspect_ratio: metadata.aspectRatio || '16:9',
        tags: metadata.tags || [],
      };

      const { data, error: dbError } = await supabase
        .from('gallery_items')
        .insert([dbPayload])
        .select()
        .single();

      if (dbError) {
        console.error('Error recording gallery item in database:', dbError);
        throw dbError;
      }

      return {
        id: data.id,
        title: data.title,
        category: data.category,
        imageUrl: data.image_url,
        description: data.description,
        date: data.date,
        photographer: data.photographer,
        aspectRatio: data.aspect_ratio,
        tags: data.tags,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.error('Gallery upload failed:', err);
      return null;
    }
  },

  // Delete a gallery photo
  async deletePhoto(id: string): Promise<boolean> {
    try {
      const cached = localStorage.getItem(OFFLINE_GALLERY_KEY);
      if (cached) {
        const existing: GalleryItem[] = JSON.parse(cached);
        localStorage.setItem(OFFLINE_GALLERY_KEY, JSON.stringify(existing.filter((item) => item.id !== id)));
      }
    } catch {}

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Failed to delete photo from Supabase:', err);
      return false;
    }
  }
};
