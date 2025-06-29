import {
  products,
  merchants,
  productMerchants,
  reviews,
  scrapingSessions,
  type Product,
  type Merchant,
  type ProductMerchant,
  type Review,
  type ScrapingSession,
  type InsertProduct,
  type InsertMerchant,
  type InsertProductMerchant,
  type InsertReview,
  type InsertScrapingSession,
  type ProductWithMerchants,
  type MerchantAnalysis,
} from "@shared/schema";

export interface IStorage {
  // Products
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(searchQuery?: string, limit?: number, offset?: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsWithMerchants(searchQuery?: string): Promise<ProductWithMerchants[]>;

  // Merchants
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  getMerchantByName(name: string): Promise<Merchant | undefined>;
  getMerchantById(id: number): Promise<Merchant | undefined>;

  // Product-Merchant relationships
  createProductMerchant(productMerchant: InsertProductMerchant): Promise<ProductMerchant>;
  getTopMerchantsForProduct(productId: number, limit?: number): Promise<MerchantAnalysis[]>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForProduct(productId: number): Promise<Review[]>;
  getReviewSummary(productId: number): Promise<any>;

  // Scraping sessions
  createScrapingSession(session: InsertScrapingSession): Promise<ScrapingSession>;
  updateScrapingSession(id: number, updates: Partial<ScrapingSession>): Promise<ScrapingSession | undefined>;
  getScrapingSession(id: number): Promise<ScrapingSession | undefined>;
  getActiveScrapingSessions(): Promise<ScrapingSession[]>;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product> = new Map();
  private merchants: Map<number, Merchant> = new Map();
  private productMerchants: Map<number, ProductMerchant> = new Map();
  private reviews: Map<number, Review> = new Map();
  private scrapingSessions: Map<number, ScrapingSession> = new Map();
  
  private productIdCounter = 1;
  private merchantIdCounter = 1;
  private productMerchantIdCounter = 1;
  private reviewIdCounter = 1;
  private scrapingSessionIdCounter = 1;

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      description: insertProduct.description || null,
      priceMin: insertProduct.priceMin || null,
      priceMax: insertProduct.priceMax || null,
      imageUrl: insertProduct.imageUrl || null,
      orderCount: insertProduct.orderCount || null,
      rating: insertProduct.rating || null,
      category: insertProduct.category || null,
    };
    this.products.set(id, product);
    return product;
  }

  async getProducts(searchQuery?: string, limit = 50, offset = 0): Promise<Product[]> {
    let productsArray = Array.from(this.products.values());
    
    if (searchQuery) {
      productsArray = productsArray.filter(
        p => p.searchQuery?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return productsArray
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(offset, offset + limit);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsWithMerchants(searchQuery?: string): Promise<ProductWithMerchants[]> {
    const products = await this.getProducts(searchQuery);
    
    return products.map(product => {
      const productMerchantsArray = Array.from(this.productMerchants.values())
        .filter(pm => pm.productId === product.id);
      
      const merchants = productMerchantsArray.map(pm => {
        const merchant = this.merchants.get(pm.merchantId);
        return {
          ...pm,
          merchant: merchant!,
        };
      });

      const reviewSummary = this.calculateReviewSummary(product.id);

      return {
        ...product,
        merchants,
        reviewSummary,
      };
    });
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    const id = this.merchantIdCounter++;
    const merchant: Merchant = {
      ...insertMerchant,
      id,
      createdAt: new Date(),
      profileUrl: insertMerchant.profileUrl || null,
      overallRating: insertMerchant.overallRating || null,
      totalOrders: insertMerchant.totalOrders || null,
    };
    this.merchants.set(id, merchant);
    return merchant;
  }

  async getMerchantByName(name: string): Promise<Merchant | undefined> {
    return Array.from(this.merchants.values()).find(m => m.name === name);
  }

  async getMerchantById(id: number): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async createProductMerchant(insertProductMerchant: InsertProductMerchant): Promise<ProductMerchant> {
    const id = this.productMerchantIdCounter++;
    const productMerchant: ProductMerchant = {
      ...insertProductMerchant,
      id,
      createdAt: new Date(),
      price: insertProductMerchant.price || null,
      productRating: insertProductMerchant.productRating || null,
      productOrders: insertProductMerchant.productOrders || null,
      shippingDuration: insertProductMerchant.shippingDuration || null,
      merchantUrl: insertProductMerchant.merchantUrl || null,
    };
    this.productMerchants.set(id, productMerchant);
    return productMerchant;
  }

  async getTopMerchantsForProduct(productId: number, limit = 20): Promise<MerchantAnalysis[]> {
    const productMerchantsArray = Array.from(this.productMerchants.values())
      .filter(pm => pm.productId === productId);

    const merchantAnalyses = productMerchantsArray.map(pm => {
      const merchant = this.merchants.get(pm.merchantId)!;
      return {
        merchant,
        productPrice: pm.price || "0",
        productRating: parseFloat(pm.productRating || "0"),
        productOrders: pm.productOrders || 0,
        shippingDuration: pm.shippingDuration || "Unknown",
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by rating and order count
    merchantAnalyses.sort((a, b) => {
      const ratingDiff = b.productRating - a.productRating;
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      return b.productOrders - a.productOrders;
    });

    // Assign ranks
    merchantAnalyses.forEach((analysis, index) => {
      analysis.rank = index + 1;
    });

    return merchantAnalyses.slice(0, limit);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
      rating: insertReview.rating || null,
      merchantId: insertReview.merchantId || null,
      sentiment: insertReview.sentiment || null,
      keywords: insertReview.keywords || null,
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsForProduct(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.productId === productId);
  }

  async getReviewSummary(productId: number): Promise<any> {
    return this.calculateReviewSummary(productId);
  }

  private calculateReviewSummary(productId: number) {
    const productReviews = Array.from(this.reviews.values())
      .filter(r => r.productId === productId);

    if (productReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        sentiment: "neutral",
        positivePercentage: 0,
        commonKeywords: [],
      };
    }

    const totalReviews = productReviews.length;
    const averageRating = productReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews;
    
    const sentimentCounts = productReviews.reduce((acc, r) => {
      acc[r.sentiment || "neutral"] = (acc[r.sentiment || "neutral"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantSentiment = Object.entries(sentimentCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral";

    const positivePercentage = ((sentimentCounts.positive || 0) / totalReviews) * 100;

    // Extract common keywords
    const allKeywords = productReviews
      .flatMap(r => (r.keywords as string[]) || [])
      .filter(Boolean);
    
    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);

    return {
      totalReviews,
      averageRating,
      sentiment: dominantSentiment,
      positivePercentage,
      commonKeywords,
    };
  }

  async createScrapingSession(insertSession: InsertScrapingSession): Promise<ScrapingSession> {
    const id = this.scrapingSessionIdCounter++;
    const session: ScrapingSession = {
      ...insertSession,
      id,
      startedAt: new Date(),
      completedAt: null,
      progress: insertSession.progress || null,
      totalProducts: insertSession.totalProducts || null,
      analyzedMerchants: insertSession.analyzedMerchants || null,
      error: insertSession.error || null,
    };
    this.scrapingSessions.set(id, session);
    return session;
  }

  async updateScrapingSession(id: number, updates: Partial<ScrapingSession>): Promise<ScrapingSession | undefined> {
    const session = this.scrapingSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    if (updates.status === "completed" || updates.status === "failed") {
      updatedSession.completedAt = new Date();
    }

    this.scrapingSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getScrapingSession(id: number): Promise<ScrapingSession | undefined> {
    return this.scrapingSessions.get(id);
  }

  async getActiveScrapingSessions(): Promise<ScrapingSession[]> {
    return Array.from(this.scrapingSessions.values())
      .filter(s => s.status === "pending" || s.status === "in_progress");
  }
}

export const storage = new MemStorage();
