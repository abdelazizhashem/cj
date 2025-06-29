import { useState } from 'react';
import SearchInterface from '@/components/search-interface';
import ProductResults from '@/components/product-results';
import MerchantAnalysis from '@/components/merchant-analysis';
import ProgressIndicator from '@/components/progress-indicator';
import ExportModal from '@/components/export-modal';
import { Button } from '@/components/ui/button';
import { useSearchData } from '@/hooks/use-scraping';
import { TrendingUp, Download, HelpCircle, Globe } from 'lucide-react';

export default function Home() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const { searchQuery, isSearching, sessionId } = useSearchData();

  const handleProductSelect = (productId: number) => {
    setSelectedProductId(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CJ Intelligence</h1>
                <p className="text-sm text-gray-500">Product & Merchant Analysis Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => setShowExportModal(true)}
                className="bg-primary text-white hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Search & Analysis</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="w-4 h-4 text-accent" />
              <span>Connected to CJ Dropshipping</span>
            </div>
          </div>
          
          <SearchInterface />
        </div>

        {/* Progress Indicator */}
        {isSearching && sessionId && (
          <ProgressIndicator sessionId={sessionId} />
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Product Results */}
          <div className="xl:col-span-2">
            <ProductResults 
              searchQuery={searchQuery}
              onProductSelect={handleProductSelect}
            />
          </div>

          {/* Merchant Analysis Sidebar */}
          <div>
            <MerchantAnalysis 
              productId={selectedProductId}
            />
          </div>
        </div>

        {/* Export Modal */}
        <ExportModal 
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          searchQuery={searchQuery}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2024 CJ Intelligence Tool. Built for analyzing CJ Dropshipping marketplace data.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
