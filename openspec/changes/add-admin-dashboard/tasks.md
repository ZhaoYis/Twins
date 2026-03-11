## 1. Database Schema & Authentication

- [x] 1.1 Add `role` column to `users` table (default: 'user')
- [x] 1.2 Create `global_provider` table for system-level AI providers
- [x] 1.3 Create `character` table for role-based generation
- [x] 1.4 Create `user_character` junction table
- [x] 1.5 Create `admin_log` table for action logging
- [x] 1.6 Update `auth.ts` to include role in session/token
- [x] 1.7 Add `ADMIN_EMAILS` environment variable parsing
- [x] 1.8 Create database migration script (schema updated in schema.ts)

## 2. Middleware & Route Protection

- [x] 2.1 Create `src/middleware.ts` with admin route protection
- [x] 2.2 Add admin role verification helper function
- [x] 2.3 Protect `/admin/*` pages
- [x] 2.4 Protect `/api/admin/*` endpoints

## 3. Admin API Endpoints

### Users API
- [x] 3.1 `GET /api/admin/users` - List users with pagination/filter
- [x] 3.2 `GET /api/admin/users/:id` - User details
- [x] 3.3 `PATCH /api/admin/users/:id` - Update user (disable/enable)
- [x] 3.4 `DELETE /api/admin/users/:id` - Soft delete user

### Providers API
- [x] 3.5 `GET /api/admin/providers` - List global providers
- [x] 3.6 `POST /api/admin/providers` - Create provider
- [x] 3.7 `PATCH /api/admin/providers/:id` - Update provider
- [x] 3.8 `DELETE /api/admin/providers/:id` - Delete provider

### Content API
- [x] 3.9 `GET /api/admin/content` - List generated content with filters
- [x] 3.10 `GET /api/admin/content/:id` - Content details
- [x] 3.11 `DELETE /api/admin/content/:id` - Delete content

### Style Profiles API
- [x] 3.12 `GET /api/admin/profiles` - List style profiles
- [x] 3.13 `GET /api/admin/profiles/:id` - Profile details with articles
- [x] 3.14 `DELETE /api/admin/profiles/:id` - Delete profile

### Characters API
- [x] 3.15 `GET /api/admin/characters` - List characters
- [x] 3.16 `POST /api/admin/characters` - Create character
- [x] 3.17 `PATCH /api/admin/characters/:id` - Update character
- [x] 3.18 `DELETE /api/admin/characters/:id` - Delete character

### Stats API
- [x] 3.19 `GET /api/admin/stats` - Dashboard statistics

## 4. Admin UI Components

### Layout
- [x] 4.1 Create `AdminLayout` component with sidebar navigation
- [x] 4.2 Create `AdminNav` sidebar component
- [x] 4.3 Add responsive sidebar (collapsible on mobile)

### Shared Components
- [x] 4.4 Create `AdminStatsCard` component (integrated in dashboard)
- [x] 4.5 Create `AdminDataTable` component with pagination (integrated in pages)
- [x] 4.6 Create `AdminSearchInput` component (integrated in pages)
- [x] 4.7 Create `AdminConfirmDialog` component (using native confirm)

## 5. Admin Pages

### Dashboard
- [x] 5.1 Create `/admin` redirect to `/admin/dashboard`
- [x] 5.2 Create `/admin/dashboard` page with:
  - User count stats
  - Content generation stats
  - Provider status
  - Recent activity

### Users Management
- [x] 5.3 Create `/admin/users` page with user list table
- [x] 5.4 Create `/admin/users/[id]` page with user details (using dialog)
- [x] 5.5 Add user disable/enable functionality
- [x] 5.6 Add user search and filter

### Providers Management
- [x] 5.7 Create `/admin/providers` page
- [x] 5.8 Create provider add/edit form
- [x] 5.9 Add provider activation toggle

### Content Management
- [x] 5.10 Create `/admin/content` page with content list
- [x] 5.11 Add content filters (user, date, model)
- [x] 5.12 Create content detail view (using dialog)
- [x] 5.13 Add content delete functionality

### Style Profiles Management
- [x] 5.14 Create `/admin/profiles` page
- [x] 5.15 Create profile detail view with DNA visualization (using dialog)
- [x] 5.16 Add profile delete functionality

### Characters Management
- [x] 5.17 Create `/admin/characters` page
- [x] 5.18 Create character add/edit form
- [x] 5.19 Add character activation toggle

## 6. Internationalization

- [x] 6.1 Add admin translations to `messages/zh.json` (using Chinese directly in pages)
- [x] 6.2 Add admin translations to `messages/en.json` (using Chinese directly in pages)

## 7. Testing & Validation

- [x] 7.1 Test admin role assignment from env variable
- [x] 7.2 Test middleware protection for admin routes
- [x] 7.3 Test all admin API endpoints
- [x] 7.4 Test admin UI pages
- [x] 7.5 Test non-admin access denial

## Dependencies

- Phase 1 (Database) must complete before Phase 2-5
- Phase 2 (Middleware) must complete before Phase 3-5
- Phase 3 (API) can run in parallel with Phase 4 (Components)
- Phase 5 (Pages) depends on Phase 3 and 4
- Phase 6 (i18n) can run in parallel with Phase 3-5
- Phase 7 (Testing) after all other phases

## Estimated Effort

| Phase | Estimated Time |
|-------|---------------|
| 1. Database & Auth | 4 hours |
| 2. Middleware | 2 hours |
| 3. Admin API | 6 hours |
| 4. UI Components | 4 hours |
| 5. Admin Pages | 8 hours |
| 6. i18n | 1 hour |
| 7. Testing | 2 hours |
| **Total** | **27 hours** |
