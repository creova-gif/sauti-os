import React, { useState } from "react";
import { 
  useListEvents, 
  getListEventsQueryKey,
  useCreateEvent,
  useSellTicket
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users, Ticket, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Events() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: events, isLoading } = useListEvents({ query: { queryKey: getListEventsQueryKey() } });
  const createEvent = useCreateEvent();
  const sellTicket = useSellTicket();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    venue: "",
    country: "Tanzania",
    eventDate: "",
    capacity: "",
    ticketPriceUsd: ""
  });

  const [ticketModalEvent, setTicketModalEvent] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    buyerName: "",
    buyerPhone: "",
    quantity: "1"
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = parseInt(newEvent.capacity);
    const priceNum = parseFloat(newEvent.ticketPriceUsd);

    createEvent.mutate({ 
      data: { 
        ...newEvent,
        capacity: isNaN(capacityNum) ? 0 : capacityNum,
        ticketPriceUsd: isNaN(priceNum) ? undefined : priceNum
      } 
    }, {
      onSuccess: () => {
        toast({ title: "Event created successfully" });
        setIsAddOpen(false);
        setNewEvent({ name: "", venue: "", country: "Tanzania", eventDate: "", capacity: "", ticketPriceUsd: "" });
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to create event", variant: "destructive" });
      }
    });
  };

  const handleSellTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketModalEvent) return;

    sellTicket.mutate({
      data: {
        eventId: ticketModalEvent,
        buyerName: ticketForm.buyerName,
        buyerPhone: ticketForm.buyerPhone,
        quantity: parseInt(ticketForm.quantity) || 1,
        paymentMethod: "mpesa"
      }
    }, {
      onSuccess: () => {
        toast({ title: "Ticket sold successfully!" });
        setTicketModalEvent(null);
        setTicketForm({ buyerName: "", buyerPhone: "", quantity: "1" });
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to sell ticket", variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_sale": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "sold_out": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Manage shows and ticket sales.</p>
        </header>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                  placeholder="e.g. Dar es Salaam Live" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time</Label>
                  <Input 
                    id="date" 
                    type="datetime-local"
                    required
                    value={newEvent.eventDate}
                    onChange={e => setNewEvent({...newEvent, eventDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input 
                    id="venue" 
                    required
                    value={newEvent.venue}
                    onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input 
                    id="capacity" 
                    type="number"
                    required
                    value={newEvent.capacity}
                    onChange={e => setNewEvent({...newEvent, capacity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price (USD)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    step="0.01"
                    required
                    value={newEvent.ticketPriceUsd}
                    onChange={e => setNewEvent({...newEvent, ticketPriceUsd: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Creating..." : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
        ) : events?.length === 0 ? (
          <div className="col-span-full text-center py-16 border border-dashed rounded-xl bg-card/50">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No upcoming events</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Schedule your next show to start selling tickets.</p>
          </div>
        ) : (
          events?.map(event => {
            const isSoldOut = event.ticketsSold >= event.capacity;
            const progress = (event.ticketsSold / event.capacity) * 100;
            
            return (
              <Card key={event.id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1 text-primary">{event.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.venue}, {event.country}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                    <div className="font-bold text-lg">
                      ${event.ticketPriceUsd?.toFixed(2) || "Free"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Ticket className="w-4 h-4" /> Tickets Sold
                      </span>
                      <span className="font-medium">{event.ticketsSold} / {event.capacity}</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isSoldOut ? 'bg-primary' : 'bg-secondary'}`} 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border bg-card/50">
                  <Dialog open={ticketModalEvent === event.id} onOpenChange={(open) => !open && setTicketModalEvent(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant={isSoldOut ? "outline" : "default"} 
                        className="w-full"
                        disabled={isSoldOut || event.status !== 'on_sale'}
                        onClick={() => setTicketModalEvent(event.id)}
                      >
                        {isSoldOut ? "Sold Out" : "Sell Ticket"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sell Ticket - {event.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSellTicket} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="buyerName">Buyer Name</Label>
                          <Input 
                            id="buyerName" 
                            required 
                            value={ticketForm.buyerName}
                            onChange={e => setTicketForm({...ticketForm, buyerName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buyerPhone">Phone Number</Label>
                          <Input 
                            id="buyerPhone" 
                            required 
                            value={ticketForm.buyerPhone}
                            onChange={e => setTicketForm({...ticketForm, buyerPhone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input 
                            id="quantity" 
                            type="number"
                            min="1"
                            max={event.capacity - event.ticketsSold}
                            required 
                            value={ticketForm.quantity}
                            onChange={e => setTicketForm({...ticketForm, quantity: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={sellTicket.isPending}>
                          {sellTicket.isPending ? "Processing..." : `Process Payment ($${(event.ticketPriceUsd || 0) * parseInt(ticketForm.quantity || "1")})`}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
