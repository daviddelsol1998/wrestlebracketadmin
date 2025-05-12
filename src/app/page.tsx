"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import type { ValueContainerProps, GroupBase } from "react-select";
import { fetchWrestlersWithPromotionsAndFactions, createWrestlerWithPromotionsAndFactions, updateWrestlerWithPromotionsAndFactions, deleteWrestler, uploadWrestlerImage, Wrestler, OptionType, PromotionRef } from "@/lib/wrestlers";
import { getPromotionsWithWrestlerCount, createPromotion, updatePromotion, deletePromotion, uploadPromotionImage, Promotion } from "@/lib/promotions";
import { getFactionsWithWrestlerCount, createFaction, updateFaction, deleteFaction, uploadFactionImage } from '@/lib/factions';
import type { Faction } from '@/lib/factions';
import { ClientCreatableSelect } from "@/components/client-select";

function WrestlerImageDropzone({ value, onChange }: { value?: File | null; onChange: (file: File | null) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles[0] || null);
  }, [onChange]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });
  return (
    <div {...getRootProps()} className="border-dashed border-2 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[120px] w-full bg-muted/30">
      <input {...getInputProps()} />
      {value ? (
        <img src={URL.createObjectURL(value)} alt="Preview" className="w-24 h-24 object-cover rounded-full mb-2" />
      ) : (
        <span className="text-muted-foreground text-sm">{isDragActive ? "Drop the image here..." : "Drag & drop or click to upload image"}</span>
      )}
    </div>
  );
}

function PromotionImageDropzone({ value, onChange }: { value?: File | null; onChange: (file: File | null) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles[0] || null);
  }, [onChange]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });
  return (
    <div {...getRootProps()} className="border-dashed border-2 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors min-h-[120px] w-full bg-muted/30">
      <input {...getInputProps()} />
      {value ? (
        <img src={URL.createObjectURL(value)} alt="Preview" className="w-24 h-24 object-cover rounded-full mb-2" />
      ) : (
        <span className="text-muted-foreground text-sm">{isDragActive ? "Drop the image here..." : "Drag & drop or click to upload image"}</span>
      )}
    </div>
  );
}

// Helper to convert PromotionRef[] to OptionType[]
function promotionRefsToOptions(promos: PromotionRef[] = []): OptionType[] {
  return promos.map(p => ({ value: p.id, label: p.name }));
}

// Helper to convert OptionType[] to string[] (promotion ids)
function optionsToPromotionIds(options: OptionType[]): string[] {
  return options.map(o => o.value);
}

// Custom ValueContainer for promotion filter
const PromotionValueContainer = ({ getValue, selectProps }: ValueContainerProps<OptionType, boolean, GroupBase<OptionType>>) => {
  const selected = getValue();
  const label = selectProps.placeholder || "Promotions";
  if (selected.length === 0) {
    return <div className="px-1 text-muted-foreground">{label}</div>;
  }
  // Show up to 2 selected names, then ellipsis if more
  const names = selected.map(s => s.label);
  let display = names.slice(0, 2).join(", ");
  if (names.length > 2) display += ", ...";
  return (
    <div className="px-1 truncate text-card-foreground">{display}</div>
  );
};

