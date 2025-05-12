import { supabase } from './supabaseClient';
import { OptionType, PromotionRef, FactionRef, WrestlerJoinResult } from './types';

export type OptionType = { value: string; label: string };

export type PromotionRef = { id: string; name: string };

export type FactionRef = { id: string; name: string };

export type Wrestler = {
  id: string;
  name: string;
  image_url?: string | null;
  promotions?: PromotionRef[];
  factions?: FactionRef[];
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

// Fetch all wrestlers with their promotions and factions
export async function fetchWrestlersWithPromotionsAndFactions(): Promise<Wrestler[]> {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      id, 
      name, 
      image_url, 
      created_at, 
      wrestler_promotions(promotion: promotions(id, name)),
      wrestler_factions(faction: factions(id, name))
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Map the join tables to arrays
  return (data as WrestlerJoinResult[]).map(w => ({
    ...w,
    promotions: w.wrestler_promotions.map(wp => wp.promotion),
    factions: w.wrestler_factions.map(wf => wf.faction),
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

// Create a new wrestler with promotions and factions
export async function createWrestlerWithPromotionsAndFactions(
  wrestler: Omit<Wrestler, 'id' | 'created_at' | 'promotions' | 'factions'> & { 
    promotions: string[],
    factions: string[]
  }
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

  // Insert into promotions join table
  if (wrestler.promotions.length > 0) {
    const { error: joinError } = await supabase
      .from('wrestler_promotions')
      .insert(wrestler.promotions.map(promotion_id => ({ wrestler_id: wrestlerId, promotion_id })));
    if (joinError) throw joinError;
  }

  // Insert into factions join table
  if (wrestler.factions.length > 0) {
    const { error: joinError } = await supabase
      .from('wrestler_factions')
      .insert(wrestler.factions.map(faction_id => ({ wrestler_id: wrestlerId, faction_id })));
    if (joinError) throw joinError;
  }

  // Fetch with promotions and factions
  return (await fetchWrestlerByIdWithPromotionsAndFactions(wrestlerId))!;
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

// Update a wrestler with promotions and factions
export async function updateWrestlerWithPromotionsAndFactions(
  id: string,
  wrestler: Partial<Omit<Wrestler, 'id' | 'created_at' | 'promotions' | 'factions'>> & { 
    promotions: string[],
    factions: string[]
  }
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
  await supabase.from('wrestler_factions').delete().eq('wrestler_id', id);

  // Insert new promotions associations
  if (wrestler.promotions.length > 0) {
    const { error: joinError } = await supabase
      .from('wrestler_promotions')
      .insert(wrestler.promotions.map(promotion_id => ({ wrestler_id: id, promotion_id })));
    if (joinError) throw joinError;
  }

  // Insert new factions associations
  if (wrestler.factions.length > 0) {
    const { error: joinError } = await supabase
      .from('wrestler_factions')
      .insert(wrestler.factions.map(faction_id => ({ wrestler_id: id, faction_id })));
    if (joinError) throw joinError;
  }

  // Fetch with promotions and factions
  return (await fetchWrestlerByIdWithPromotionsAndFactions(id))!;
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

// Fetch a single wrestler with promotions and factions
export async function fetchWrestlerByIdWithPromotionsAndFactions(id: string): Promise<Wrestler | null> {
  const { data, error } = await supabase
    .from('wrestlers')
    .select(`
      id, 
      name, 
      image_url, 
      created_at, 
      wrestler_promotions(promotion: promotions(id, name)),
      wrestler_factions(faction: factions(id, name))
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  if (!data) return null;
  const result = data as WrestlerJoinResult;
  return {
    ...result,
    promotions: result.wrestler_promotions.map(wp => wp.promotion),
    factions: result.wrestler_factions.map(wf => wf.faction),
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

// Export the new functions
export { createWrestlerWithPromotionsAndFactions as createWrestlerWithPromotions };
export { updateWrestlerWithPromotionsAndFactions as updateWrestlerWithPromotions };
export { fetchWrestlersWithPromotionsAndFactions as fetchWrestlersWithPromotions }; 