import { supabase } from './supabaseClient';

export type OptionType = { value: string; label: string };

export type Wrestler = {
  id: string;
  name: string;
  image_url?: string | null;
  promotions?: OptionType[];
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

// Delete a wrestler
export async function deleteWrestler(id: string): Promise<void> {
  const { error } = await supabase
    .from('wrestlers')
    .delete()
    .eq('id', id);
  if (error) throw error;
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