// Add helper function at the top with other helpers
function factionToOption(faction: Faction): OptionType {
  return {
    value: faction.id,
    label: faction.name
  };
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [promotions, setPromotions] = useState<OptionType[]>([]);
  const [factions, setFactions] = useState<OptionType[]>([]);
  const [championships, setChampionships] = useState<OptionType[]>([]);

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoImage, setPromoImage] = useState<File | null>(null);

  const [factionOpen, setFactionOpen] = useState(false);
  const [factionImage, setFactionImage] = useState<File | null>(null);

  const [champOpen, setChampOpen] = useState(false);
  const [champImage, setChampImage] = useState<File | null>(null);
  const [champName, setChampName] = useState("");

  // Edit Promotion modal state
  const [editPromoOpen, setEditPromoOpen] = useState(false);
  const [editPromoName, setEditPromoName] = useState("");
  const [editPromoImage, setEditPromoImage] = useState<File | null>(null);
  // Promotions state
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promotionsError, setPromotionsError] = useState<string | null>(null);
  // Create modal state
  const [newPromotionName, setNewPromotionName] = useState("");
  const [createPromotionLoading, setCreatePromotionLoading] = useState(false);
  // Edit modal state
  const [editPromotionId, setEditPromotionId] = useState<string | null>(null);
  const [editPromotionLoading, setEditPromotionLoading] = useState(false);
  // Delete state
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);

  // Edit Faction modal state
  const [editFactionOpen, setEditFactionOpen] = useState(false);
  const [editFactionName, setEditFactionName] = useState("");
  const [editFactionImage, setEditFactionImage] = useState<File | null>(null);
  // Factions state
  const [factionsList, setFactionsList] = useState<Faction[]>([]);
  const [factionsLoading, setFactionsLoading] = useState(true);
  const [factionsError, setFactionsError] = useState<string | null>(null);
  // Create modal state for Factions
  const [newFactionName, setNewFactionName] = useState("");
  const [createFactionLoading, setCreateFactionLoading] = useState(false);
  // Edit modal state
  const [editFactionId, setEditFactionId] = useState<string | null>(null);
  const [editFactionLoading, setEditFactionLoading] = useState(false);
  // Delete state
  const [deleteFactionId, setDeleteFactionId] = useState<string | null>(null);

  // Edit Championship modal state
  const [editChampOpen, setEditChampOpen] = useState(false);
  const [editChampName, setEditChampName] = useState("");
  const [editChampImage, setEditChampImage] = useState<File | null>(null);
  // Mock championships data
  const mockChampionships = [
    { id: 1, name: "World Championship", image: "https://placehold.co/80x80/png" },
    { id: 2, name: "Tag Team Championship", image: "https://placehold.co/80x80/png" },
    { id: 3, name: "Intercontinental", image: "https://placehold.co/80x80/png" },
  ];

  // Delete modal state for all entities
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEntityType, setDeleteEntityType] = useState<string | null>(null);
  const [deleteEntityName, setDeleteEntityName] = useState<string>("");

  // Edit Wrestler modal state
  const [editWrestlerOpen, setEditWrestlerOpen] = useState(false);
  const [editWrestlerName, setEditWrestlerName] = useState("");
  const [editWrestlerImage, setEditWrestlerImage] = useState<File | null>(null);
  const [editWrestlerPromotions, setEditWrestlerPromotions] = useState<OptionType[]>([]);
  const [editWrestlerFactions, setEditWrestlerFactions] = useState<OptionType[]>([]);
  const [editWrestlerChampionships, setEditWrestlerChampionships] = useState<OptionType[]>([]);
  // Wrestlers state
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [wrestlersLoading, setWrestlersLoading] = useState(true);
  const [wrestlersError, setWrestlersError] = useState<string | null>(null);
  // Create modal state for Wrestlers
  const [newWrestlerName, setNewWrestlerName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  // Edit modal state
  const [editWrestlerId, setEditWrestlerId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  // Delete state
  const [deleteWrestlerId, setDeleteWrestlerId] = useState<string | null>(null);

  // Supabase color palette for select dropdowns
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const selectStyles = {
    container: (base: Record<string, unknown>) => ({ ...base, flex: 1, minWidth: 0 }),
    control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: isDark ? '#18181b' : '#fff',
      borderColor: state.isFocused ? '#3b82f6' : (isDark ? '#27272a' : '#e5e7eb'),
      color: isDark ? '#fff' : '#18181b',
      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : undefined,
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: isDark ? '#18181b' : '#fff',
      color: isDark ? '#fff' : '#18181b',
      zIndex: 99999,
    }),
    option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (isDark ? '#3b82f6' : '#e0e7ff')
        : state.isFocused
        ? (isDark ? '#27272a' : '#f3f4f6')
        : (isDark ? '#18181b' : '#fff'),
      color: isDark ? '#fff' : '#18181b',
      cursor: 'pointer',
    }),
    multiValue: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: isDark ? '#27272a' : '#f3f4f6',
      color: isDark ? '#fff' : '#18181b',
    }),
    multiValueLabel: (base: Record<string, unknown>) => ({
      ...base,
      color: isDark ? '#fff' : '#18181b',
    }),
  };

  // Add state for promotion filter
  const [promotionFilter, setPromotionFilter] = useState<string[]>([]);

  // Add state for wrestler search filter
  const [wrestlerSearch, setWrestlerSearch] = useState("");

  // Add state for faction filter
  const [factionFilter, setFactionFilter] = useState<string[]>([]);

  // Add faction search state
  const [factionSearch, setFactionSearch] = useState("");

  // Fetch wrestlers on mount
  useEffect(() => {
    setWrestlersLoading(true);
    fetchWrestlersWithPromotionsAndFactions()
      .then((ws: Wrestler[]) => setWrestlers(ws))
      .catch((e: unknown) => setWrestlersError((e as Error).message))
      .finally(() => setWrestlersLoading(false));
  }, []);

  // Fetch promotions on mount
  useEffect(() => {
    setPromotionsLoading(true);
    getPromotionsWithWrestlerCount()
      .then(setPromotionsList)
      .catch((e: unknown) => setPromotionsError((e as Error).message))
      .finally(() => setPromotionsLoading(false));
  }, []);

  // Load factions
  useEffect(() => {
    async function loadFactions() {
      try {
        setFactionsLoading(true);
        const factions = await getFactionsWithWrestlerCount();
        setFactionsList(factions);
      } catch (e) {
        console.error('Error loading factions:', e);
        setFactionsError((e as Error).message);
      } finally {
        setFactionsLoading(false);
      }
    }
    loadFactions();
  }, []);

  // Create wrestler handler
  async function handleCreateWrestler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (image) {
        imageUrl = await uploadWrestlerImage(image);
      }
      const wrestler = await createWrestlerWithPromotionsAndFactions({
        name: newWrestlerName,
        image_url: imageUrl,
        promotions: optionsToPromotionIds(promotions),
        factions: optionsToPromotionIds(factions),
      });
      setWrestlers([wrestler, ...wrestlers]);
      setOpen(false);
      setNewWrestlerName("");
      setImage(null);
      setPromotions([]);
      setFactions([]);
      setChampionships([]);
      // Refresh both promotions and factions counts
      await Promise.all([
        getPromotionsWithWrestlerCount().then(setPromotionsList),
        getFactionsWithWrestlerCount().then(setFactionsList)
      ]);
    } catch (e: unknown) {
      console.error("Error creating wrestler:", e);
      alert("Error creating wrestler: " + (e as Error).message);
    } finally {
      setCreateLoading(false);
    }
  }

  // Edit wrestler handler
  async function handleEditWrestler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editWrestlerId) return;
    setEditLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (editWrestlerImage) {
        imageUrl = await uploadWrestlerImage(editWrestlerImage);
      }
      const wrestler = await updateWrestlerWithPromotionsAndFactions(editWrestlerId, {
        name: editWrestlerName,
        image_url: imageUrl,
        promotions: optionsToPromotionIds(editWrestlerPromotions),
        factions: optionsToPromotionIds(editWrestlerFactions),
      });
      setWrestlers(wrestlers => wrestlers.map(w => w.id === wrestler.id ? wrestler : w));
      setEditWrestlerOpen(false);
      setEditWrestlerId(null);
      setEditWrestlerName("");
      setEditWrestlerImage(null);
      setEditWrestlerPromotions(promotionRefsToOptions(wrestler.promotions ?? []));
      setEditWrestlerFactions((wrestler.factions ?? []).map(f => ({
        value: f.id,
        label: f.name
      })));
      setEditWrestlerChampionships(wrestler.championships ?? []);
      // Refresh both promotions and factions counts
      await Promise.all([
        getPromotionsWithWrestlerCount().then(setPromotionsList),
        getFactionsWithWrestlerCount().then(setFactionsList)
      ]);
    } catch (e: unknown) {
      console.error("Error updating wrestler:", e);
      alert("Error updating wrestler: " + (e as Error).message);
    } finally {
      setEditLoading(false);
    }
  }

  // Delete wrestler handler
  async function handleDeleteWrestler(): Promise<void> {
    if (!deleteWrestlerId) return;
    try {
      await deleteWrestler(deleteWrestlerId);
      setWrestlers(wrestlers => wrestlers.filter(w => w.id !== deleteWrestlerId));
      setDeleteWrestlerId(null);
      setDeleteEntityType(null);
      setDeleteEntityName("");
      // Refresh both promotions and factions counts
      await Promise.all([
        getPromotionsWithWrestlerCount().then(setPromotionsList),
        getFactionsWithWrestlerCount().then(setFactionsList)
      ]);
    } catch (e: unknown) {
      console.error("Error deleting wrestler:", e);
      alert("Error deleting wrestler: " + (e as Error).message);
    }
  }

  // Create promotion handler
  async function handleCreatePromotion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatePromotionLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (promoImage) {
        imageUrl = await uploadPromotionImage(promoImage);
      }
      const promotion = await createPromotion({
        name: newPromotionName,
        image_url: imageUrl,
      });
      setPromotionsList([promotion, ...promotionsList]);
      setPromoOpen(false);
      setNewPromotionName("");
      setPromoImage(null);
      await getPromotionsWithWrestlerCount().then(setPromotionsList);
    } catch (e: unknown) {
      alert("Error creating promotion: " + (e as Error).message);
    } finally {
      setCreatePromotionLoading(false);
    }
  }

  // Edit promotion handler
  async function handleEditPromotion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editPromotionId) return;
    setEditPromotionLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (editPromoImage) {
        imageUrl = await uploadPromotionImage(editPromoImage);
      }
      const promotion = await updatePromotion(editPromotionId, {
        name: editPromoName,
        image_url: imageUrl,
      });
      setPromotionsList(list => list.map(p => p.id === promotion.id ? promotion : p));
      setEditPromoOpen(false);
      setEditPromotionId(null);
      setEditPromoName("");
      setEditPromoImage(null);
      await getPromotionsWithWrestlerCount().then(setPromotionsList);
    } catch (e: unknown) {
      alert("Error updating promotion: " + (e as Error).message);
    } finally {
      setEditPromotionLoading(false);
    }
  }

  // Delete promotion handler
  async function handleDeletePromotion(): Promise<void> {
    if (!deletePromotionId) return;
    try {
      await deletePromotion(deletePromotionId);
      setPromotionsList(list => list.filter(p => p.id !== deletePromotionId));
      setDeletePromotionId(null);
      setDeleteEntityType(null);
      setDeleteEntityName("");
      await getPromotionsWithWrestlerCount().then(setPromotionsList);
      // Refetch wrestlers so their promotions update in the UI
      await fetchWrestlersWithPromotionsAndFactions().then(setWrestlers);
    } catch (e: unknown) {
      alert("Error deleting promotion: " + (e as Error).message);
    }
  }

  const handleCreatePromotionOption = async (inputValue: string) => {
    try {
      const newPromotion = await createPromotion({ name: inputValue, image_url: null });
      setPromotionsList(prev => [{ ...newPromotion }, ...prev]);
      setPromotions(prev => [...prev, { value: newPromotion.id, label: newPromotion.name }]);
      await getPromotionsWithWrestlerCount().then(setPromotionsList);
    } catch (e) {
      alert("Error creating promotion: " + (e as Error).message);
    }
  };

  const handleEditCreatePromotionOption = async (inputValue: string) => {
    try {
      const newPromotion = await createPromotion({ name: inputValue, image_url: null });
      setPromotionsList(prev => [{ ...newPromotion }, ...prev]);
      setEditWrestlerPromotions(prev => [...prev, { value: newPromotion.id, label: newPromotion.name }]);
      await getPromotionsWithWrestlerCount().then(setPromotionsList);
    } catch (e) {
      alert("Error creating promotion: " + (e as Error).message);
    }
  };

  // Create faction handler
  async function handleCreateFaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateFactionLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (factionImage) {
        imageUrl = await uploadFactionImage(factionImage);
      }
      const faction = await createFaction({
        name: newFactionName,
        image_url: imageUrl,
      });
      setFactionsList([faction, ...factionsList]);
      setFactionOpen(false);
      setNewFactionName("");
      setFactionImage(null);
      await getFactionsWithWrestlerCount().then(setFactionsList);
    } catch (e: unknown) {
      alert("Error creating faction: " + (e as Error).message);
    } finally {
      setCreateFactionLoading(false);
    }
  }

  // Edit faction handler
  async function handleEditFaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editFactionId) return;
    setEditFactionLoading(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (editFactionImage) {
        imageUrl = await uploadFactionImage(editFactionImage);
      }
      const faction = await updateFaction(editFactionId, {
        name: editFactionName,
        image_url: imageUrl,
      });
      setFactionsList(list => list.map(f => f.id === faction.id ? faction : f));
      setEditFactionOpen(false);
      setEditFactionId(null);
      setEditFactionName("");
      setEditFactionImage(null);
      await getFactionsWithWrestlerCount().then(setFactionsList);
    } catch (e: unknown) {
      alert("Error updating faction: " + (e as Error).message);
    } finally {
      setEditFactionLoading(false);
    }
  }

  // Delete faction handler
  async function handleDeleteFaction(): Promise<void> {
    if (!deleteFactionId) return;
    try {
      await deleteFaction(deleteFactionId);
      setFactionsList(list => list.filter(f => f.id !== deleteFactionId));
      setDeleteFactionId(null);
      setDeleteEntityType(null);
      setDeleteEntityName("");
      await getFactionsWithWrestlerCount().then(setFactionsList);
      // Refetch wrestlers so their factions update in the UI
      await fetchWrestlersWithPromotionsAndFactions().then(setWrestlers);
    } catch (e: unknown) {
      alert("Error deleting faction: " + (e as Error).message);
    }
  }

  const handleCreateFactionOption = async (inputValue: string) => {
    try {
      const newFaction = await createFaction({ name: inputValue, image_url: null });
      setFactionsList(prev => [{ ...newFaction }, ...prev]);
      setFactions(prev => [...prev, { value: newFaction.id, label: newFaction.name }]);
      await getFactionsWithWrestlerCount().then(setFactionsList);
    } catch (e) {
      alert("Error creating faction: " + (e as Error).message);
    }
  };

  const handleEditCreateFactionOption = async (inputValue: string) => {
    try {
      const newFaction = await createFaction({ name: inputValue, image_url: null });
      setFactionsList(prev => [{ ...newFaction }, ...prev]);
      setEditWrestlerFactions(prev => [...prev, { value: newFaction.id, label: newFaction.name }]);
      await getFactionsWithWrestlerCount().then(setFactionsList);
    } catch (e) {
      alert("Error creating faction: " + (e as Error).message);
    }
  };

  // Delete dialog handler
  async function handleDelete(): Promise<void> {
    if (deleteEntityType === "Wrestler" && deleteWrestlerId) {
      await handleDeleteWrestler();
    } else if (deleteEntityType === "Promotion" && deletePromotionId) {
      await handleDeletePromotion();
    } else if (deleteEntityType === "Faction" && deleteFactionId) {
      await handleDeleteFaction();
    }
    setDeleteDialogOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight">WrestleBracket Admin</h1>
        {/* TODO: Add ModeToggle here */}
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </header>
      {/* Main Content with Tabs */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <Tabs defaultValue="wrestlers" className="w-full max-w-5xl">
          <TabsList className="mb-6">
            <TabsTrigger value="wrestlers">Wrestlers</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="factions">Factions</TabsTrigger>
            <TabsTrigger value="championships">Championships</TabsTrigger>
          </TabsList>
          <TabsContent value="wrestlers">
            {wrestlersLoading && (
              <div className="text-center text-muted-foreground py-12">Loading wrestlers...</div>
            )}
            {wrestlersError && (
              <div className="text-center text-destructive py-4">{wrestlersError}</div>
            )}
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:gap-6">
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-muted-foreground mb-1">Search</label>
                <Input
                  placeholder="Search wrestlers by name..."
                  className="w-full"
                  value={wrestlerSearch}
                  onChange={e => setWrestlerSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                <div className="flex flex-col w-48">
                  <label className="text-xs font-medium text-muted-foreground mb-1">Promotions</label>
                  <ClientCreatableSelect
                    isMulti
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    placeholder=""
                    value={promotionsList
                      .filter(p => promotionFilter.includes(p.id))
                      .map(p => ({ value: p.id, label: p.name }))}
                    onChange={(newValue) => {
                      setPromotionFilter((newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []).map(o => o.value));
                    }}
                    options={promotionsList.map(p => ({ value: p.id, label: p.name }))}
                    isClearable
                    components={{ ValueContainer: PromotionValueContainer }}
                  />
                </div>
                <div className="flex flex-col w-48">
                  <label className="text-xs font-medium text-muted-foreground mb-1">Factions</label>
                  <ClientCreatableSelect
                    isMulti
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    placeholder=""
                    value={factionsList
                      .filter(f => factionFilter.includes(f.id))
                      .map(f => ({ value: f.id, label: f.name }))}
                    onChange={(newValue) => {
                      setFactionFilter((newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []).map(o => o.value));
                    }}
                    options={factionsList.map(f => ({ value: f.id, label: f.name }))}
                    isClearable
                    components={{ ValueContainer: (props) => (
                      <PromotionValueContainer {...props} selectProps={{ ...props.selectProps, placeholder: "Factions" }} />
                    ) }}
                    onCreateOption={handleCreateFactionOption}
                  />
                </div>
                <div className="flex flex-col w-48">
                  <label className="text-xs font-medium text-muted-foreground mb-1">Championships</label>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="world">World Championship</SelectItem>
                      <SelectItem value="tag">Tag Team Championship</SelectItem>
                      <SelectItem value="intercontinental">Intercontinental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setOpen(true)}>
                    Create New
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Wrestler</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full" onSubmit={handleCreateWrestler}>
                  <WrestlerImageDropzone value={image} onChange={setImage} />
                  <Input
                    placeholder="Name"
                    className="w-full"
                    value={newWrestlerName}
                    onChange={e => setNewWrestlerName(e.target.value)}
                  />
                  <label className="text-sm font-medium mb-1">Promotion(s)</label>
                  <ClientCreatableSelect
                    isMulti
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    placeholder="Select or create a promotion..."
                    value={promotions}
                    onChange={(newValue) => {
                      setPromotions(newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []);
                    }}
                    options={promotionsList.map(p => ({ value: p.id, label: p.name }))}
                    onCreateOption={handleCreatePromotionOption}
                  />
                  <label className="text-sm font-medium mb-1">Faction(s)</label>
                  <ClientCreatableSelect
                    isMulti
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    placeholder="Factions"
                    value={factions}
                    onChange={(newValue) => {
                      setFactions(newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []);
                    }}
                    options={[
                      { value: "bulletclub", label: "Bullet Club" },
                      { value: "bloodline", label: "The Bloodline" },
                      { value: "chaos", label: "CHAOS" },
                    ]}
                  />
                  <label className="text-sm font-medium mb-1">Championship(s)</label>
                  <ClientCreatableSelect
                    isMulti
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    placeholder="Championships"
                    value={championships}
                    onChange={(newValue) => {
                      setChampionships(newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []);
                    }}
                    options={[
                      { value: "world", label: "World Championship" },
                      { value: "tag", label: "Tag Team Championship" },
                      { value: "intercontinental", label: "Intercontinental" },
                    ]}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {wrestlers
                .filter(wrestler =>
                  // Filter by search string
                  wrestler.name.toLowerCase().includes(wrestlerSearch.trim().toLowerCase())
                )
                .filter(wrestler =>
                  // Filter by promotions
                  promotionFilter.length === 0 ||
                  (wrestler.promotions ?? []).some(p => promotionFilter.includes(p.id))
                )
                .filter(wrestler =>
                  // Filter by factions
                  factionFilter.length === 0 ||
                  (wrestler.factions ?? []).some(f => factionFilter.includes(f.id))
                )
                .map((wrestler) => (
                  <Card key={wrestler.id} className="bg-card text-card-foreground border border-border shadow-sm flex flex-col gap-6 rounded-xl py-6">
                    <CardHeader className="flex flex-row items-center gap-4 px-6">
                      <img
                        src={wrestler.image_url || "https://placehold.co/80x80/png"}
                        alt={wrestler.name}
                        className="w-20 h-20 rounded-full object-cover border border-border bg-muted"
                      />
                      <div>
                        <CardTitle className="text-card-foreground">{wrestler.name}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(wrestler.promotions ?? []).map((p: PromotionRef) => (
                            <span key={p.id} className="bg-primary/20 text-primary-foreground px-2 py-0.5 rounded text-xs border border-primary/30">
                              {p.name}
                            </span>
                          ))}
                          {(wrestler.factions ?? []).map((f: Faction) => (
                            <span key={f.id} className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded text-xs border border-secondary/30">
                              {f.name}
                            </span>
                          ))}
                          {(wrestler.championships ?? []).map((c) => (
                            <span key={c.value} className="bg-accent/20 text-accent-foreground px-2 py-0.5 rounded text-xs border border-accent/30">
                              {c.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => {
                            setEditWrestlerName(wrestler.name);
                            setEditWrestlerImage(null);
                            setEditWrestlerPromotions(promotionRefsToOptions(wrestler.promotions ?? []));
                            setEditWrestlerFactions((wrestler.factions ?? []).map(f => ({
                              value: f.id,
                              label: f.name
                            })));
                            setEditWrestlerChampionships(wrestler.championships ?? []);
                            setEditWrestlerId(wrestler.id);
                            setEditWrestlerOpen(true);
                          }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive"
                          onClick={() => {
                            setDeleteWrestlerId(wrestler.id);
                            setDeleteEntityType("Wrestler");
                            setDeleteEntityName(wrestler.name);
                            setDeleteDialogOpen(true);
                          }}>
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="promotions">
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:gap-6">
              <div className="flex-1">
                <Input placeholder="Search promotions by name..." className="w-full" />
              </div>
            </div>
            <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
              <DialogTrigger asChild>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setPromoOpen(true)}>
                    Create New
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Promotion</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full" onSubmit={handleCreatePromotion}>
                  <PromotionImageDropzone value={promoImage} onChange={setPromoImage} />
                  <Input
                    placeholder="Name"
                    className="w-full"
                    value={newPromotionName}
                    onChange={e => setNewPromotionName(e.target.value)}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPromoOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createPromotionLoading}>
                      {createPromotionLoading ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {promotionsLoading && (
              <div className="text-center text-muted-foreground py-12">Loading promotions...</div>
            )}
            {promotionsError && (
              <div className="text-center text-destructive py-4">{promotionsError}</div>
            )}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {promotionsList.map((promo) => (
                <Card key={promo.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src={promo.image_url || "https://placehold.co/80x80/png"}
                      alt={promo.name}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <CardTitle>{promo.name}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        {promo.wrestler_count ?? 0} wrestler{(promo.wrestler_count ?? 0) === 1 ? "" : "s"} associated
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"
                        onClick={() => {
                          setEditPromoName(promo.name);
                          setEditPromoImage(null);
                          setEditPromotionId(promo.id);
                          setEditPromoOpen(true);
                        }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive"
                        onClick={() => {
                          setDeletePromotionId(promo.id);
                          setDeleteEntityType("Promotion");
                          setDeleteEntityName(promo.name);
                          setDeleteDialogOpen(true);
                        }}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Edit Promotion Modal */}
            <Dialog open={editPromoOpen} onOpenChange={setEditPromoOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Promotion</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full" onSubmit={handleEditPromotion}>
                  <PromotionImageDropzone value={editPromoImage} onChange={setEditPromoImage} />
                  <Input
                    placeholder="Name"
                    className="w-full"
                    value={editPromoName}
                    onChange={e => setEditPromoName(e.target.value)}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditPromoOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={editPromotionLoading}>
                      {editPromotionLoading ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="factions">
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:gap-6">
              <div className="flex-1">
                <Input 
                  placeholder="Search factions by name..." 
                  className="w-full" 
                  value={factionSearch}
                  onChange={(e) => setFactionSearch(e.target.value)}
                />
              </div>
            </div>
            <Dialog open={factionOpen} onOpenChange={setFactionOpen}>
              <DialogTrigger asChild>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setFactionOpen(true)}>
                    Create New
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Faction</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full" onSubmit={handleCreateFaction}>
                  <PromotionImageDropzone value={factionImage} onChange={setFactionImage} />
                  <Input
                    placeholder="Name"
                    className="w-full"
                    value={newFactionName}
                    onChange={e => setNewFactionName(e.target.value)}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setFactionOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createFactionLoading}>
                      {createFactionLoading ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {factionsLoading && (
              <div className="text-center text-muted-foreground py-12">Loading factions...</div>
            )}
            {factionsError && (
              <div className="text-center text-destructive py-4">{factionsError}</div>
            )}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {factionsList
                .filter(faction => 
                  faction.name.toLowerCase().includes(factionSearch.trim().toLowerCase())
                )
                .map((faction) => (
                  <Card key={faction.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <img
                        src={faction.image_url || "https://placehold.co/80x80/png"}
                        alt={faction.name}
                        className="w-20 h-20 rounded-full object-cover border"
                      />
                      <div>
                        <CardTitle>{faction.name}</CardTitle>
                        <div className="text-xs text-muted-foreground mt-1">
                          {faction.wrestler_count ?? 0} wrestler{(faction.wrestler_count ?? 0) === 1 ? "" : "s"} associated
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => {
                            setEditFactionName(faction.name);
                            setEditFactionImage(null);
                            setEditFactionId(faction.id);
                            setEditFactionOpen(true);
                          }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive"
                          onClick={() => {
                            setDeleteFactionId(faction.id);
                            setDeleteEntityType("Faction");
                            setDeleteEntityName(faction.name);
                            setDeleteDialogOpen(true);
                          }}>
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            {/* Edit Faction Modal */}
            <Dialog open={editFactionOpen} onOpenChange={setEditFactionOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Faction</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full" onSubmit={handleEditFaction}>
                  <PromotionImageDropzone value={editFactionImage} onChange={setEditFactionImage} />
                  <Input
                    placeholder="Name"
                    className="w-full"
                    value={editFactionName}
                    onChange={e => setEditFactionName(e.target.value)}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditFactionOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={editFactionLoading}>
                      {editFactionLoading ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="championships">
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:gap-6">
              <div className="flex-1">
                <Input placeholder="Search championships by name..." className="w-full" />
              </div>
            </div>
            <Dialog open={champOpen} onOpenChange={setChampOpen}>
              <DialogTrigger asChild>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setChampOpen(true)}>
                    Create New
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Championship</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full">
                  <PromotionImageDropzone value={champImage} onChange={setChampImage} />
                  <Input placeholder="Name" className="w-full" value={champName} onChange={e => setChampName(e.target.value)} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setChampOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {mockChampionships.map((champ) => (
                <Card key={champ.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src={champ.image}
                      alt={champ.name}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <CardTitle>{champ.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"
                        onClick={() => {
                          setEditChampName(champ.name);
                          setEditChampImage(null);
                          setEditChampOpen(true);
                        }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive"
                        onClick={() => {
                          setDeleteEntityType("Championship");
                          setDeleteEntityName(champ.name);
                          setDeleteDialogOpen(true);
                        }}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Edit Championship Modal */}
            <Dialog open={editChampOpen} onOpenChange={setEditChampOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Championship</DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-4 mt-2 w-full">
                  <PromotionImageDropzone value={editChampImage} onChange={setEditChampImage} />
                  <Input placeholder="Name" className="w-full" value={editChampName} onChange={e => setEditChampName(e.target.value)} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditChampOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
      {/* Global Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteEntityType}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteEntityName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Wrestler Modal */}
      <Dialog open={editWrestlerOpen} onOpenChange={setEditWrestlerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Wrestler</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4 mt-2 w-full" onSubmit={handleEditWrestler}>
            <WrestlerImageDropzone value={editWrestlerImage} onChange={setEditWrestlerImage} />
            <Input
              placeholder="Name"
              className="w-full"
              value={editWrestlerName}
              onChange={e => setEditWrestlerName(e.target.value)}
            />
            <label className="text-sm font-medium mb-1">Promotion(s)</label>
            <ClientCreatableSelect
              isMulti
              styles={selectStyles}
              classNamePrefix="react-select"
              placeholder="Select or create a promotion..."
              value={editWrestlerPromotions}
              onChange={(newValue) => {
                setEditWrestlerPromotions(newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []);
              }}
              options={promotionsList.map(p => ({ value: p.id, label: p.name }))}
              onCreateOption={handleEditCreatePromotionOption}
            />
            <label className="text-sm font-medium mb-1">Faction(s)</label>
            <div className="flex flex-col gap-2">
              <ClientCreatableSelect
                isMulti
                styles={selectStyles}
                classNamePrefix="react-select"
                placeholder=""
                value={editWrestlerFactions}
                onChange={(newValue) => {
                  setEditWrestlerFactions(newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []);
                }}
                options={factionsList.map(factionToOption)}
                isClearable
                onCreateOption={handleEditCreateFactionOption}
              />
            </div>
            <label className="text-sm font-medium mb-1">Championship(s)</label>
            <ClientCreatableSelect
              isMulti
              styles={selectStyles}
              classNamePrefix="react-select"
              placeholder="Championships"
              value={editWrestlerChampionships}
              onChange={(newValue) => {
                setEditWrestlerChampionships(newValue ? (Array.isArray(newValue) ? newValue : [newValue]) : []);
              }}
              options={[
                { value: "world", label: "World Championship" },
                { value: "tag", label: "Tag Team Championship" },
                { value: "intercontinental", label: "Intercontinental" },
              ]}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditWrestlerOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
