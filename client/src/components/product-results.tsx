import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, List, DollarSign, Store, BarChart3 } from 'lucide-react';
import type { ProductWithMerchants } from '@shared/schema';

interface ProductResultsProps {
  searchQuery?: string;
  onProductSelect: (productId: number) => void;
}

export default function ProductResults({ searchQuery, onProductSelect }: ProductResultsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/products', searchQuery],
    queryFn: () =>
      apiRequest('GET', `/api/products?query=${encodeURIComponent(searchQuery ?? '')}`)
        .then(res => res.json()),
    enabled: !!searchQuery,
  });

  if (!searchQuery) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Search Performed</h3>
          <p className="text-sm">Enter a search query to start analyzing CJ Dropshipping products.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 text-center text-red-600">
          <h3 className="text-lg font-medium mb-2">Search Failed</h3>
          <p className="text-sm">Unable to fetch products. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Product Results</h3>
          <div className="flex items-center space-x-4">
            {data?.products && (
              <span className="text-sm text-gray-600">
                <span className="font-medium">{data.products.length}</span> products found
              </span>
            )}
            <Select defaultValue="popularity">
              <SelectTrigger className="w-40 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Sort by Popularity</SelectItem>
                <SelectItem value="price">Sort by Price</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <h4 className="text-lg font-medium mb-2">No Products Found</h4>
            <p className="text-sm">Try different keywords or check your search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.products?.map((product: ProductWithMerchants) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => onProductSelect(product.id)}
              />
            ))}
            
            {/* Load More Button */}
            <div className="text-center mt-6">
              <Button variant="outline" className="px-6 py-3">
                Load More Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: ProductWithMerchants;
  onSelect: () => void;
}

function ProductCard({ product, onSelect }: ProductCardProps) {
  const priceRange = product.priceMin !== product.priceMax 
    ? `$${product.priceMin} - $${product.priceMax}`
    : `$${product.priceMin}`;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <img
          src={product.imageUrl || '/api/placeholder/150/150'}
          alt={product.title}
          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.title}
          </h4>
          
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center">
              <List className="w-4 h-4 text-primary mr-1" />
              <span className="font-medium">{product.orderCount || 0}</span>
              <span className="text-gray-600 ml-1">orders</span>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
              <span className="font-bold text-green-600">{priceRange}</span>
            </div>
            
            {product.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span>{product.rating}</span>
                <span className="text-gray-600 ml-1">rating</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Store className="w-4 h-4 mr-1" />
              <span>{product.merchants?.length || 0} merchants available</span>
            </div>
            
            <Button 
              onClick={onSelect}
              className="bg-primary hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Analyze Merchants
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
