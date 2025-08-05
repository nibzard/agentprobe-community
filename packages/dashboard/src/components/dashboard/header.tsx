'use client';

import Link from 'next/link';
import { useHealth } from '@/hooks/use-api';
import { Activity, AlertCircle } from 'lucide-react';

export function Header() {
  const { data: health, isLoading, error } = useHealth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              AgentProbe Community
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Overview
            </Link>
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Leaderboard
            </Link>
            <Link
              href="/scenarios"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Scenarios
            </Link>
            <Link
              href="/insights"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Insights
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component can go here later */}
          </div>
          <nav className="flex items-center">
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : health?.status === 'healthy' ? (
                <div className="h-2 w-2 rounded-full bg-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isLoading 
                  ? 'Checking...' 
                  : error 
                    ? 'API Offline' 
                    : health?.status || 'Unknown'}
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}