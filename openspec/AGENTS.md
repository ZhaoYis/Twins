# OpenSpec Agents Guide

This document explains how AI assistants (and humans) should work with the OpenSpec workflow in this project.

## What is OpenSpec?

OpenSpec is a spec-driven development workflow that helps you plan, implement, and track changes to your codebase. It ensures that:

1. Changes are well-documented before implementation
2. Requirements are captured as testable specifications
3. Tasks are tracked and verified
4. Spec deltas show what capabilities were added/modified/removed

## Directory Structure

```
openspec/
├── project.md           # Project context, tech stack, conventions
├── specs/               # Current active specifications
│   └── {capability}/
│       └── spec.md      # Requirements and scenarios
├── changes/             # Change proposals
│   ├── {change-id}/     # Active changes
│   │   ├── proposal.md  # Why, what, impact, success criteria
│   │   ├── design.md    # Architecture decisions (optional)
│   │   ├── tasks.md     # Implementation checklist
│   │   └── specs/       # Spec deltas for this change
│   └── archive/         # Completed changes
│       └── {date}-{id}/
└── AGENTS.md            # This file
```

## The OpenSpec Workflow

### Phase 1: Proposal (`/openspec:proposal`)

**When to use**: You want to plan a new feature, refactor, or significant change.

**What happens**:
1. AI reads `project.md` to understand context
2. Creates a unique verb-led change ID (e.g., `add-user-notifications`)
3. Creates `proposal.md` with:
   - **Why**: Problem statement and motivation
   - **What Changes**: New capabilities, affected areas
   - **Impact**: Affected specs, code, breaking changes
   - **Success Criteria**: How to verify completion
   - **Open Questions**: Items needing clarification
4. Creates `design.md` if the change spans multiple systems
5. Creates spec deltas in `specs/{capability}/spec.md`
6. Creates `tasks.md` with ordered implementation steps
7. Validates everything with `openspec validate`

**Your role**: Review the proposal, answer open questions, and approve before implementation.

### Phase 2: Apply (`/openspec:apply`)

**When to use**: You've approved a proposal and want to implement it.

**What happens**:
1. AI reads `proposal.md`, `design.md`, and `tasks.md`
2. Works through tasks sequentially
3. Updates `tasks.md` checkboxes as work progresses
4. Keeps changes minimal and focused on the proposal scope
5. Marks all tasks complete when done

**Your role**: Monitor progress, provide feedback, request changes if needed.

### Phase 3: Archive (`/openspec:archive`)

**When to use**: Implementation is complete and tested.

**What happens**:
1. Moves change folder to `changes/archive/{date}-{id}/`
2. Merges spec deltas into `specs/` directory
3. Updates affected specifications
4. Validates all specs are consistent

**Your role**: Verify the archive completed successfully.

## Available Commands

| Command | Description |
|---------|-------------|
| `/openspec:proposal <description>` | Create a new change proposal |
| `/openspec:apply <change-id>` | Implement an approved change |
| `/openspec:archive <change-id>` | Archive a completed change |
| `openspec list` | List all changes (active and archived) |
| `openspec show <id>` | View change details |
| `openspec validate` | Validate all specs and changes |

## Specification Format

Each `spec.md` follows this structure:

```markdown
# {capability} Specification

## Purpose
Brief description of what this capability provides.

## Requirements

### Requirement: {Requirement Name}

The system SHALL {behavior description}.

#### Scenario: {Scenario Name}
- **WHEN** {condition}
- **THEN** the system SHALL {expected behavior}

#### Scenario: {Another Scenario}
- **WHEN** {condition}
- **THEN** the system SHALL {expected behavior}
```

## Spec Deltas

When proposing changes, spec deltas use these sections:

```markdown
## ADDED Requirements
<!-- New requirements being introduced -->

## MODIFIED Requirements
<!-- Changes to existing requirements -->

## REMOVED Requirements
<!-- Requirements being deprecated -->
```

## Best Practices

### For AI Assistants

1. **Always read project.md first** - Understand the tech stack and conventions
2. **Keep proposals minimal** - Don't over-engineer; focus on the requested change
3. **Write testable scenarios** - Each scenario should be verifiable
4. **Update tasks.md progressively** - Mark tasks in_progress and completed as you work
5. **Validate before submitting** - Run `openspec validate --strict`

### For Users

1. **Review proposals carefully** - This is your chance to catch issues early
2. **Answer open questions** - Clarify ambiguities before implementation
3. **Request changes** - Don't hesitate to ask for modifications
4. **Test after apply** - Verify the implementation meets success criteria

## Example Workflow

```
User: "/openspec:proposal add email notifications for new content"

AI:
1. Creates `changes/add-email-notifications/`
2. Writes proposal.md with why (users want alerts), what (email service, templates)
3. Creates design.md for email architecture decisions
4. Writes spec deltas in `specs/email-notifications/spec.md`
5. Creates tasks.md with implementation steps
6. Validates and presents for review

User: Reviews, asks questions, approves

User: "/openspec:apply add-email-notifications"

AI:
1. Works through tasks.md sequentially
2. Implements email service, templates, API endpoints
3. Updates task checkboxes as work progresses
4. Marks all complete when done

User: Tests the feature

User: "/openspec:archive add-email-notifications"

AI:
1. Moves to archive with timestamp
2. Merges specs into active specs directory
3. Validates everything is consistent
```

## Tips

- **Small changes don't need OpenSpec** - Use your judgment for simple fixes
- **Architecture decisions go in design.md** - Not in the proposal
- **Scenarios should be concrete** - Use specific examples, not abstractions
- **Dependencies in tasks.md** - Note which tasks block others
- **Keep specs focused** - One capability per spec directory
