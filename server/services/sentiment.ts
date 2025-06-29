export function analyzeSentiment(text: string): string {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
    'love', 'perfect', 'best', 'happy', 'satisfied', 'quality', 'comfortable',
    'fast', 'quick', 'reliable', 'recommended', 'beautiful', 'nice'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointing',
    'poor', 'cheap', 'slow', 'delayed', 'wrong', 'broken', 'defective',
    'expensive', 'overpriced', 'thin', 'small', 'large', 'uncomfortable'
  ];
  
  const positiveScore = positiveWords.reduce((score, word) => {
    return score + (lowerText.includes(word) ? 1 : 0);
  }, 0);
  
  const negativeScore = negativeWords.reduce((score, word) => {
    return score + (lowerText.includes(word) ? 1 : 0);
  }, 0);
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'it', 'its'
  ]);
  
  const importantWords = [
    'quality', 'comfortable', 'fast', 'shipping', 'delivery', 'price', 'value',
    'material', 'fabric', 'size', 'fit', 'color', 'design', 'product',
    'good', 'great', 'excellent', 'perfect', 'love', 'recommend'
  ];
  
  const keywords = words.filter(word => 
    !stopWords.has(word) && 
    (word.length > 4 || importantWords.includes(word))
  );
  
  // Count frequency and return top keywords
  const wordCount = keywords.reduce((count, word) => {
    count[word] = (count[word] || 0) + 1;
    return count;
  }, {} as Record<string, number>);
  
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}
