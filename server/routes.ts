import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scraper } from "./services/scraper";
import { searchQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Search and scrape products
  app.post("/api/search", async (req, res) => {
    try {
      const searchData = searchQuerySchema.parse(req.body);
      
      // Create scraping session
      const session = await storage.createScrapingSession({
        query: searchData.query,
        status: "pending",
        progress: 0,
      });

      // Start scraping in background
      const progressCallback = (progress: number, status: string) => {
        // Store progress in session for polling
        storage.updateScrapingSession(session.id, {
          progress,
          status: status,
        });
      };

      // Run scraping asynchronously
      scraper.scrapeProducts(searchData.query, {
        sessionId: session.id,
        onProgress: progressCallback,
      }).catch(error => {
        console.error('Scraping failed:', error);
      });

      res.json({ 
        success: true, 
        sessionId: session.id,
        message: "Search started, results will be available shortly"
      });

    } catch (error) {
      console.error('Search error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid search parameters",
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: "Search failed" 
      });
    }
  });

  // Get search results
  app.get("/api/products", async (req, res) => {
    try {
      const { query, limit = 50, offset = 0 } = req.query;
      
      const products = await storage.getProductsWithMerchants(
        query as string
      );

      res.json({
        success: true,
        products,
        total: products.length,
      });

    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch products" 
      });
    }
  });

  // Get top merchants for a product
  app.get("/api/products/:id/merchants", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { limit = 20 } = req.query;
      
      const merchants = await storage.getTopMerchantsForProduct(
        productId, 
        parseInt(limit as string)
      );

      res.json({
        success: true,
        merchants,
      });

    } catch (error) {
      console.error('Get merchants error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch merchants" 
      });
    }
  });

  // Get review summary for a product
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      const reviews = await storage.getReviewsForProduct(productId);
      const summary = await storage.getReviewSummary(productId);

      res.json({
        success: true,
        reviews,
        summary,
      });

    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch reviews" 
      });
    }
  });

  // Get scraping session status
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getScrapingSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          success: false, 
          message: "Session not found" 
        });
      }

      res.json({
        success: true,
        session,
      });

    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch session" 
      });
    }
  });

  // Export data
  app.post("/api/export", async (req, res) => {
    try {
      const { query, format = 'json', includeProducts = true, includeMerchants = true, includeReviews = true } = req.body;
      
      const exportData: any = {};

      if (includeProducts) {
        exportData.products = await storage.getProductsWithMerchants(query);
      }

      if (includeMerchants && exportData.products) {
        const merchantPromises = exportData.products.map((product: any) => 
          storage.getTopMerchantsForProduct(product.id)
        );
        exportData.merchantAnalysis = await Promise.all(merchantPromises);
      }

      if (includeReviews && exportData.products) {
        const reviewPromises = exportData.products.map((product: any) => 
          storage.getReviewsForProduct(product.id)
        );
        exportData.reviews = await Promise.all(reviewPromises);
      }

      // Set appropriate headers for download
      const filename = `cj-analysis-${query || 'all'}-${Date.now()}`;
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(convertToCSV(exportData));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(exportData);
      }

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Export failed" 
      });
    }
  });

  return httpServer;
}

function convertToCSV(data: any): string {
  // Simple CSV conversion for products
  if (!data.products || !Array.isArray(data.products)) {
    return 'No data available';
  }

  const headers = ['Title', 'Price Min', 'Price Max', 'Order Count', 'Rating', 'Category'];
  const rows = data.products.map((product: any) => [
    product.title,
    product.priceMin,
    product.priceMax,
    product.orderCount,
    product.rating,
    product.category,
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map((field: any) => `"${field}"`).join(','))
    .join('\n');

  return csv;
}
