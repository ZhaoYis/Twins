# Change: Add Admin Dashboard for Operations Management

## Why

The platform currently lacks an administrative interface for operations staff to manage users, monitor system usage, and configure AI providers. This creates friction in daily operations and limits visibility into platform activity.

A dedicated admin dashboard will enable:
- User account management and support
- AI provider configuration and monitoring
- Content generation oversight
- Style DNA profile inspection
- Role-based character management for future features

## What Changes

### New Capabilities

1. **Admin Authentication**
   - Role-based access control (admin vs regular user)
   - Protected admin routes and API endpoints
   - Admin session management

2. **User Management**
   - View/search/filter users list
   - View user details and activity
   - Disable/enable user accounts
   - View user's API keys (masked)

3. **AI Provider Management**
   - Configure global AI providers
   - Set rate limits and quotas
   - Monitor provider usage and costs
   - Manage provider API keys (system-level)

4. **Content Management**
   - View all generated content records
   - Filter by user, date, model
   - View content generation statistics
   - Export content data

5. **Style Profile Management**
   - View all style profiles
   - Inspect DNA analysis details
   - View profile source articles
   - Delete/rebuild profiles

6. **Role/Character Management** (NEW)
   - Create/edit/delete character roles
   - Define character writing styles
   - Assign characters to users
   - Character usage analytics

### Database Schema Changes

- Add `user_roles` table for admin role assignment
- Add `admin_settings` table for system configuration
- Add `characters` table for role-based content generation
- Add `global_providers` table for system-level AI provider config

### API Changes

- New `/api/admin/*` endpoints for all admin operations
- Middleware for admin-only route protection

## Impact

- **Affected specs**: None (new capability)
- **Affected code**:
  - `src/lib/db/schema.ts` - New tables
  - `src/auth.ts` - Role-based auth
  - `src/middleware.ts` - Admin route protection
  - New: `src/app/[locale]/admin/*` pages
  - New: `src/app/api/admin/*` endpoints
  - New: `src/components/admin/*` components
- **Breaking changes**: None
- **Dependencies**: No new external dependencies

## Success Criteria

1. Admin can log in with elevated privileges
2. Admin can view and manage all users
3. Admin can configure AI providers globally
4. Admin can view and filter all generated content
5. Admin can inspect and manage style profiles
6. Admin can create and manage character roles

## Open Questions

1. Should admin access be granted via:
   - Environment variable whitelist (email addresses)?
   - Database role assignment?
   - OAuth provider role claim?

2. For "Characters/Roles" feature:
   - What character attributes are needed?
   - How do characters interact with Style DNA?
   - Should characters be user-specific or global?

3. Admin UI style:
   - Match existing landing page tech theme?
   - Simplified functional dashboard?
