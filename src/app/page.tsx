import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Home() {
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
            <div className="text-center text-muted-foreground py-12">Wrestlers tab content goes here.</div>
          </TabsContent>
          <TabsContent value="promotions">
            <div className="text-center text-muted-foreground py-12">Promotions tab content goes here.</div>
          </TabsContent>
          <TabsContent value="factions">
            <div className="text-center text-muted-foreground py-12">Factions tab content goes here.</div>
          </TabsContent>
          <TabsContent value="championships">
            <div className="text-center text-muted-foreground py-12">Championships tab content goes here.</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
