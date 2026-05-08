import React from "react";
import { Link, useLocation } from "wouter";
import { useGetArtist, getGetArtistQueryKey } from "@workspace/api-client-react";
import { Music, LayoutDashboard, Wallet, FileText, Calendar, Disc3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: artist, isLoading } = useGetArtist({ query: { queryKey: getGetArtistQueryKey() } });

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/catalog", label: "Catalog", icon: Music },
    { href: "/royalties", label: "Royalties", icon: Wallet },
    { href: "/contracts", label: "Contracts", icon: FileText },
    { href: "/events", label: "Events", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 flex items-center gap-3">
          <Disc3 className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">SautiOS</span>
        </div>

        <div className="px-6 mb-8">
          {isLoading || !artist ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <div>
              <h2 className="font-semibold text-lg">{artist.stageName}</h2>
              <p className="text-sm text-muted-foreground">{artist.tier.toUpperCase()} Artist</p>
            </div>
          )}
        </div>

        <div className="px-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">WALLET BALANCE</p>
            {isLoading || !artist ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p className="text-2xl font-bold text-primary">${artist.walletBalanceUsd.toFixed(2)}</p>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="p-8 flex-1 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
