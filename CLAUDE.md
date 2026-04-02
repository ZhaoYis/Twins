# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twins is an AI-powered writing style cloning platform. Users upload writing samples, the system extracts a "Style DNA" profile, and generates new content matching their unique voice using LLMs (OpenAI/Anthropic).

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server

# Database (Drizzle ORM)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema changes directly (dev)
npm run db:studio    # Open Drizzle Studio UI

# Linting
npm run lint         # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova style)
- **Auth**: NextAuth.js v5 with Google/GitHub OAuth
- **Database**: PostgreSQL with Drizzle ORM
- **i18n**: next-intl (Chinese `zh` / English `en`, default: `zh`)
- **AI**: OpenAI SDK & Anthropic SDK

## Architecture

### App Router Structure

Routes are organized under `src/app/[locale]/` for internationalization:

```
src/app/[locale]/
├── page.tsx              # Landing page
├── dashboard/            # Main app dashboard (protected)
├── settings/             # User settings (protected)
├── admin/                # Admin dashboard (admin only)
│   ├── dashboard/        # Admin overview
│   ├── users/            # User management
│   ├── providers/        # AI provider management
│   ├── profiles/         # Style profile management
│   ├── content/          # Generated content management
│   └── characters/       # Character/role management
└── auth/                 # Auth pages
    ├── signin/
    └── error/
```

### API Routes

```
src/app/api/
├── auth/[...nextauth]/   # NextAuth handlers
├── articles/             # Article CRUD
├── style-profile/        # Style analysis
├── generate/             # Content generation
├── user/api-key/         # User API key management
├── subscription/         # Subscription endpoints
└── admin/                # Admin endpoints (protected)
```

### Key Directories

- `src/components/ui/` - shadcn/ui components + custom primitives
- `src/components/shared/` - Shared components (Header, ThemeToggle)
- `src/lib/ai/` - AI service abstractions (style-analyzer.ts, content-generator.ts)
- `src/lib/db/` - Database schema and client
- `src/i18n/` - i18n configuration and request handler
- `src/types/` - TypeScript types and Zod schemas
- `openspec/` - OpenSpec workflow files (project.md, specs/, changes/)

### Authentication Flow

1. NextAuth v5 configured in `src/auth.ts` with DrizzleAdapter
2. JWT session strategy with role/status in token
3. Admin role assigned via `ADMIN_EMAILS` env variable
4. Middleware (`src/middleware.ts`) handles:
   - Locale prefixing (`/zh/`, `/en/`)
   - Admin route protection (role-based)
   - Protected route authentication (dashboard, settings)

### Database Schema (Key Tables)

- `users` - User accounts with role, status, subscription_tier
- `user_api_keys` - Encrypted user API keys (BYOK)
- `articles` - Uploaded writing samples
- `style_profiles` - Extracted Style DNA (tone, structure, vocabulary, quirks)
- `generated_content` - AI-generated content history
- `global_providers` - Admin-managed AI providers
- `characters` - Content generation personas
- `admin_logs` - Admin action audit trail
- `subscription_plans` / `user_subscriptions` / `token_usage_logs` - Subscription system

### Path Aliases

- `@/*` maps to `./src/*`
- `@/components/ui/*` - shadcn components
- `@/lib/*` - Utilities, DB, AI services

## Environment Variables

Required in `.env.local`:

```bash
# Database
POSTGRES_URL=postgresql://...

# NextAuth
AUTH_SECRET=your-secret-32-chars-minimum
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Admin
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Encryption (32-byte key for AES-256)
ENCRYPTION_KEY=your-32-byte-encryption-key
```

## Design System

Located in `src/app/globals.css`:

- **Style**: Minimal SaaS + Bento Grid + Gradient accents
- **Colors**: Indigo/Purple/Pink gradient palette
- **CSS Classes**:
  - `.bento-card` - Rounded cards with hover effects
  - `.gradient-text` - Gradient text effect
  - `.btn-cta` - Primary CTA button (accent color)
  - `.btn-primary-tech` - Gradient primary button
  - `.glass-card` - Glass morphism effect

## OpenSpec Workflow

This project uses OpenSpec for spec-driven development:

- `openspec/project.md` - Project context and conventions
- `openspec/AGENTS.md` - Workflow guide
- `openspec/specs/` - Active specifications
- `openspec/changes/` - Active change proposals
- `openspec/changes/archive/` - Completed changes

Commands:
- `/openspec:proposal <description>` - Create a new change proposal
- `/openspec:apply <change-id>` - Implement an approved change
- `/openspec:archive <change-id>` - Archive a completed change

## Code Conventions

- TypeScript strict mode enabled
- Use Zod schemas for runtime validation
- Path aliases preferred over relative imports
- Async/await over Promise chains
- Feature-based organization
