import React, { useState } from "react";
import { 
  useListRoyalties, 
  getListRoyaltiesQueryKey,
  useCreateWithdrawal,
  useGetArtist,
  getGetArtistQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownRight, ArrowUpRight, Clock, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Royalties() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: royalties, isLoading } = useListRoyalties({ query: { queryKey: getListRoyaltiesQueryKey() } });
  const { data: artist } = useGetArtist({ query: { queryKey: getGetArtistQueryKey() } });
  const withdraw = useCreateWithdrawal();

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    
    withdraw.mutate({ data: { amountUsd: amountNum, mpesaNumber } }, {
      onSuccess: () => {
        toast({ title: "Withdrawal requested successfully" });
        setIsWithdrawOpen(false);
        setAmount("");
        setMpesaNumber("");
        queryClient.invalidateQueries({ queryKey: getListRoyaltiesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetArtistQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to request withdrawal", variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": 
      case "processing": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Royalties</h1>
          <p className="text-muted-foreground mt-1">Track earnings and withdraw funds.</p>
        </header>

        <Card className="bg-primary text-primary-foreground overflow-hidden relative min-w-[300px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium opacity-80 mb-1">Available Balance</p>
            <div className="text-4xl font-bold mb-4">
              ${artist?.walletBalanceUsd?.toFixed(2) || "0.00"}
            </div>
            
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full font-bold">
                  Withdraw to M-Pesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Transfer your earnings directly to your M-Pesa account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input 
                        id="amount" 
                        type="number"
                        step="0.01"
                        min="5"
                        required 
                        className="pl-8"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="e.g. 50.00" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum withdrawal: $5.00</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mpesa">M-Pesa Number</Label>
                    <Input 
                      id="mpesa" 
                      required 
                      value={mpesaNumber}
                      onChange={e => setMpesaNumber(e.target.value)}
                      placeholder="e.g. +255 700 000 000" 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={withdraw.isPending}>
                    {withdraw.isPending ? "Processing..." : "Confirm Withdrawal"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Transaction History</h3>
        
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : royalties?.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-xl bg-card/50">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No transactions yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Your royalty earnings will appear here once distributed.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {royalties?.map(tx => (
              <Card key={tx.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.transactionType === 'withdrawal' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                    }`}>
                      {tx.transactionType === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold capitalize">{tx.transactionType.replace('_', ' ')}</h4>
                        {tx.platform && <Badge variant="secondary" className="text-[10px] uppercase">{tx.platform}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {tx.description || tx.reference || "No description"}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${tx.transactionType === 'withdrawal' ? '' : 'text-green-500'}`}>
                        {tx.transactionType === 'withdrawal' ? '-' : '+'}${Math.abs(tx.netUsd).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(tx.createdAt)}
                      </div>
                    </div>
                    
                    <div className="w-24 flex justify-end">
                      <Badge variant="outline" className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
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
