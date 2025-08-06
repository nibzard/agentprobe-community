import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grade, PerformanceIndicator } from '@/components/ui/grade';
import { QuickComparison } from '@/components/dashboard/community-comparison';
import { formatDuration, formatPercentage, formatCost } from '@/lib/utils';
import { calculateGrade } from '@/lib/grades';
import { 
  ArrowLeft, 
  Clock, 
  Activity, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Code2,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResultDetailClient } from './result-detail-client';

interface ResultDetailProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, we'll generate params for some sample IDs
  // In production, these routes will be handled client-side
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default async function ResultDetailPage({ params }: ResultDetailProps) {
  const { id: resultId } = await params;
  
  return <ResultDetailClient resultId={resultId} />;
}