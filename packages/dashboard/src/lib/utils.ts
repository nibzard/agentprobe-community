import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export function formatCost(value: number): string {
  if (value === 0) {
    return '$0.00'
  }
  if (value < 0.01) {
    return '<$0.01'
  }
  return `$${value.toFixed(3)}`
}

export function formatDurationRange(median: number, p95: number): string {
  const medianStr = formatDuration(median);
  const p95Str = formatDuration(p95);
  if (median === p95) {
    return medianStr;
  }
  return `${medianStr} (typ) • ${p95Str} (95%)`;
}

export function formatDurationWithP95(median: number, p95: number): string {
  return `${formatDuration(median)} median • ${formatDuration(p95)} P95`;
}