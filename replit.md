# Overview

This is a full-stack web application for a heartfelt message delivery service called "The Written Hug". The platform specializes in crafting and delivering personalized, emotional messages including love letters, gratitude notes, apologies, and celebration messages. Built with a modern tech stack, it features a beautiful React frontend with extensive UI components, an Express.js backend with Supabase database integration, and a Gmail-like admin system for managing client communications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design system variables and Google Fonts integration
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with TypeScript and ESM modules
- **Framework**: Express.js for HTTP server and API routes
- **Development**: TSX for TypeScript execution in development
- **Build**: ESBuild for production bundling
- **Middleware**: Custom logging middleware for API request tracking

## Data Storage
- **Database**: PostgreSQL with Supabase as the serverless provider
- **ORM**: Direct Supabase client integration for real-time operations
- **Schema**: Form submissions (written_hug) and conversation replies (hug_replies) tables
- **Connection**: Supabase client with service role key for admin operations
- **Admin System**: Gmail-like interface for managing submissions and client communications

## Authentication & Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Schema**: Basic user model with username and hashed password fields
- **Storage Abstraction**: Interface-based design allowing for multiple storage implementations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection driver for Neon Database
- **drizzle-orm & drizzle-kit**: Type-safe ORM with migration capabilities
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Design
- **@radix-ui/***: Comprehensive set of accessible UI primitives (30+ components)
- **tailwindcss**: Utility-first CSS framework with custom design tokens
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Modern icon library for React components

### Form & Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration layer for validation libraries
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Development Tools
- **vite**: Modern build tool with HMR and TypeScript support
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
- **@replit/vite-plugin-cartographer**: Development tooling for Replit integration

### External Services
- **Supabase**: Database and real-time functionality for form submissions and admin management
- **Mailjet**: Email service for automated notifications to admin and reply emails to clients
- **Google Fonts**: Typography with Inter and Great Vibes font families
- **Custom Admin Dashboard**: Gmail-like interface accessible at /admin with conversation management

The application follows a monorepo structure with shared TypeScript configurations, centralized schema definitions, and clear separation between client, server, and shared code. The build system supports both development and production environments with proper static asset handling and API routing.