import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  TrendingUp, 
  Download, 
  Package, 
  Clock,
  Quote,
  ThumbsUp
} from 'lucide-react';
import type { MerchantAnalysis, ProductWithMerchants } from '@shared/schema';

interface MerchantAnalysisProps {
  productId: number | null;
}

export default function MerchantAnalysis({ productId }: MerchantAnalysisProps) {
  const { data: merchantData, isLoading: merchantsLoading } = useQuery({
    queryKey: ['/api/products', productId, 'merchants'],
    enabled: !!productId,
  });

  const { data: reviewData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/products', productId, 'reviews'],
    enabled: !!productId,
  });

  const { data: productData } = useQuery({
    queryKey: ['/api/products'],
  });

  const selectedProduct = productData?.products?.find((p: ProductWithMerchants) => p.id === productId);

  if (!productId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Product Selected</h3>
            <p className="text-sm">Select a product to view merchant analysis and reviews.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Merchants Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Selected Product</span>
                <Badge variant="secondary" className="text-xs">Live Analysis</Badge>
              </div>
              <p className="text-sm text-blue-700 line-clamp-2">{selectedProduct.title}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {merchantData?.merchants?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Merchants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.min(merchantData?.merchants?.length || 0, 20)}
              </div>
              <div className="text-sm text-gray-600">Analyzed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Merchants List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Top 20 Merchants</CardTitle>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {merchantsLoading ? (
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : merchantData?.merchants?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No merchant data available</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto custom-scrollbar">
              {merchantData?.merchants?.slice(0, 20).map((analysis: MerchantAnalysis, index: number) => (
                <MerchantCard key={analysis.merchant.id} analysis={analysis} rank={index + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : reviewData?.summary ? (
            <ReviewSummary summary={reviewData.summary} />
          ) : (
            <div className="text-center text-gray-500">
              <Quote className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No review data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MerchantCardProps {
  analysis: MerchantAnalysis;
  rank: number;
}

function MerchantCard({ analysis, rank }: MerchantCardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-primary text-white';
    if (rank === 2) return 'bg-gray-500 text-white';
    if (rank === 3) return 'bg-amber-500 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(rank)}`}>
            {rank}
          </div>
          <div>
            <div className="font-medium text-gray-900">{analysis.merchant.name}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <span>{analysis.productRating.toFixed(1)}</span>
              <span className="mx-2">•</span>
              <span>{analysis.productOrders} orders</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-green-600">${analysis.productPrice}</div>
          <div className="text-xs text-gray-600 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {analysis.shippingDuration}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewSummaryProps {
  summary: any;
}

function ReviewSummary({ summary }: ReviewSummaryProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-800';
      case 'negative': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500 text-white';
      case 'negative': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      <div className={`border rounded-lg p-4 ${getSentimentColor(summary.sentiment)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Sentiment</span>
          <Badge className={`text-xs ${getSentimentBadge(summary.sentiment)}`}>
            {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}
          </Badge>
        </div>
        <div className="text-sm opacity-80 flex items-start">
          <Quote className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>
            {summary.sentiment === 'positive' 
              ? "Great quality, comfortable fabric, accurate sizing"
              : summary.sentiment === 'negative'
              ? "Some concerns about quality and shipping times"
              : "Mixed reviews with average satisfaction"
            }
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Positive Reviews</span>
          <span className="font-medium text-green-600">{Math.round(summary.positivePercentage)}%</span>
        </div>
        <Progress value={summary.positivePercentage} className="h-2" />
      </div>

      <div className="text-sm text-gray-600">
        <div className="font-medium mb-2 flex items-center">
          <ThumbsUp className="w-4 h-4 mr-1" />
          Common Keywords:
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.commonKeywords?.slice(0, 6).map((keyword: string) => (
            <Badge key={keyword} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2">
        Based on {summary.totalReviews} reviews • Avg. rating: {summary.averageRating?.toFixed(1) || 'N/A'}
      </div>
    </div>
  );
}
