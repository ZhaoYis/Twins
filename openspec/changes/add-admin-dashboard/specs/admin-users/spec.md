## ADDED Requirements

### Requirement: List Users

The system SHALL provide an API endpoint to list all users with pagination and filtering.

#### Scenario: List users with pagination
- **WHEN** admin requests `GET /api/admin/users?page=1&limit=20`
- **THEN** the system SHALL return paginated user list with total count

#### Scenario: Filter users by email
- **WHEN** admin requests `GET /api/admin/users?email=search@example.com`
- **THEN** the system SHALL return users matching the email filter

#### Scenario: Filter users by role
- **WHEN** admin requests `GET /api/admin/users?role=admin`
- **THEN** the system SHALL return only admin users

#### Scenario: Sort users by creation date
- **WHEN** admin requests `GET /api/admin/users?sort=createdAt&order=desc`
- **THEN** the system SHALL return users sorted by creation date

### Requirement: View User Details

The system SHALL provide an API endpoint to view individual user details.

#### Scenario: Get user by ID
- **WHEN** admin requests `GET /api/admin/users/:id`
- **THEN** the system SHALL return user profile with:
  - Basic info (name, email, image)
  - Account statistics (article count, content count)
  - API keys (provider names only, keys masked)
  - Role and status

#### Scenario: User not found
- **WHEN** admin requests non-existent user ID
- **THEN** the system SHALL return 404 Not Found

### Requirement: Update User Status

The system SHALL allow admins to disable or enable user accounts.

#### Scenario: Disable user account
- **WHEN** admin requests `PATCH /api/admin/users/:id` with `{ "status": "disabled" }`
- **THEN** the system SHALL:
  - Set user status to 'disabled'
  - Invalidate all user sessions
  - Log the action in admin_log table

#### Scenario: Enable user account
- **WHEN** admin requests `PATCH /api/admin/users/:id` with `{ "status": "active" }`
- **THEN** the system SHALL set user status to 'active'

#### Scenario: Update user role
- **WHEN** admin requests `PATCH /api/admin/users/:id` with `{ "role": "admin" }`
- **THEN** the system SHALL update user role

### Requirement: User Management UI

The system SHALL provide a user management page at `/admin/users`.

#### Scenario: View user list
- **WHEN** admin navigates to `/admin/users`
- **THEN** the page SHALL display a table with:
  - User email and name
  - Role badge
  - Status indicator
  - Creation date
  - Actions (view, disable/enable)

#### Scenario: Search users
- **WHEN** admin types in the search input
- **THEN** the user list SHALL filter in real-time

#### Scenario: View user detail page
- **WHEN** admin clicks on a user row
- **THEN** the system SHALL navigate to `/admin/users/:id` detail page

### Requirement: Admin Action Logging

The system SHALL log all admin actions on users.

#### Scenario: Log user disable action
- **WHEN** admin disables a user
- **THEN** the system SHALL create an admin_log entry with:
  - admin_id
  - action: 'user.disable'
  - target_type: 'user'
  - target_id: user_id
  - timestamp
