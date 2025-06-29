# CJ Intelligence - Product & Merchant Analysis Tool

## Overview

CJ Intelligence is a full-stack web application designed to scrape, analyze, and present data from CJ Dropshipping. The application provides comprehensive product analysis, merchant evaluation, and review sentiment analysis to help users make informed dropshipping decisions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Zustand for client-side state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Updates**: WebSocket connection for live progress tracking

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based session storage
- **Build Tool**: Vite for frontend, esbuild for backend bundling

### Development Environment
- **Dev Server**: Vite with HMR and React Fast Refresh
- **Monorepo Structure**: Shared schema and types between client/server
- **Error Handling**: Replit runtime error overlay for development

## Key Components

### Data Layer
- **Products**: Core product information with pricing, ratings, and metadata
- **Merchants**: Seller profiles with performance metrics and ratings
- **Product-Merchant Relationships**: Many-to-many mapping with specific pricing and ratings
- **Reviews**: Customer feedback with sentiment analysis and keyword extraction
- **Scraping Sessions**: Background job tracking with real-time progress updates

### Services Layer
- **Web Scraper**: CJ Dropshipping data extraction using Cheerio and Axios
- **Sentiment Analysis**: Rule-based text analysis for review classification
- **Storage Interface**: Abstracted data access layer with in-memory implementation
- **Real-time Communication**: WebSocket server for progress broadcasting

### API Layer
- **REST Endpoints**: Express routes for CRUD operations and search functionality
- **WebSocket Server**: Real-time progress updates during scraping operations
- **Error Handling**: Centralized error middleware with status code management
- **Request Logging**: Detailed API request/response logging for debugging

### User Interface
- **Search Interface**: Product search with configurable analysis options
- **Progress Tracking**: Real-time scraping progress with WebSocket updates
- **Product Results**: Paginated product listings with sorting and filtering
- **Merchant Analysis**: Detailed merchant performance metrics and comparison
- **Export Functionality**: Data export in multiple formats (JSON, CSV, Excel)

## Data Flow

1. **Search Initiation**: User submits search query through React form
2. **Session Creation**: Backend creates scraping session and returns session ID
3. **Background Scraping**: Asynchronous product scraping with progress updates
4. **Real-time Updates**: WebSocket broadcasts progress to connected clients
5. **Data Processing**: Products, merchants, and reviews are analyzed and stored
6. **Result Display**: Frontend queries processed data and displays results
7. **Merchant Analysis**: Detailed merchant metrics calculated on-demand
8. **Export Generation**: Data can be exported in various formats for external use

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations
- **axios**: HTTP client for web scraping requests
- **cheerio**: Server-side jQuery for HTML parsing
- **@tanstack/react-query**: Data fetching and caching for React

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **react-hook-form**: Performant form library with validation

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Automatic client and server restarts on changes
- **Error Overlay**: Development-only error reporting interface
- **Database**: Neon serverless PostgreSQL for consistent development environment

### Production Build
- **Frontend**: Vite builds React app to static assets
- **Backend**: esbuild bundles Express server for Node.js execution
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Infrastructure Requirements
- **Node.js**: Runtime environment for Express server
- **PostgreSQL**: Database server (Neon serverless recommended)
- **File System**: Static asset serving for built frontend
- **WebSocket Support**: Real-time communication capabilities

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```