import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import type { ScrapingSession } from '@shared/schema';

interface ProgressIndicatorProps {
  sessionId: number;
}

export default function ProgressIndicator({ sessionId }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting analysis...');

  const { data: session } = useQuery({
    queryKey: ['/api/sessions', sessionId],
    refetchInterval: 1000, // Poll every second
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (session?.session) {
      setProgress(session.session.progress || 0);
      
      // Update status based on progress
      const currentProgress = session.session.progress || 0;
      if (currentProgress < 20) {
        setStatus('Searching CJ Dropshipping...');
      } else if (currentProgress < 50) {
        setStatus(`Found ${session.session.totalProducts || 0} products`);
      } else if (currentProgress < 90) {
        setStatus(`Analyzing merchants: ${session.session.analyzedMerchants || 0}`);
      } else if (currentProgress >= 100) {
        setStatus('Analysis completed');
      }
    }

    // Set up WebSocket connection for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress' && data.sessionId === sessionId) {
          setProgress(data.progress);
          setStatus(data.status);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId, session]);

  if (!session?.session || session.session.status === 'completed') {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" />
            Analyzing CJ Dropshipping Data...
          </h3>
          <span className="text-sm text-gray-600 font-mono">{progress}%</span>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            {session?.session?.totalProducts ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
            )}
            <span className="text-gray-700">
              Products Scraped: <span className="font-mono font-medium">{session?.session?.totalProducts || 0}</span>
            </span>
          </div>
          
          <div className="flex items-center">
            {progress > 50 ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
            )}
            <span className="text-gray-700">
              Analyzing Merchants: <span className="font-mono font-medium">{session?.session?.analyzedMerchants || 0}</span>
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Status: <span className="font-medium">{status}</span></span>
          </div>
        </div>

        {session?.session?.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {session.session.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
