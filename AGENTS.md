# AGENTS.md - Development Guide for Gauss-CLI

This file provides guidelines and commands for agents working on this codebase.

## Project Overview

CodeCheck is a TypeScript-based command-line tool for checking code quality, articles, and XSS vulnerabilities. It uses the Commander.js library for CLI parsing and supports glob pattern matching for file selection.

## Package Manager

**pnpm** is the package manager. Use `pnpm install` instead of npm.

## Build Commands

```bash
# Install dependencies
pnpm install

# Build the project (compiles TypeScript to dist/)
pnpm run build
# or: pnpm build

# Lint the code
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# No test framework is currently configured
```

## Running a Single Test

There are no tests in this project. If tests are added in the future, use the appropriate test runner command.

## Code Style Guidelines

### TypeScript Configuration

- Strict mode is enabled in `tsconfig.json`
- Module resolution: `nodenext`
- ES modules are used (`.js` extension in imports is required)
- Path alias: `@/` maps to `src/` directory

### Imports

```typescript
// Use @/ for imports from src/
import { findFiles } from '@/utils/file.js';
import Table from 'cli-table3';

// Use explicit .js extension for local imports
import { checkCode } from './commands/check-code.js';
```

### Formatting

- **Indentation**: 2 spaces (enforced by ESLint and Prettier)
- **Print width**: 120 characters
- **Quotes**: Single quotes
- **Trailing commas**: None
- **Semicolons**: Required

### Naming Conventions

- **Interfaces**: PascalCase (e.g., `CodeStats`)
- **Types**: PascalCase
- **Functions**: camelCase (e.g., `checkCode`, `findFiles`)
- **Variables**: camelCase
- **Constants**: camelCase
- **Files**: kebab-case (e.g., `check-code.ts`)

### Error Handling

- Use `console.log` for output messages
- Return early with messages when no results found
- No custom error classes currently defined

### ESLint Rules

- Extends TypeScript ESLint recommended rules
- 2-space indentation with SwitchCase: 1

### Prettier Configuration

```json
{
  "tabWidth": 2,
  "printWidth": 120,
  "singleQuote": true,
  "trailingComma": "none"
}
```

## Project Structure

```
src/
├── index.ts           # Entry point, CLI definition
├── commands/
│   ├── check-code.ts
│   ├── check-article.ts
│   └── check-xss.ts
└── utils/
    └── file.ts        # File handling utilities
```

## CLI Commands

```bash
# Check articles
codecheck check article --path <directory>

# Check code
codecheck check code --path <directory>

# Check XSS vulnerabilities
codecheck check xss --path <directory>
```

## Best Practices

1. Always add `.js` extension to local imports when using ES modules
2. Use the `@/` path alias for imports from the `src/` directory
3. Run `pnpm run lint` before committing
4. Run `pnpm run build` to compile before publishing
5. Follow existing code patterns in the codebase
6. Use TypeScript interfaces for type definitions
7. Keep functions focused and single-purpose
