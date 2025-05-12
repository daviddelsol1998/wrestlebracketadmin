import { supabase } from './supabaseClient';

export type Faction = {
  id: string;
  name: string;
  image_url?: string | null;
  created_at?: string;
  wrestler_count?: number;
};

// Fetch all factions
export async function getFactions(): Promise<Faction[]> {
  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Faction[];
}

// Fetch all factions with wrestler count
export async function getFactionsWithWrestlerCount(): Promise<Faction[]> {
  const { data, error } = await supabase
    .from('factions')
    .select('id, name, image_url, created_at, wrestler_factions(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as any[]).map(f => ({
    ...f,
    wrestler_count: f.wrestler_factions?.[0]?.count ?? 0,
  }));
}

// Create a new faction
export async function createFaction(faction: Omit<Faction, 'id' | 'created_at'>): Promise<Faction> {
  const { data, error } = await supabase
    .from('factions')
    .insert({
      name: faction.name,
      image_url: faction.image_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Faction;
}

// Update a faction
export async function updateFaction(id: string, faction: Partial<Omit<Faction, 'id' | 'created_at'>>): Promise<Faction> {
  const { data, error } = await supabase
    .from('factions')
    .update(faction)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Faction;
}

// Delete a faction
export async function deleteFaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('factions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Upload faction image to storage and return the public URL
export async function uploadFactionImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage
    .from('faction-images')
    .upload(filePath, file, { upsert: false });
  if (error) throw error;
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('faction-images').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
} 