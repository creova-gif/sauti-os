import React from "react";
import { 
  useGetDashboardSummary, 
  getGetDashboardSummaryQueryKey,
  useGetEarningsChart,
  getGetEarningsChartQueryKey,
  useGetPlatformBreakdown,
  getGetPlatformBreakdownQueryKey,
  useListAirplay,
  getListAirplayQueryKey,
  useClaimAirplay
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, DollarSign, Radio, FileText, CheckCircle2, Tv } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });
  
  const { data: chartData, isLoading: isLoadingChart } = useGetEarningsChart({
    query: { queryKey: getGetEarningsChartQueryKey() }
  });

  const { data: platformData, isLoading: isLoadingPlatforms } = useGetPlatformBreakdown({
    query: { queryKey: getGetPlatformBreakdownQueryKey() }
  });

  const { data: airplay, isLoading: isLoadingAirplay } = useListAirplay({
    query: { queryKey: getListAirplayQueryKey() }
  });

  const claimAirplay = useClaimAirplay();

  const handleClaim = (id: string) => {
    claimAirplay.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Airplay claimed successfully!" });
        queryClient.invalidateQueries({ queryKey: getListAirplayQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to claim airplay", variant: "destructive" });
      }
    });
  };

  const isLoading = isLoadingSummary || isLoadingChart || isLoadingPlatforms || isLoadingAirplay;

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const unclaimedAirplay = airplay?.filter(a => !a.claimed) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Your music business at a glance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Streams</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalStreams.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Earnings This Month</CardTitle>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${summary.totalEarningsThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From streaming & royalties</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.activeContracts}</div>
            <p className="text-xs text-muted-foreground mt-1">${summary.pendingContractValue.toLocaleString()} in pending value</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">COSOTA Pending</CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.pendingCosotaCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Songs awaiting registration</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-card">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Monthly earnings over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full pt-4">
            {chartData && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="earned" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEarned)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Top platforms by streams</CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full pb-4">
            {platformData && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="streams"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Airplay Detections
            {summary.uncollectedAirplay > 0 && (
              <Badge className="bg-primary text-primary-foreground ml-2">
                {summary.uncollectedAirplay} Unclaimed
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Recent radio and TV plays across East Africa.</CardDescription>
        </CardHeader>
        <CardContent>
          {unclaimedAirplay.length === 0 ? (
            <div className="py-8 text-center">
              <Radio className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">All recent airplay has been claimed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unclaimedAirplay.slice(0, 5).map(play => (
                <div key={play.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                      {play.stationType === 'tv' ? <Tv className="w-5 h-5 text-secondary" /> : <Radio className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{play.songTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {play.stationName} • {play.country} • {new Date(play.detectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleClaim(play.id)}
                    disabled={claimAirplay.isPending}
                  >
                    Claim Play
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
