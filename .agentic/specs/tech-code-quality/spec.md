# Spec: tech-code-quality

## Purpose

Defines the code quality tools, linting rules, and formatting standards for the MoneyWiz Visualization project to ensure consistent, maintainable, and error-free code.

## Requirements

### Requirement: ESLint Configuration

The application SHALL use ESLint for code linting with Svelte and TypeScript support.

#### Scenario: ESLint Setup

- **Given** the project uses Svelte 5 and TypeScript
- **Then** ESLint MUST be configured with `eslint-plugin-svelte`
- **And** ESLint MUST be configured with `typescript-eslint`
- **And** ESLint MUST use the flat config format (`eslint.config.js`)
- **And** ESLint MUST integrate with Prettier via `eslint-config-prettier`

#### Scenario: ESLint Rules

- **Given** code is being linted
- **Then** `@typescript-eslint/no-explicit-any` SHOULD be a warning (for gradual migration)
- **And** `@typescript-eslint/no-unused-vars` SHOULD allow underscore-prefixed variables
- **And** `svelte/require-each-key` SHOULD be a warning (for gradual migration)
- **And** `no-undef` MUST be disabled (TypeScript handles this)

### Requirement: Prettier Configuration

The application SHALL use Prettier for code formatting.

#### Scenario: Prettier Setup

- **Given** code files need consistent formatting
- **Then** Prettier MUST be configured via `.prettierrc`
- **And** Prettier MUST use `prettier-plugin-svelte` for Svelte files
- **And** Prettier MUST use `prettier-plugin-tailwindcss` for class sorting
- **And** `.prettierignore` MUST exclude build artifacts and lock files

#### Scenario: Formatting Rules

- **Given** code is being formatted
- **Then** indentation MUST use tabs
- **And** strings MUST use single quotes
- **And** trailing commas MUST NOT be used
- **And** print width MUST be 100 characters

### Requirement: NPM Scripts

The application SHALL provide convenient scripts for code quality tasks.

#### Scenario: Available Scripts

- **Given** a developer needs to run code quality checks
- **Then** `bun run check` MUST run format:check, lint:check, and svelte:check
- **And** `bun run fix` MUST run format and lint to auto-fix issues
- **And** `bun run lint` MUST run ESLint with auto-fix
- **And** `bun run lint:check` MUST run ESLint without auto-fix
- **And** `bun run format` MUST run Prettier with write mode
- **And** `bun run format:check` MUST run Prettier in check mode
- **And** `bun run svelte:check` MUST run svelte-check for type validation

### Requirement: VS Code Integration

The application SHALL configure VS Code for optimal developer experience.

#### Scenario: Editor Settings

- **Given** a developer uses VS Code
- **Then** format on save MUST be enabled
- **And** Prettier MUST be the default formatter
- **And** ESLint auto-fix on save MUST be enabled
- **And** Svelte files MUST use the Svelte extension formatter

### Requirement: Validation Workflow

The application SHALL enforce a validation workflow after code changes.

#### Scenario: Code Modification Workflow

- **Given** code has been modified
- **Then** developers MUST run `bun run fix` first
- **And** developers MUST run `bun run check` to validate
- **And** if problems remain, developers MUST manually fix them

### Requirement: E2E Testing Location

Application flow tests SHALL be located in the `e2e/` directory.

#### Scenario: Route Logic Testing

- **Given** a new route or page logic is created
- **Then** tests MUST be implemented as E2E tests in `e2e/`
- **And** tests MUST NOT be co-located as `.spec.ts` in `src/routes/`
- **And** co-located tests in `src/routes/` SHOULD be reserved for unit testing utility functions or complex Svelte components only (excluding page flows)

#### Scenario: Test Data Isolation

- **Given** an E2E test runs
- **Then** it MUST generate its own isolated CSV data
- **And** it MUST NOT rely on shared static files like `static/data/report.csv`

## Constraints

- ESLint must use flat config format (eslint.config.js)
- Prettier must integrate with ESLint without conflicts
- All TypeScript, JavaScript, and Svelte files must pass linting
- All files must be formatted according to Prettier rules
- VS Code settings must be committed to the repository

## Examples

### Example: ESLint Config Structure

```javascript
import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default defineConfig(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		rules: {
			'no-undef': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	}
);
```

### Example: Prettier Config

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"]
}
```

### Example: Validation Commands

```bash
# Auto-fix issues
bun run fix

# Validate (should pass after fix)
bun run check

# Individual checks
bun run format:check
bun run lint:check
bun run svelte:check
```

## Notes

This code quality setup ensures:

- **Consistency**: All code follows the same style and patterns
- **Error Prevention**: ESLint catches potential bugs and anti-patterns
- **Developer Experience**: Auto-formatting and auto-fix reduce manual work
- **CI Ready**: Scripts can be used in CI/CD pipelines (future enhancement)

The gradual migration approach (warnings instead of errors for some rules) allows the team to improve code quality incrementally without blocking development.
