# admin-roles Specification

## Purpose
TBD - created by archiving change add-admin-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Character Entity Definition

The system SHALL support character/role definitions for specialized content generation.

#### Scenario: Character schema
- **WHEN** a character is created
- **THEN** it SHALL have:
  - id (UUID)
  - name (character name, e.g., "Professional Writer", "Casual Blogger")
  - description (character description)
  - style_prompt (system prompt for AI generation)
  - is_active (boolean)
  - created_at, updated_at

### Requirement: List Characters

The system SHALL provide an API endpoint to list all characters.

#### Scenario: List all characters
- **WHEN** admin requests `GET /api/admin/characters`
- **THEN** the system SHALL return all character definitions

#### Scenario: List active characters only
- **WHEN** admin requests `GET /api/admin/characters?activeOnly=true`
- **THEN** the system SHALL return only active characters

### Requirement: Create Character

The system SHALL allow admins to create new character definitions.

#### Scenario: Create character
- **WHEN** admin requests `POST /api/admin/characters` with:
  ```json
  {
    "name": "Tech Blogger",
    "description": "Professional tech writer with casual tone",
    "stylePrompt": "You are a professional tech blogger..."
  }
  ```
- **THEN** the system SHALL:
  - Validate required fields
  - Create character record
  - Log the action

#### Scenario: Validation error
- **WHEN** admin submits invalid character data
- **THEN** the system SHALL return 400 with error details

### Requirement: Update Character

The system SHALL allow admins to modify character definitions.

#### Scenario: Update character name
- **WHEN** admin requests `PATCH /api/admin/characters/:id` with `{ "name": "New Name" }`
- **THEN** the system SHALL update the character

#### Scenario: Update style prompt
- **WHEN** admin requests `PATCH /api/admin/characters/:id` with `{ "stylePrompt": "New prompt..." }`
- **THEN** the system SHALL update the style prompt

#### Scenario: Toggle character active status
- **WHEN** admin requests `PATCH /api/admin/characters/:id` with `{ "isActive": false }`
- **THEN** the system SHALL deactivate the character

### Requirement: Delete Character

The system SHALL allow admins to remove character definitions.

#### Scenario: Delete character
- **WHEN** admin requests `DELETE /api/admin/characters/:id`
- **THEN** the system SHALL:
  - Remove the character record
  - Remove any user-character assignments
  - Log the action

### Requirement: User Character Assignment

The system SHALL support assigning characters to users.

#### Scenario: Assign character to user
- **WHEN** admin requests `POST /api/admin/users/:userId/characters` with `{ "characterId": "xxx" }`
- **THEN** the system SHALL create a user_character record

#### Scenario: List user's characters
- **WHEN** admin requests `GET /api/admin/users/:userId/characters`
- **THEN** the system SHALL return characters assigned to that user

#### Scenario: Remove character from user
- **WHEN** admin requests `DELETE /api/admin/users/:userId/characters/:characterId`
- **THEN** the system SHALL remove the assignment

### Requirement: Character Management UI

The system SHALL provide a character management page at `/admin/characters`.

#### Scenario: View character list
- **WHEN** admin navigates to `/admin/characters`
- **THEN** the page SHALL display a table with:
  - Character name
  - Description
  - Status (active/inactive)
  - Usage count
  - Actions (edit, delete)

#### Scenario: Create new character
- **WHEN** admin clicks "Add Character" button
- **THEN** a form dialog SHALL appear with:
  - Name input
  - Description textarea
  - Style prompt textarea (with syntax hints)
  - Save/Cancel buttons

#### Scenario: Edit character
- **WHEN** admin clicks "Edit" on a character
- **THEN** the edit form SHALL pre-populate with existing values

#### Scenario: Character preview
- **WHEN** admin clicks "Preview" on a character
- **THEN** a sample generation preview SHALL be shown (optional future feature)

