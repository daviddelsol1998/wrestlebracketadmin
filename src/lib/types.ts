export type OptionType = { value: string; label: string };

export type PromotionRef = { id: string; name: string };
export type FactionRef = { id: string; name: string };

export type WrestlerPromotionJoin = {
  promotion: PromotionRef;
};

export type WrestlerFactionJoin = {
  faction: FactionRef;
};

export type WrestlerJoinResult = {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
  wrestler_promotions: WrestlerPromotionJoin[];
  wrestler_factions: WrestlerFactionJoin[];
}; 