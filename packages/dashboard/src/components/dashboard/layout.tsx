'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from './header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built for the AgentProbe community. Data updates in real-time.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a
                href="https://github.com/your-org/agentprobe-community"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href="/api/v1/export"
                className="hover:text-foreground"
              >
                API
              </a>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}