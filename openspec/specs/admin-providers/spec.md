# admin-providers Specification

## Purpose
TBD - created by archiving change add-admin-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Global Provider Configuration

The system SHALL support system-level AI provider configuration separate from user-provided keys.

#### Scenario: Provider schema
- **WHEN** a global provider is created
- **THEN** it SHALL have:
  - id (UUID)
  - provider ('openai' | 'anthropic')
  - name (display name)
  - encrypted_key (encrypted API key)
  - is_active (boolean)
  - rate_limit (optional requests per minute)
  - created_at, updated_at

### Requirement: List Providers

The system SHALL provide an API endpoint to list all global providers.

#### Scenario: List all providers
- **WHEN** admin requests `GET /api/admin/providers`
- **THEN** the system SHALL return all provider configurations
- **AND** API keys SHALL be masked (showing only last 4 characters)

### Requirement: Create Provider

The system SHALL allow admins to add new AI provider configurations.

#### Scenario: Create OpenAI provider
- **WHEN** admin requests `POST /api/admin/providers` with:
  ```json
  {
    "provider": "openai",
    "name": "Primary OpenAI",
    "apiKey": "sk-...",
    "rateLimit": 100
  }
  ```
- **THEN** the system SHALL:
  - Encrypt and store the API key
  - Create provider record
  - Log the action

#### Scenario: Invalid API key format
- **WHEN** admin provides invalid API key format
- **THEN** the system SHALL return 400 with validation error

### Requirement: Update Provider

The system SHALL allow admins to modify provider configurations.

#### Scenario: Update provider name
- **WHEN** admin requests `PATCH /api/admin/providers/:id` with `{ "name": "New Name" }`
- **THEN** the system SHALL update the provider name

#### Scenario: Update API key
- **WHEN** admin requests `PATCH /api/admin/providers/:id` with `{ "apiKey": "new-key" }`
- **THEN** the system SHALL encrypt and store the new key

#### Scenario: Toggle provider active status
- **WHEN** admin requests `PATCH /api/admin/providers/:id` with `{ "isActive": false }`
- **THEN** the system SHALL deactivate the provider

### Requirement: Delete Provider

The system SHALL allow admins to remove provider configurations.

#### Scenario: Delete provider
- **WHEN** admin requests `DELETE /api/admin/providers/:id`
- **THEN** the system SHALL permanently remove the provider record

### Requirement: Provider Usage Stats

The system SHALL provide provider usage statistics.

#### Scenario: View provider stats
- **WHEN** admin views provider detail
- **THEN** the system SHALL display:
  - Total requests count
  - Requests this month
  - Error rate
  - Last used timestamp

### Requirement: Provider Management UI

The system SHALL provide a provider management page at `/admin/providers`.

#### Scenario: View provider list
- **WHEN** admin navigates to `/admin/providers`
- **THEN** the page SHALL display a table with:
  - Provider name and type
  - Status (active/inactive)
  - Rate limit
  - Usage stats
  - Actions (edit, delete)

#### Scenario: Add new provider
- **WHEN** admin clicks "Add Provider" button
- **THEN** a form dialog SHALL appear with:
  - Provider type dropdown
  - Name input
  - API key input (masked)
  - Rate limit input
  - Save/Cancel buttons

