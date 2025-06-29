import { pgTable, text, serial, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  productUrl: text("product_url").notNull(),
  orderCount: integer("order_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  category: text("category"),
  searchQuery: text("search_query").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  profileUrl: text("profile_url"),
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }),
  totalOrders: integer("total_orders").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productMerchants = pgTable("product_merchants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  merchantId: integer("merchant_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  productRating: decimal("product_rating", { precision: 3, scale: 2 }),
  productOrders: integer("product_orders").default(0),
  shippingDuration: text("shipping_duration"),
  merchantUrl: text("merchant_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  merchantId: integer("merchant_id"),
  reviewText: text("review_text").notNull(),
  rating: integer("rating"),
  sentiment: text("sentiment"), // positive, negative, neutral
  keywords: jsonb("keywords"), // array of extracted keywords
  createdAt: timestamp("created_at").defaultNow(),
});

export const scrapingSessions = pgTable("scraping_sessions", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  status: text("status").notNull(), // pending, in_progress, completed, failed
  progress: integer("progress").default(0),
  totalProducts: integer("total_products").default(0),
  analyzedMerchants: integer("analyzed_merchants").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  error: text("error"),
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({
  id: true,
  createdAt: true,
});

export const insertProductMerchantSchema = createInsertSchema(productMerchants).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertScrapingSessionSchema = createInsertSchema(scrapingSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required"),
  includeReviews: z.boolean().default(true),
  includeMerchantAnalysis: z.boolean().default(true),
  includePriceTracking: z.boolean().default(false),
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;

export type ProductMerchant = typeof productMerchants.$inferSelect;
export type InsertProductMerchant = z.infer<typeof insertProductMerchantSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ScrapingSession = typeof scrapingSessions.$inferSelect;
export type InsertScrapingSession = z.infer<typeof insertScrapingSessionSchema>;

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Extended types for API responses
export type ProductWithMerchants = Product & {
  merchants: (ProductMerchant & { merchant: Merchant })[];
  reviewSummary?: {
    totalReviews: number;
    averageRating: number;
    sentiment: string;
    positivePercentage: number;
    commonKeywords: string[];
  };
};

export type MerchantAnalysis = {
  merchant: Merchant;
  productPrice: string;
  productRating: number;
  productOrders: number;
  shippingDuration: string;
  rank: number;
};
