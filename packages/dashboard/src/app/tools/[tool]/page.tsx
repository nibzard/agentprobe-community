import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grade, PerformanceIndicator } from '@/components/ui/grade';
import { ExportButton } from '@/components/dashboard/export-button';
import { formatPercentage, formatNumber, formatDuration, formatCost } from '@/lib/utils';
import { calculateGrade } from '@/lib/grades';
import { Activity, Target, Clock, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ToolPageClient } from './tool-page-client';

interface ToolPageProps {
  params: Promise<{
    tool: string;
  }>;
}

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, we'll generate params for common tools
  // In production, these routes will be handled client-side
  return [
    { tool: 'git' },
    { tool: 'npm' },
    { tool: 'docker' },
    { tool: 'kubectl' },
    { tool: 'aws' },
  ];
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { tool } = await params;
  const toolName = decodeURIComponent(tool);
  
  return <ToolPageClient toolName={toolName} />;
}