import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardLayout } from '@/components/dashboard/layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentProbe Community Dashboard',
  description: 'Community statistics and insights for CLI tool testing results',
  keywords: ['agentprobe', 'cli', 'testing', 'community', 'statistics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}