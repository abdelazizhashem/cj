import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { searchQuerySchema, type SearchQuery } from '@shared/schema';
import { useSearchData } from '@/hooks/use-scraping';

const quickSearchSuggestions = ['caps', 'hoodies', 'phone accessories', 'كابات'];

export default function SearchInterface() {
  const { toast } = useToast();
  const { setSearchQuery, setSessionId } = useSearchData();
  
  const form = useForm<SearchQuery>({
    resolver: zodResolver(searchQuerySchema),
    defaultValues: {
      query: '',
      includeReviews: true,
      includeMerchantAnalysis: true,
      includePriceTracking: false,
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: SearchQuery) => {
      const response = await apiRequest('POST', '/api/search', data);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchQuery(form.getValues('query'));
      setSessionId(data.sessionId);
      toast({
        title: "Search Started",
        description: "Analyzing CJ Dropshipping products. Results will appear shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchQuery) => {
    searchMutation.mutate(data);
  };

  const handleQuickSearch = (query: string) => {
    form.setValue('query', query);
    onSubmit({ ...form.getValues(), query });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Search Products
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Enter product keywords (e.g., cap, كاب, hat, قبعة)..."
                        className="pl-12 pr-20 py-3 text-base"
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Button
                        type="submit"
                        disabled={searchMutation.isPending}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-blue-700 text-white px-4 py-1.5 text-sm"
                      >
                        {searchMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="w-3 h-3 mr-1" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Analysis Options */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Analysis Options
            </Label>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="includeMerchantAnalysis"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label className="text-sm text-gray-700 font-normal">
                      Top 20 Merchants Analysis
                    </Label>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="includeReviews"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label className="text-sm text-gray-700 font-normal">
                      Customer Review Analysis
                    </Label>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="includePriceTracking"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label className="text-sm text-gray-700 font-normal">
                      Price Tracking
                    </Label>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Quick search:</span>
          {quickSearchSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              className="px-3 py-1 text-sm"
              onClick={() => handleQuickSearch(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </form>
    </Form>
  );
}
