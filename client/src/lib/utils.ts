import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number | null | undefined): string {
  if (!price) return '$0.00';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatNumber(num: number | null | undefined): string {
  if (!num) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function generateExportFilename(query: string, format: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const sanitizedQuery = query.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `cj_analysis_${sanitizedQuery}_${timestamp}.${format}`;
}

export function validateSearchQuery(query: string): { isValid: boolean; error?: string } {
  if (!query.trim()) {
    return { isValid: false, error: 'Search query cannot be empty' };
  }
  
  if (query.trim().length < 2) {
    return { isValid: false, error: 'Search query must be at least 2 characters long' };
  }
  
  if (query.length > 100) {
    return { isValid: false, error: 'Search query must be less than 100 characters' };
  }
  
  return { isValid: true };
}

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'
  ]);
  
  return words.filter(word => !stopWords.has(word));
}

export function calculateSentimentScore(text: string): { score: number; sentiment: 'positive' | 'negative' | 'neutral' } {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'best'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  const score = positiveCount - negativeCount;
  
  if (score > 0) return { score, sentiment: 'positive' };
  if (score < 0) return { score, sentiment: 'negative' };
  return { score, sentiment: 'neutral' };
}
