# Task Vault

## Overview

Task Vault is a web-based platform that connects Instagram users with monetization opportunities through task completion. The application allows users to earn money by completing Instagram-related tasks (following accounts, liking posts, etc.) and provides administrators with tools to manage tasks, users, and payments. The platform is designed with a mobile-first approach, featuring a premium money-themed design with glass morphism UI elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom money-themed design variables and glass morphism effects
- **State Management**: TanStack Query for server state management and React Context for authentication
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with consistent error handling and logging middleware
- **Data Validation**: Zod schemas for type-safe data validation across client and server
- **File Structure**: Monorepo structure with shared schema definitions between client and server

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless database provider
- **Schema Design**: Relational database with tables for users, tasks, submissions, verification requests, withdrawal requests, and support requests
- **Migration Management**: Drizzle Kit for database migrations and schema updates

### Authentication and Authorization
- **Authentication Method**: Simple Instagram handle-based authentication without traditional passwords
- **User Verification**: Two-step verification process requiring admin approval
- **Session Management**: Local storage for client-side session persistence
- **Admin Access**: Password-protected admin panel with separate authentication flow

### Key Features Implementation
- **Task Management**: Dual-tier system with basic and advanced tasks, unlocked based on user progress
- **Payment System**: Virtual balance system with multiple withdrawal options (UPI, gift cards)
- **Instagram Integration**: Instagram account binding for advanced features with admin approval workflow
- **Admin Dashboard**: Comprehensive admin panel for managing users, tasks, submissions, and withdrawals
- **Mobile Navigation**: Bottom tab navigation for verified users with contextual page routing

## External Dependencies

### Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

### UI and Design
- **@radix-ui/***: Comprehensive set of accessible UI primitives for building the component library
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Utility for creating consistent component variants
- **lucide-react**: Icon library for consistent iconography

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management with caching and synchronization
- **@hookform/resolvers**: Form validation integration with React Hook Form

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React integration for Vite
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for development

### Runtime Dependencies
- **express**: Web application framework for the backend API
- **zod**: Schema validation library for type-safe data validation
- **date-fns**: Date utility library for date manipulation
- **connect-pg-simple**: PostgreSQL session store for Express sessions