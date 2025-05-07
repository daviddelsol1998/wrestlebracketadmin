import { supabase } from './supabaseClient';

export type OptionType = { value: string; label: string };

export type PromotionRef = { id: string; name: string };

export type Wrestler = {
  id: string;
  name: string;
  image_url?: string | null;
  promotions?: PromotionRef[];
  factions?: OptionType[];
  championships?: OptionType[];
  created_at?: string;
};

// Fetch all wrestlers
export async function getWrestlers(): Promise<Wrestler[]> {
  const { data, error } = await supabase
    .from('wrestlers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Wrestler[];
}

// Fetch all wrestlers with their promotions
export async function fetchWrestlersWithPromotions(): Promise<Wrestler[]> {
  const { data, error } = await supabase
    .from('wrestlers')
    .select('id, name, image_url, created_at, wrestler_promotions: wrestler_promotions(promotion: promotions(id, name))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Map the join table to promotions array
  return (data as any[]).map(w => ({
    ...w,
    promotions: (w.wrestler_promotions || []).map((wp: any) => wp.promotion).filter(Boolean),
  }));
}

// Create a new wrestler
export async function createWrestler(wrestler: Omit<Wrestler, 'id' | 'created_at'>): Promise<Wrestler> {
  const { data, error } = await supabase
    .from('wrestlers')
    .insert({
      name: wrestler.name,
      image_url: wrestler.image_url,
      promotions: wrestler.promotions ?? [],
      factions: wrestler.factions ?? [],
      championships: wrestler.championships ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as Wrestler;
}

// Create a new wrestler and set promotions
export async function createWrestlerWithPromotions(
  wrestler: Omit<Wrestler, 'id' | 'created_at' | 'promotions'> & { promotions: string[] }
): Promise<Wrestler> {
  const { data, error } = await supabase
    .from('wrestlers')
    .insert({
      name: wrestler.name,
      image_url: wrestler.image_url,
    })
    .select()
    .single();
  if (error) throw error;
  const wrestlerId = data.id;
  // Insert into join table
  if (wrestler.promotions.length > 0) {
    const { error: joinError } = await supabase
      .from('wrestler_promotions')
      .insert(wrestler.promotions.map(promotion_id => ({ wrestler_id: wrestlerId, promotion_id })));
    if (joinError) throw joinError;
  }
  // Fetch with promotions
  return (await fetchWrestlerByIdWithPromotions(wrestlerId))!;
}

// Update a wrestler
export async function updateWrestler(id: string, wrestler: Partial<Omit<Wrestler, 'id' | 'created_at'>>): Promise<Wrestler> {
  const { data, error } = await supabase
    .from('wrestlers')
    .update(wrestler)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Wrestler;
}

// Update a wrestler and set promotions
export async function updateWrestlerWithPromotions(
  id: string,
  wrestler: Partial<Omit<Wrestler, 'id' | 'created_at' | 'promotions'>> & { promotions: string[] }
): Promise<Wrestler> {
  const { error } = await supabase
    .from('wrestlers')
    .update({
      name: wrestler.name,
      image_url: wrestler.image_url,
    })
    .eq('id', id);
  if (error) throw error;
  // Remove old associations
  await supabase.from('wrestler_promotions').delete().eq('wrestler_id', id);
  // Insert new associations
  if (wrestler.promotions.length > 0) {
    const { error: joinError } = await supabase
      .from('wrestler_promotions')
      .insert(wrestler.promotions.map(promotion_id => ({ wrestler_id: id, promotion_id })));
    if (joinError) throw joinError;
  }
  // Fetch with promotions
  return (await fetchWrestlerByIdWithPromotions(id))!;
}

// Delete a wrestler
export async function deleteWrestler(id: string): Promise<void> {
  const { error } = await supabase
    .from('wrestlers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Delete a wrestler and its associations (handled by cascade)
export async function deleteWrestlerWithPromotions(id: string): Promise<void> {
  const { error } = await supabase
    .from('wrestlers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Fetch a single wrestler with promotions
export async function fetchWrestlerByIdWithPromotions(id: string): Promise<Wrestler | null> {
  const { data, error } = await supabase
    .from('wrestlers')
    .select('id, name, image_url, created_at, wrestler_promotions: wrestler_promotions(promotion: promotions(id, name))')
    .eq('id', id)
    .single();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    promotions: (data.wrestler_promotions || []).map((wp: any) => wp.promotion).filter(Boolean),
  };
}

// Upload wrestler image to storage and return the public URL
export async function uploadWrestlerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage
    .from('wrestler-images')
    .upload(filePath, file, { upsert: false });
  if (error) throw error;
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('wrestler-images').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
} 