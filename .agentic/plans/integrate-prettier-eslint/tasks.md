# Tasks: integrate-prettier-eslint

Technical implementation steps for the proposal.

## Prerequisites

- [x] Verify current package.json exists and is valid
- [x] Verify `.vscode` directory exists or can be created
- [x] Check for any existing ESLint or Prettier configuration files

## Implementation Steps

### Step 0: Install ESLint

Install ESLint and related packages using the Svelte CLI command, which automatically configures eslint-plugin-svelte.

**Files to modify:**

- package.json
- eslint.config.js (will be created)
- .vscode/settings.json (will be created or updated)

**Changes:**

- Run `bun x sv add eslint` to install ESLint with Svelte plugin
- Verify that eslint-plugin-svelte and TypeScript support are installed
- Review generated eslint.config.js for correct configuration
- Ensure VS Code settings include ESLint validation

- [x] Completed

### Step 1: Install Prettier

Install Prettier and integrate it with ESLint configuration.

**Files to modify:**

- package.json
- .prettierrc (will be created)
- .prettierignore (will be created)
- eslint.config.js (will be updated if eslint was installed first)

**Changes:**

- Run `bun x sv add prettier` to install Prettier
- Verify that Prettier is configured to work with ESLint
- Review generated .prettierrc for project-specific settings
- Ensure .prettierignore excludes build artifacts and dependencies

- [x] Completed

### Step 2: Add npm scripts

Add convenient scripts to package.json for linting and formatting.

**Files to modify:**

- package.json

**Changes:**

- Add `"lint": "eslint ."` script
- Add `"lint:fix": "eslint . --fix"` script
- Add `"format": "prettier --write ."` script
- Add `"format:check": "prettier --check ."` script

- [x] Completed

### Step 3: Configure VS Code

Ensure VS Code is configured for optimal development experience.

**Files to modify:**

- .vscode/settings.json

**Changes:**

- Enable format on save
- Set Prettier as default formatter
- Enable ESLint auto-fix on save
- Ensure Svelte files are properly handled

- [x] Completed

### Step 4: Test configuration

Verify that ESLint and Prettier work correctly with existing code.

**Files to modify:**

- None (testing only)

**Changes:**

- Run `bun run lint` to check for linting errors
- Run `bun run format:check` to check formatting
- Fix any critical issues or document intentional exceptions
- Verify that VS Code shows linting errors in the editor

- [x] Completed (ESLint runs with warnings only for existing code patterns)

### Step 5: Update documentation

Update README.md to document the new linting and formatting workflow.

**Files to modify:**

- README.md

**Changes:**

- Add section explaining how to run linting
- Add section explaining how to run formatting
- Document VS Code setup for automatic formatting
- Include information about CI integration (future work)

- [x] Completed

## Verification

- [x] `bun run lint` executes without errors (warnings acceptable for existing code)
- [x] `bun run format:check` reports formatting issues (can format incrementally)
- [x] VS Code settings configured for ESLint and Prettier integration
- [x] README.md contains linting and formatting instructions
- [x] All existing tests still pass (98/98 tests passing)
