import React, { useState } from "react";
import { 
  useListContracts, 
  getListContractsQueryKey,
  useCreateContract
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Plus, FileText, Briefcase, Handshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Contracts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: contracts, isLoading } = useListContracts({ query: { queryKey: getListContractsQueryKey() } });
  const createContract = useCreateContract();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<any>("performance");
  const [newCounterparty, setNewCounterparty] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseFloat(newValue);
    
    createContract.mutate({ 
      data: { 
        title: newTitle, 
        contractType: newType,
        counterparty: newCounterparty,
        valueUsd: isNaN(valueNum) ? undefined : valueNum,
        currency: "USD"
      } 
    }, {
      onSuccess: () => {
        toast({ title: "Contract created successfully" });
        setIsAddOpen(false);
        setNewTitle("");
        setNewCounterparty("");
        setNewValue("");
        queryClient.invalidateQueries({ queryKey: getListContractsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to create contract", variant: "destructive" });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending_signature": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "disputed": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "completed": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance": return <Briefcase className="w-5 h-5 text-primary" />;
      case "brand_deal": return <Handshake className="w-5 h-5 text-secondary" />;
      default: return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const totalValue = contracts?.reduce((sum, c) => sum + (c.valueUsd || 0), 0) || 0;
  const activeCount = contracts?.filter(c => c.status === 'active').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage performance, sync, and brand deals.</p>
        </header>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Contract Draft</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title</Label>
                <Input 
                  id="title" 
                  required 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Serengeti Festival 2024" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="brand_deal">Brand Deal</SelectItem>
                      <SelectItem value="sync_license">Sync License</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value (USD)</Label>
                  <Input 
                    id="value" 
                    type="number"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="e.g. 5000" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="counterparty">Counterparty</Label>
                <Input 
                  id="counterparty" 
                  required
                  value={newCounterparty}
                  onChange={e => setNewCounterparty(e.target.value)}
                  placeholder="e.g. LiveNation Africa" 
                />
              </div>
              <Button type="submit" className="w-full" disabled={createContract.isPending}>
                {createContract.isPending ? "Creating..." : "Create Draft"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : contracts?.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-xl bg-card/50">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No contracts found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Create a draft contract to manage your deals.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts?.map(contract => (
              <Card 
                key={contract.id} 
                className="overflow-hidden hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedContract(contract)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                      {getTypeIcon(contract.contractType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">{contract.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="truncate">{contract.counterparty}</span>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 mr-4 hidden sm:block">
                      {contract.valueUsd && (
                        <div className="font-bold text-lg">${contract.valueUsd.toLocaleString()}</div>
                      )}
                    </div>
                    
                    <Badge variant="outline" className={getStatusColor(contract.status)}>
                      {contract.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <SheetContent className="sm:max-w-md w-full">
          {selectedContract && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">{selectedContract.title}</SheetTitle>
                <SheetDescription>
                  <Badge variant="outline" className={`mt-2 ${getStatusColor(selectedContract.status)}`}>
                    {selectedContract.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Counterparty</h4>
                  <p className="text-lg">{selectedContract.counterparty}</p>
                </div>
                
                {selectedContract.valueUsd && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Value</h4>
                    <p className="text-2xl font-bold text-primary">${selectedContract.valueUsd.toLocaleString()}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                    <p className="capitalize">{selectedContract.contractType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Signed Date</h4>
                    <p>{selectedContract.signedDate ? new Date(selectedContract.signedDate).toLocaleDateString() : "Pending"}</p>
                  </div>
                </div>

                {selectedContract.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                    <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {selectedContract.notes}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
