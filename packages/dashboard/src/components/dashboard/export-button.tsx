'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { ExternalLink, Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  format?: 'csv' | 'json';
  filters?: any;
  filename?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({ 
  format = 'csv', 
  filters, 
  filename,
  variant = 'outline',
  size = 'default'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const exportData = await apiClient.exportData(format, filters);
      
      // Create and download file
      const blob = new Blob([exportData.content], {
        type: exportData.content_type,
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `agentprobe-export-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // In a real app, you'd show a toast notification
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export {format.toUpperCase()}
    </Button>
  );
}