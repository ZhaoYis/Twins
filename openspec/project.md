# Project Context

## Purpose
LLM Twins App - An AI-powered content generation platform that learns your writing style. Users upload writing samples, the system extracts a "Style DNA" profile, and generates new content matching their unique voice using LLMs (OpenAI/Anthropic).

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL (Vercel Postgres) with Drizzle ORM
- **Authentication**: NextAuth.js v5 (beta)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Internationalization**: next-intl
- **AI Providers**: OpenAI SDK, Anthropic SDK
- **Validation**: Zod schemas with drizzle-zod
- **Testing**: Not yet configured (Vitest recommended)

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- ES modules (ESM) syntax
- Use Zod schemas for runtime validation and type inference
- Async/await over Promise chains
- Descriptive variable names; avoid abbreviations
- Path aliases: `@/*` maps to `./src/*`

### Architecture Patterns
- **Next.js App Router** with route groups for localization (`[locale]/`)
- API routes in `src/app/api/`
- Feature-based organization: `components/`, `lib/`, `types/`
- Database layer: Drizzle ORM with schema in `src/lib/db/schema.ts`
- Server actions for mutations (NextAuth patterns)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   │   ├── dashboard/      # Main app dashboard
│   │   ├── settings/       # User settings
│   │   └── auth/           # Auth pages
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/             # Shared components (Header, ThemeToggle)
│   ├── dashboard/          # Dashboard-specific components
│   └── landing/            # Landing page sections
├── lib/
│   ├── ai/                 # AI integration (style-analyzer, content-generator)
│   ├── auth/               # Auth configuration and actions
│   ├── db/                 # Database schema and client
│   └── utils.ts            # Utility functions
├── i18n/                   # Internationalization config
└── types/                  # TypeScript types and Zod schemas
```

### Testing Strategy
- Not yet configured
- Recommended: Vitest for unit tests
- Focus on business logic (style analysis, content generation)
- Mock external AI API calls

### Git Workflow
- **Main branch**: `master` - production-ready code
- Feature branches for new work
- Conventional commits recommended

## Domain Context

### Core Concepts
1. **Style DNA / Style Profile**: Extracted writing characteristics including:
   - Tone analysis (formality, emotional tone, audience awareness)
   - Structure patterns (sentence/paragraph length, transitions)
   - Vocabulary preferences (complexity, technical level, phrases)
   - Writing quirks (punctuation style, signature phrases)

2. **Article**: User-uploaded writing samples (URL, file, or pasted text)

3. **Generated Content**: AI-generated content based on user's Style DNA

4. **API Keys**: User-provided OpenAI/Anthropic API keys (encrypted)

### User Flow
1. User signs in (OAuth via NextAuth)
2. User adds their AI provider API key
3. User uploads writing samples (articles)
4. System analyzes samples → extracts Style DNA
5. User requests content generation on a topic
6. System generates content matching their style

## External Dependencies
- **OpenAI API**: GPT models for style analysis and content generation
- **Anthropic API**: Claude models as alternative provider
- **Vercel Blob**: File storage for uploaded content
- **Vercel Postgres**: Database hosting

## Important Constraints
- TypeScript strict mode - no `any` types without justification
- User API keys must be encrypted at rest
- AI provider calls require valid API keys
- Single codebase maintainability
- Support bilingual: English and Chinese (next-intl)
