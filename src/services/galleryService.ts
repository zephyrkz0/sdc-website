import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GalleryItem } from '../types';

export const galleryService = {
  // Fetch all gallery items from Supabase
  async fetchGalleryItems(): Promise<GalleryItem[]> {
    if (!isSupabaseConfigured()) {
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
    if (!isSupabaseConfigured()) {
      // Local preview fallback
      const localUrl = URL.createObjectURL(file);
      const localItem: GalleryItem = {
        id: `local-img-${Date.now()}`,
        title: metadata.title,
        category: metadata.category,
        imageUrl: localUrl,
        description: metadata.description,
        date: new Date().toISOString().split('T')[0],
        photographer: metadata.photographer || 'SDC Member',
        aspectRatio: metadata.aspectRatio || '16:9',
        tags: metadata.tags || [],
        createdAt: new Date().toISOString(),
      };
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
    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Failed to delete photo:', err);
      return false;
    }
  }
};
