import React, { useState } from "react";
import { 
  useListSongs, 
  getListSongsQueryKey,
  useCreateSong,
  useUpdateSong
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Music, Disc3, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Catalog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: songs, isLoading } = useListSongs({ query: { queryKey: getListSongsQueryKey() } });
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createSong.mutate({ data: { title: newTitle, genre: newGenre } }, {
      onSuccess: () => {
        toast({ title: "Song added successfully" });
        setIsAddOpen(false);
        setNewTitle("");
        setNewGenre("");
        queryClient.invalidateQueries({ queryKey: getListSongsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to add song", variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
      case "pending_cosota": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20";
      case "suspended": return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
      default: return "bg-muted text-muted-foreground hover:bg-muted/80 border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_cosota": return "Pending COSOTA";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage your releases and COSOTA registrations.</p>
        </header>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Song
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Song</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title</Label>
                <Input 
                  id="title" 
                  required 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Bongo Flava Hit" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre (Optional)</Label>
                <Input 
                  id="genre" 
                  value={newGenre}
                  onChange={e => setNewGenre(e.target.value)}
                  placeholder="e.g. Afrobeats" 
                />
              </div>
              <Button type="submit" className="w-full" disabled={createSong.isPending}>
                {createSong.isPending ? "Adding..." : "Add to Catalog"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : songs?.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-xl bg-card/50">
            <Disc3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No songs yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Add your first track to start tracking streams and royalties.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {songs?.map(song => (
              <Card key={song.id} className="overflow-hidden hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-md bg-accent flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{song.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="truncate">{song.genre || "No Genre"}</span>
                        <span>•</span>
                        <span>ISRC: {song.isrc || "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:w-auto w-full justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium">{song.totalStreams.toLocaleString()} streams</div>
                        <div className="text-sm text-primary font-bold">${song.totalRoyaltiesUsd.toFixed(2)}</div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="outline" className={getStatusColor(song.status)}>
                          {getStatusLabel(song.status)}
                        </Badge>
                        {song.cosotaRef && (
                          <span className="text-xs text-muted-foreground font-mono">{song.cosotaRef}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
