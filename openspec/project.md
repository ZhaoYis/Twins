# Project Context

## Purpose
LLM Twins App - An AI-powered content generation platform that learns your writing style. Users upload writing samples, the system extracts a "Style DNA" profile, and generates new content matching their unique voice using LLMs (OpenAI/Anthropic).

### Key Features
- **Style DNA Extraction**: AI analyzes writing patterns (tone, structure, vocabulary, quirks)
- **Content Generation**: Generate blogs, emails, social posts in user's unique style
- **Multi-tier Pricing**: Free (BYOK), Pro, and Enterprise plans
- **Admin Dashboard**: Full operations management for admins
- **Platform Providers**: Admin-managed AI providers for non-BYOK users

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL (Prisma Postgres) with Drizzle ORM
- **Authentication**: NextAuth.js v5 with JWT strategy
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Design System**: Minimal SaaS + Bento Grid + Gradient style
- **Internationalization**: next-intl (Chinese/English)
- **AI Providers**: OpenAI SDK, Anthropic SDK
- **Validation**: Zod schemas with drizzle-zod
- **Encryption**: AES-256 for API keys

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- ES modules (ESM) syntax
- Use Zod schemas for runtime validation and type inference
- Async/await over Promise chains
- Descriptive variable names; avoid abbreviations
- Path aliases: `@/*` maps to `./src/*`
- Custom hooks in `src/hooks/` with `use-` prefix

