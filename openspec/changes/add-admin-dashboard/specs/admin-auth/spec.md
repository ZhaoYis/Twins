## ADDED Requirements

### Requirement: Admin Role Assignment

The system SHALL support admin role assignment through a hybrid mechanism:
- Initial admin emails defined in `ADMIN_EMAILS` environment variable
- Role stored in database `user.role` column after first login
- Role values: 'admin' or 'user' (default)

#### Scenario: Initial admin login from env whitelist
- **WHEN** a user with email in `ADMIN_EMAILS` logs in for the first time
- **THEN** the system SHALL set their role to 'admin' in the database

#### Scenario: Non-admin user login
- **WHEN** a user not in `ADMIN_EMAILS` logs in
- **THEN** the system SHALL set their role to 'user' (default)

#### Scenario: Admin role persistence
- **WHEN** an admin user logs in again
- **THEN** the system SHALL preserve their admin role from database

### Requirement: Admin Session Token

The system SHALL include user role in the session token and session object.

#### Scenario: Role included in JWT token
- **WHEN** a user authenticates
- **THEN** the JWT token SHALL contain a `role` claim

#### Scenario: Role available in session
- **WHEN** the session is accessed server-side
- **THEN** `session.user.role` SHALL be available

### Requirement: Admin Route Protection

The system SHALL protect all `/admin/*` pages and `/api/admin/*` endpoints.

#### Scenario: Admin accesses admin page
- **WHEN** an admin user navigates to `/admin/*`
- **THEN** the page SHALL render normally

#### Scenario: Non-admin accesses admin page
- **WHEN** a non-admin user navigates to `/admin/*`
- **THEN** the system SHALL return 403 Forbidden

#### Scenario: Unauthenticated access to admin page
- **WHEN** an unauthenticated user navigates to `/admin/*`
- **THEN** the system SHALL redirect to login page

### Requirement: Admin API Protection

All `/api/admin/*` endpoints SHALL verify admin role before processing requests.

#### Scenario: Admin makes API request
- **WHEN** an admin user calls `/api/admin/*` endpoint
- **THEN** the request SHALL be processed normally

#### Scenario: Non-admin makes API request
- **WHEN** a non-admin user calls `/api/admin/*` endpoint
- **THEN** the system SHALL return 403 Forbidden with error message

#### Scenario: Unauthenticated API request
- **WHEN** an unauthenticated request is made to `/api/admin/*`
- **THEN** the system SHALL return 401 Unauthorized
