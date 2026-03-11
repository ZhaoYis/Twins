## ADDED Requirements

### Requirement: List Style Profiles

The system SHALL provide an API endpoint to list all style profiles.

#### Scenario: List profiles with pagination
- **WHEN** admin requests `GET /api/admin/profiles?page=1&limit=20`
- **THEN** the system SHALL return paginated profile list with:
  - id, article_count, created_at, updated_at
  - user email
  - Tone analysis summary (formality score)

#### Scenario: Filter by article count
- **WHEN** admin requests `GET /api/admin/profiles?minArticles=5`
- **THEN** the system SHALL return profiles with at least 5 articles

### Requirement: View Style Profile Details

The system SHALL provide an API endpoint to view complete style DNA.

#### Scenario: Get profile by ID
- **WHEN** admin requests `GET /api/admin/profiles/:id`
- **THEN** the system SHALL return:
  - Complete tone analysis (formality, emotional tone, audience)
  - Structure patterns (sentence/paragraph length, transitions)
  - Vocabulary preferences (complexity, phrases)
  - Writing quirks (punctuation, signatures)
  - Raw AI analysis text
  - Source article count
  - User info

#### Scenario: Get profile with source articles
- **WHEN** admin requests `GET /api/admin/profiles/:id?includeArticles=true`
- **THEN** the system SHALL also return:
  - List of source article titles and content previews

#### Scenario: Profile not found
- **WHEN** admin requests non-existent profile ID
- **THEN** the system SHALL return 404 Not Found

### Requirement: Delete Style Profile

The system SHALL allow admins to delete style profiles.

#### Scenario: Delete profile
- **WHEN** admin requests `DELETE /api/admin/profiles/:id`
- **THEN** the system SHALL:
  - Remove the style profile record
  - NOT delete source articles
  - Log the action

### Requirement: Rebuild Style Profile

The system SHALL allow admins to trigger style profile rebuild.

#### Scenario: Trigger profile rebuild
- **WHEN** admin requests `POST /api/admin/profiles/:id/rebuild`
- **THEN** the system SHALL:
  - Re-analyze all user articles
  - Update the style profile
  - Log the action

### Requirement: Style Profile Management UI

The system SHALL provide a style profile management page at `/admin/profiles`.

#### Scenario: View profile list
- **WHEN** admin navigates to `/admin/profiles`
- **THEN** the page SHALL display a table with:
  - User email
  - Article count
  - Formality score (visual indicator)
  - Last updated date
  - Actions (view, delete, rebuild)

#### Scenario: View profile DNA visualization
- **WHEN** admin clicks on a profile row
- **THEN** a detail view SHALL show:
  - Visual representation of tone analysis
  - Structure pattern metrics
  - Vocabulary breakdown
  - Writing quirks list
  - Raw analysis text

#### Scenario: View source articles
- **WHEN** admin expands "Source Articles" section
- **THEN** a list of source articles SHALL be displayed