### Architecture Patterns
- **Next.js App Router** with route groups for localization (`[locale]/`)
- API routes in `src/app/api/`
- Feature-based organization: `components/`, `lib/`, `types/`
- Database layer: Drizzle ORM with schema in `src/lib/db/schema.ts`
- Server actions for mutations (NextAuth patterns)
- Middleware-based route protection for admin routes

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   │   ├── dashboard/      # Main app dashboard
│   │   ├── settings/       # User settings
│   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── dashboard/  # Admin overview
│   │   │   ├── users/      # User management
│   │   │   ├── providers/  # AI provider management
│   │   │   ├── profiles/   # Style profile management
│   │   │   ├── content/    # Generated content management
│   │   │   └── characters/ # Character/role management
│   │   └── auth/           # Auth pages
│   └── api/                # API route handlers
│       ├── admin/          # Admin API endpoints
│       ├── articles/       # Article CRUD
│       ├── generate/       # Content generation
│       └── style-profile/  # Style analysis
├── components/
│   ├── ui/                 # shadcn/ui primitives + custom
│   │   └── particle-background.tsx
│   ├── shared/             # Shared components (Header, ThemeToggle)
│   ├── dashboard/          # Dashboard-specific components
│   ├── landing/            # Landing page sections
│   │   ├── Hero.tsx        # With typewriter effect
│   │   ├── Features.tsx    # Bento grid features
│   │   ├── HowItWorks.tsx  # Workflow demo
│   │   ├── Pricing.tsx     # Multi-tier pricing
│   │   └── Footer.tsx
│   └── admin/              # Admin dashboard components
├── lib/
│   ├── ai/                 # AI integration (style-analyzer, content-generator)
│   ├── auth/               # Auth configuration and actions
│   ├── db/                 # Database schema and client
│   ├── encryption.ts       # AES-256 encryption utilities
│   └── utils.ts            # Utility functions
├── hooks/                  # Custom React hooks
│   └── use-typewriter.tsx  # Typewriter effect hook
├── i18n/                   # Internationalization config
└── types/                  # TypeScript types and Zod schemas
```

### Design System
- **Style**: Minimal SaaS with Bento Grid + Gradient accents
- **Colors**: Indigo/Purple/Pink gradient palette
- **Components**:
  - `.bento-card` - Rounded cards with hover effects
  - `.gradient-text` - Gradient text effect
  - `.btn-cta` - Primary CTA button (accent color)
  - `.btn-primary-tech` - Gradient primary button
  - `.btn-secondary` - Outline button
- **Animations**: Float, shimmer, gradient-flow, typewriter

### Testing Strategy
- Not yet configured
- Recommended: Vitest for unit tests
- Focus on business logic (style analysis, content generation)
- Mock external AI API calls

### Git Workflow
- **Main branch**: `master` - production-ready code
- Feature branches for new work
- Conventional commits recommended
- OpenSpec workflow for planning changes

## Domain Context

### Core Concepts

1. **Style DNA / Style Profile**: Extracted writing characteristics including:
   - Tone analysis (formality, emotional tone, audience awareness)
   - Structure patterns (sentence/paragraph length, transitions)
   - Vocabulary preferences (complexity, technical level, phrases)
   - Writing quirks (punctuation style, signature phrases)

2. **Article**: User-uploaded writing samples (URL, file, or pasted text)

3. **Generated Content**: AI-generated content based on user's Style DNA

4. **API Keys**: User-provided OpenAI/Anthropic API keys (encrypted with AES-256)

5. **Global Providers**: Admin-managed AI providers for platform users
   - Tier-based access control (free/pro/enterprise)
   - Rate limiting support

6. **Characters/Roles**: Predefined content generation personas
   - Custom style prompts
   - User assignments

7. **Subscriptions**: Tiered pricing system
   - Free: BYOK (Bring Your Own Key), unlimited generation
   - Pro: 1M tokens/month, platform providers included
   - Enterprise: 5M tokens/month, team features, dedicated support

8. **Token Usage**: Tracking and quota management for platform providers

### User Roles
- **User**: Standard user with dashboard access
- **Admin**: Full access to admin dashboard and operations management

### User Flow

#### Standard User
1. User signs in (OAuth via NextAuth - GitHub/Google)
2. User adds their AI provider API key (Free tier) OR uses platform providers (Pro/Enterprise)
3. User uploads writing samples (articles)
4. System analyzes samples → extracts Style DNA
5. User requests content generation on a topic
6. System generates content matching their style
7. Token usage tracked for platform provider users

#### Admin User
1. Admin logs in (role assigned via ADMIN_EMAILS env var)
2. Access admin dashboard at `/admin`
3. Manage users, providers, content, profiles, characters
4. View statistics and system health
5. All admin actions logged in `admin_logs` table

## Database Schema

### Core Tables
| Table | Description |
|-------|-------------|
| `users` | User accounts with role, status, subscription_tier |
| `user_api_keys` | Encrypted user API keys (BYOK) |
| `articles` | Uploaded writing samples |
| `style_profiles` | Extracted Style DNA |
| `generated_content` | AI-generated content history |

### Admin/Operations Tables
| Table | Description |
|-------|-------------|
| `global_providers` | Admin-managed AI providers |
| `characters` | Content generation personas |
| `user_characters` | User-character assignments |
| `admin_logs` | Admin action audit trail |

### Subscription Tables
| Table | Description |
|-------|-------------|
| `subscription_plans` | Plan definitions (free/pro/enterprise) |
| `user_subscriptions` | User subscription state |
| `token_usage_logs` | Token consumption tracking |

## External Dependencies
- **OpenAI API**: GPT models for style analysis and content generation
- **Anthropic API**: Claude models as alternative provider
- **Prisma Postgres**: Database hosting (with connection pooling)
- **Vercel**: Deployment platform

## Environment Variables
```bash
# Authentication
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=           # NextAuth secret (32+ chars)
NEXTAUTH_URL=          # Base URL

# Admin Configuration
ADMIN_EMAILS=          # Comma-separated admin emails

# Database
POSTGRES_URL=          # PostgreSQL connection string

# Encryption
ENCRYPTION_KEY=        # 32-byte key for AES-256
```

## Important Constraints
- TypeScript strict mode - no `any` types without justification
- User API keys must be encrypted at rest (AES-256)
- AI provider calls require valid API keys
- Admin routes protected by middleware (role-based)
- Single codebase maintainability
- Support bilingual: English and Chinese (next-intl)
- Platform providers require tier-based access control

## OpenSpec Specifications
- `admin-auth`: Admin role assignment and route protection
- `admin-users`: User management capabilities
- `admin-providers`: AI provider management
- `admin-content`: Generated content oversight
- `admin-profiles`: Style profile management
- `admin-roles`: Character/role management
