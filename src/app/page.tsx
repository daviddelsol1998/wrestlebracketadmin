"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import CreatableSelect from "react-select/creatable";
import type { MultiValue } from "react-select";

type OptionType = { value: string; label: string };

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

function FactionImageDropzone({ value, onChange }: { value?: File | null; onChange: (file: File | null) => void }) {
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

function ChampionshipImageDropzone({ value, onChange }: { value?: File | null; onChange: (file: File | null) => void }) {
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

export default function Home() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [promotions, setPromotions] = useState<OptionType[]>([]);
  const [factions, setFactions] = useState<OptionType[]>([]);
  const [championships, setChampionships] = useState<OptionType[]>([]);

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoImage, setPromoImage] = useState<File | null>(null);
  const [promoName, setPromoName] = useState("");

  const [factionOpen, setFactionOpen] = useState(false);
  const [factionImage, setFactionImage] = useState<File | null>(null);
  const [factionName, setFactionName] = useState("");

  const [champOpen, setChampOpen] = useState(false);
  const [champImage, setChampImage] = useState<File | null>(null);
  const [champName, setChampName] = useState("");

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
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:gap-6">
              <div className="flex-1">
                <Input placeholder="Search wrestlers by name..." className="w-full" />
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Promotions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wwe">WWE</SelectItem>
                    <SelectItem value="aew">AEW</SelectItem>
                    <SelectItem value="njpw">NJPW</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Factions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulletclub">Bullet Club</SelectItem>
                    <SelectItem value="bloodline">The Bloodline</SelectItem>
                    <SelectItem value="chaos">CHAOS</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Championships" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="world">World Championship</SelectItem>
                    <SelectItem value="tag">Tag Team Championship</SelectItem>
                    <SelectItem value="intercontinental">Intercontinental</SelectItem>
                  </SelectContent>
                </Select>
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
                <form className="flex flex-col gap-4 mt-2 w-full">
                  <Input placeholder="Name" className="w-full" />
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <CreatableSelect
                      isMulti
                      classNamePrefix="react-select"
                      placeholder="Promotions"
                      value={promotions}
                      onChange={(newValue: MultiValue<OptionType>) => setPromotions(newValue as OptionType[])}
                      options={[
                        { value: "wwe", label: "WWE" },
                        { value: "aew", label: "AEW" },
                        { value: "njpw", label: "NJPW" },
                      ]}
                      styles={{ container: (base) => ({ ...base, flex: 1, minWidth: 0 }), menu: (base) => ({ ...base, zIndex: 99999 }) }}
                    />
                    <CreatableSelect
                      isMulti
                      classNamePrefix="react-select"
                      placeholder="Factions"
                      value={factions}
                      onChange={(newValue: MultiValue<OptionType>) => setFactions(newValue as OptionType[])}
                      options={[
                        { value: "bulletclub", label: "Bullet Club" },
                        { value: "bloodline", label: "The Bloodline" },
                        { value: "chaos", label: "CHAOS" },
                      ]}
                      styles={{ container: (base) => ({ ...base, flex: 1, minWidth: 0 }), menu: (base) => ({ ...base, zIndex: 99999 }) }}
                    />
                    <CreatableSelect
                      isMulti
                      classNamePrefix="react-select"
                      placeholder="Championships"
                      value={championships}
                      onChange={(newValue: MultiValue<OptionType>) => setChampionships(newValue as OptionType[])}
                      options={[
                        { value: "world", label: "World Championship" },
                        { value: "tag", label: "Tag Team Championship" },
                        { value: "intercontinental", label: "Intercontinental" },
                      ]}
                      styles={{ container: (base) => ({ ...base, flex: 1, minWidth: 0 }), menu: (base) => ({ ...base, zIndex: 99999 }) }}
                    />
                  </div>
                  <WrestlerImageDropzone value={image} onChange={setImage} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock Wrestler Cards */}
              {[1,2,3].map((id) => (
                <Card key={id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src="https://placehold.co/80x80/png"
                      alt="Wrestler"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <CardTitle>Wrestler Name {id}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">WWE</span>
                        <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs">Bullet Club</span>
                        <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs">World Champ</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-sm">Short bio or associations here.</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center text-muted-foreground py-12">Wrestlers tab content goes here.</div>
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
                <form className="flex flex-col gap-4 mt-2 w-full">
                  <Input placeholder="Name" className="w-full" value={promoName} onChange={e => setPromoName(e.target.value)} />
                  <PromotionImageDropzone value={promoImage} onChange={setPromoImage} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPromoOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock Promotion Cards */}
              {[1,2,3].map((id) => (
                <Card key={id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src="https://placehold.co/80x80/png"
                      alt="Promotion"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <CardTitle>Promotion Name {id}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-sm">Short description or details here.</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center text-muted-foreground py-12">Promotions tab content goes here.</div>
          </TabsContent>
          <TabsContent value="factions">
            <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-end md:gap-6">
              <div className="flex-1">
                <Input placeholder="Search factions by name..." className="w-full" />
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
                <form className="flex flex-col gap-4 mt-2 w-full">
                  <Input placeholder="Name" className="w-full" value={factionName} onChange={e => setFactionName(e.target.value)} />
                  <FactionImageDropzone value={factionImage} onChange={setFactionImage} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setFactionOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock Faction Cards */}
              {[1,2,3].map((id) => (
                <Card key={id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src="https://placehold.co/80x80/png"
                      alt="Faction"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <CardTitle>Faction Name {id}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-sm">Short description or details here.</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center text-muted-foreground py-12">Factions tab content goes here.</div>
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
                  <Input placeholder="Name" className="w-full" value={champName} onChange={e => setChampName(e.target.value)} />
                  <ChampionshipImageDropzone value={champImage} onChange={setChampImage} />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setChampOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Mock Championship Cards */}
              {[1,2,3].map((id) => (
                <Card key={id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src="https://placehold.co/80x80/png"
                      alt="Championship"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <CardTitle>Championship Name {id}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground text-sm">Short description or details here.</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center text-muted-foreground py-12">Championships tab content goes here.</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
