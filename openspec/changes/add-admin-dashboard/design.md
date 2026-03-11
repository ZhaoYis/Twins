## Context

The LLM Twins platform needs an administrative backend for operations management. The admin dashboard will be a separate section of the application, accessible only to users with admin privileges.

**Constraints:**
- Must integrate with existing NextAuth authentication
- Must follow existing project conventions (TypeScript, Tailwind, shadcn/ui)
- Must support bilingual (Chinese/English)
- Should not impact performance for regular users

**Stakeholders:**
- Operations team (primary users)
- Developers (maintenance)
- End users (affected by admin actions)

## Goals / Non-Goals

**Goals:**
- Provide secure admin-only access
- Enable user account management
- Allow AI provider configuration
- Provide visibility into content generation
- Support character/role management for future features
- Maintain existing user experience

**Non-Goals:**
- Real-time analytics dashboard (can be added later)
- Multi-tenant admin isolation (single admin team)
- Advanced audit logging (basic logging only)
- Admin API for external integrations

## Decisions

### Decision 1: Admin Role Assignment

**Chosen:** Environment variable + Database hybrid approach

**Rationale:**
- Initial admin emails defined in `ADMIN_EMAILS` env variable
- Once assigned, role stored in database for persistence
- Allows dynamic role changes without code deployment

**Alternatives considered:**
1. **Environment only**: Simple but requires redeployment to change admins
2. **Database only**: Flexible but needs bootstrap mechanism
3. **OAuth role claims**: Provider-dependent, less control

**Implementation:**
```typescript
// Middleware checks session + database role
// Initial admins from env: ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Decision 2: Database Schema Design

**Chosen:** Add role column to users table + new tables

**Schema additions:**
```sql
-- User role (admin/user)
ALTER TABLE "user" ADD COLUMN "role" TEXT DEFAULT 'user';

-- Global AI provider configuration
CREATE TABLE "global_provider" (
  "id" UUID PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "encrypted_key" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT true,
  "rate_limit" INTEGER,
  "created_at" TIMESTAMP,
  "updated_at" TIMESTAMP
);

-- Character/Role definitions
CREATE TABLE "character" (
  "id" UUID PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "style_prompt" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP,
  "updated_at" TIMESTAMP
);

-- User character assignments
CREATE TABLE "user_character" (
  "id" UUID PRIMARY KEY,
  "user_id" TEXT REFERENCES "user"("id"),
  "character_id" UUID REFERENCES "character"("id"),
  "assigned_at" TIMESTAMP
);

-- Admin action logs
CREATE TABLE "admin_log" (
  "id" UUID PRIMARY KEY,
  "admin_id" TEXT REFERENCES "user"("id"),
  "action" TEXT NOT NULL,
  "target_type" TEXT,
  "target_id" TEXT,
  "details" JSONB,
  "created_at" TIMESTAMP
);
```

### Decision 3: Route Protection Strategy

**Chosen:** Middleware-based protection with role check

**Implementation:**
- Add middleware to check `/admin/*` and `/api/admin/*` routes
- Verify session exists and user has admin role
- Return 403 for non-admin users

**Alternatives considered:**
1. **Page-level checks**: Less DRY, easy to miss
2. **API-level only**: UI could expose admin routes

### Decision 4: Admin UI Layout

**Chosen:** Sidebar navigation layout

**Structure:**
```
/admin
├── /dashboard     # Overview stats
├── /users         # User management
├── /providers     # AI provider config
├── /content       # Generated content
├── /profiles      # Style DNA profiles
└── /characters    # Character management
```

**Rationale:**
- Matches common admin dashboard patterns
- Scales well for future features
- Mobile-responsive sidebar (collapsible)

### Decision 5: API Design

**Chosen:** RESTful admin API endpoints

**Endpoints:**
```
GET    /api/admin/users           # List users
GET    /api/admin/users/:id       # User details
PATCH  /api/admin/users/:id       # Update user
DELETE /api/admin/users/:id       # Disable user

GET    /api/admin/providers       # List providers
POST   /api/admin/providers       # Create provider
PATCH  /api/admin/providers/:id   # Update provider
DELETE /api/admin/providers/:id   # Delete provider

GET    /api/admin/content         # List content
GET    /api/admin/content/:id     # Content details
DELETE /api/admin/content/:id     # Delete content

GET    /api/admin/profiles        # List profiles
GET    /api/admin/profiles/:id    # Profile details
DELETE /api/admin/profiles/:id    # Delete profile

GET    /api/admin/characters      # List characters
POST   /api/admin/characters      # Create character
PATCH  /api/admin/characters/:id  # Update character
DELETE /api/admin/characters/:id  # Delete character

GET    /api/admin/stats           # Dashboard stats
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Admin impersonation attack | Strict role verification, session validation |
| Accidental data deletion | Confirmation dialogs, soft deletes |
| Performance impact on queries | Pagination, indexed columns |
| UI complexity | Reuse existing components, keep pages focused |

## Migration Plan

1. **Phase 1: Auth & Schema** (Day 1)
   - Add role column to users
   - Create new tables
   - Update auth callbacks
   - Add middleware protection

2. **Phase 2: User Management** (Day 2)
   - User list page
   - User detail page
   - User actions (disable, view keys)

3. **Phase 3: Content & Profiles** (Day 3)
   - Content listing and filtering
   - Profile inspection
   - Statistics dashboard

4. **Phase 4: Providers & Characters** (Day 4)
   - Provider configuration
   - Character CRUD
   - Final polish

**Rollback:**
- Remove admin routes from middleware
- Revert schema migrations
- Remove admin components

## Open Questions

1. **Character Feature Details:**
   - What attributes should characters have?
   - Should characters override or enhance Style DNA?
   - Any pre-defined character templates?

2. **Admin Notifications:**
   - Should admins receive alerts for certain events?
   - Email notifications for new user signups?

3. **Data Export:**
   - What export formats are needed? (CSV, JSON)
   - Bulk export functionality?

4. **Rate Limiting:**
   - Should admin API have rate limits?
   - Separate limits for admin vs regular API?
