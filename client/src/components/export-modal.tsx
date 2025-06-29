import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
}

interface ExportOptions {
  includeProducts: boolean;
  includeMerchants: boolean;
  includeReviews: boolean;
  includePriceHistory: boolean;
  format: string;
}

export default function ExportModal({ isOpen, onClose, searchQuery }: ExportModalProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    includeProducts: true,
    includeMerchants: true,
    includeReviews: true,
    includePriceHistory: false,
    format: 'json',
  });

  const exportMutation = useMutation({
    mutationFn: async (exportOptions: ExportOptions) => {
      const response = await apiRequest('POST', '/api/export', {
        query: searchQuery,
        ...exportOptions,
      });
      
      // Handle file download
      const contentType = response.headers.get('content-type');
      const disposition = response.headers.get('content-disposition');
      
      let filename = `cj-analysis-${searchQuery || 'all'}-${Date.now()}`;
      if (disposition) {
        const filenameMatch = disposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Your data has been exported and downloaded.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    exportMutation.mutate(options);
  };

  const updateOption = (key: keyof ExportOptions, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Export Analysis Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Data to Include</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={options.includeProducts}
                  onCheckedChange={(checked) => updateOption('includeProducts', !!checked)}
                />
                <Label className="text-sm font-normal">Product Information</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={options.includeMerchants}
                  onCheckedChange={(checked) => updateOption('includeMerchants', !!checked)}
                />
                <Label className="text-sm font-normal">Top 20 Merchants Data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={options.includeReviews}
                  onCheckedChange={(checked) => updateOption('includeReviews', !!checked)}
                />
                <Label className="text-sm font-normal">Review Analysis Summary</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={options.includePriceHistory}
                  onCheckedChange={(checked) => updateOption('includePriceHistory', !!checked)}
                />
                <Label className="text-sm font-normal">Pricing History</Label>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Export Format</Label>
            <Select 
              value={options.format} 
              onValueChange={(value) => updateOption('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="csv">Excel/CSV (.csv)</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Query Info */}
          {searchQuery && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Search Query:</strong> {searchQuery}
              </p>
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2">Export will include:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              {options.includeProducts && <li>• Product details and metrics</li>}
              {options.includeMerchants && <li>• Top 20 merchant analysis</li>}
              {options.includeReviews && <li>• Customer review summaries</li>}
              {options.includePriceHistory && <li>• Historical pricing data</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={exportMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exportMutation.isPending}
            className="bg-primary hover:bg-blue-700"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
