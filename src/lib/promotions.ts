import { supabase } from './supabaseClient';

export type Promotion = {
  id: string;
  name: string;
  image_url?: string | null;
  created_at?: string;
  wrestler_count?: number;
};

// Fetch all promotions
export async function getPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Promotion[];
}

// Fetch all promotions with wrestler count
export async function getPromotionsWithWrestlerCount(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('id, name, image_url, created_at, wrestler_promotions(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as any[]).map(p => ({
    ...p,
    wrestler_count: p.wrestler_promotions?.[0]?.count ?? 0,
  }));
}

// Create a new promotion
export async function createPromotion(promotion: Omit<Promotion, 'id' | 'created_at'>): Promise<Promotion> {
  const { data, error } = await supabase
    .from('promotions')
    .insert({
      name: promotion.name,
      image_url: promotion.image_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Promotion;
}

// Update a promotion
export async function updatePromotion(id: string, promotion: Partial<Omit<Promotion, 'id' | 'created_at'>>): Promise<Promotion> {
  const { data, error } = await supabase
    .from('promotions')
    .update(promotion)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Promotion;
}

// Delete a promotion
export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Upload promotion image to storage and return the public URL
export async function uploadPromotionImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage
    .from('promotion-images')
    .upload(filePath, file, { upsert: false });
  if (error) throw error;
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('promotion-images').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
} 