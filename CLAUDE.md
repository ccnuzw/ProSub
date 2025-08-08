# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProSub is a modern proxy node management platform built with Vue 3 + Cloudflare Workers + D1 Database. It provides a dashboard for managing proxy nodes, subscriptions, and configuration files for various client types.

### Core Features
- Node Management: Import, health check, filter nodes
- Subscription Management: Add, update, parse subscriptions
- Configuration Files: Generate configs for Clash, Surge, Quantumult X, Loon, Sing-Box
- Template Management: Custom configuration templates

### Tech Stack
- Frontend: Vue 3 (Composition API), TypeScript, Ant Design Vue, Vite
- Backend: Cloudflare Workers (Edge Runtime), D1 Database (SQLite), KV Storage
- Build Tools: Vite, TypeScript, ESLint, Prettier

## Project Structure
```
prosub/
├── src/                    # Frontend source code
│   ├── components/        # Vue components
│   ├── views/            # Page components
│   ├── router/           # Router configuration
│   └── lib/              # Utility libraries
├── functions/             # Backend API (Cloudflare Workers)
│   ├── api/              # API routes
│   ├── core/             # Core business logic
│   └── utils/            # Utility functions
├── packages/              # Shared packages
│   └── shared/           # Shared types and utilities
└── docs/                 # Documentation
```

## Common Development Commands

### Development
```bash
# Start frontend development server
npm run dev

# Start backend development server
npm run dev:backend

# Initialize local D1 database (required after schema changes)
npm run init-db
```

### Building
```bash
# Build frontend for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Database Operations
```bash
# Initialize local D1 database
npm run init-db

# Apply schema to local database
npm run db:migrate

# Apply schema to production database
npm run db:migrate:prod
```

### Testing
```bash
# Run tests
npm run test

# Run local database tests
npm run test:local
```

## Architecture Overview

### Frontend Architecture
- Vue 3 with Composition API
- Pinia for state management
- Vue Router for routing
- Ant Design Vue for UI components
- TypeScript for type safety

### Backend Architecture
- Cloudflare Workers for edge computing
- D1 Database for data persistence
- KV Storage for caching and session data
- RESTful API design
- Modular structure with core logic separated from API routes

### Data Flow
1. Frontend makes API requests to Cloudflare Workers
2. Workers process requests and interact with D1 Database
3. Database operations are performed through data access utilities
4. Responses are sent back to frontend as JSON
5. Frontend updates UI based on responses

### Database Schema
- Users: Authentication and user management
- Nodes: Proxy node information
- Node Health Status: Real-time node health data
- Subscriptions: Subscription sources and metadata
- Profiles: Configuration file templates
- Profile Nodes/Subscriptions: Many-to-many relationships
- Templates: Custom configuration templates

## Key Implementation Details

### Authentication
- Session-based authentication using KV storage
- Middleware for protecting API routes
- Login/logout functionality in core/auth module

### Node Management
- CRUD operations for nodes in functions/core/nodes.ts
- Health checking in functions/core/node-health-check.ts
- Batch operations for importing multiple nodes

### Subscription Management
- Subscription parsing and updating in functions/core/subscriptions.ts
- Rule-based filtering for subscription content
- Automatic node creation from subscriptions

### Configuration Generation
- Client-specific configuration generation
- Template-based configuration customization
- Profile management for different client types

## Common Development Tasks

### Adding a New API Endpoint
1. Create new file in functions/api/ directory
2. Implement handler in functions/core/ directory
3. Add route to appropriate index.ts file

### Adding a New Database Table
1. Update schema.sql with new table definition
2. Run npm run db:migrate to apply changes locally
3. Update shared types in packages/shared/types/index.ts
4. Create data access utilities in functions/core/utils/d1-data-access.ts

### Adding a New Frontend Component
1. Create new .vue file in src/components/ or src/views/
2. Implement component logic using Composition API
3. Add component to router if it's a page
4. Register component in src/components/index.ts if needed

### Adding a New Client Type
1. Update client type definitions in shared types
2. Add client-specific configuration generation logic
3. Update frontend UI to support new client type
4. Add template support for new client type