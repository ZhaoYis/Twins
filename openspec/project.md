# Project Context

## Purpose
Digital Twins App - An application for managing digital twins and virtual representations. The system enables creation, management, and interaction with digital twin entities that mirror real-world objects, systems, or processes.

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Framework**: Full-stack monolith (e.g., Next.js or similar)
- **Database**: [To be determined based on requirements]
- **Testing**: Vitest or Jest for unit tests

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- ES modules (ESM) syntax
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for literal types
- Async/await over Promise chains
- Descriptive variable names; avoid abbreviations

### Architecture Patterns
- **Monolithic architecture** - Single codebase with clear module boundaries
- Layered structure: API routes → Services → Data layer
- Feature-based organization within src/
- Dependency injection for testability
- Single source of truth for business logic

### Testing Strategy
- Unit tests with Vitest/Jest
- Focus on business logic and service layer
- Mock external dependencies
- Aim for meaningful coverage over percentage metrics

### Git Workflow
- **Git Flow** with release branches
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - feature branches from develop
- `release/*` - release preparation branches
- `hotfix/*` - production fixes

## Domain Context
**Digital Twins**: Virtual representations of physical entities, processes, or systems. Key concepts:
- Twin entity lifecycle (create, update, sync, delete)
- State synchronization between physical and digital
- Metadata and properties management
- Relationships between twins

## Important Constraints
- TypeScript strict mode - no `any` types without justification
- Single codebase maintainability
- Clear separation between business logic and presentation

## External Dependencies
- [To be documented as dependencies are added]
