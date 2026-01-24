---
name: mw.git-commit
agent: agent
description: "Analyze current changes and create a conventional commit with intelligent staging and message generation"
model: GPT-5 mini
tools: ['read', 'search', 'web', 'askQuestions']
---

# Git Commit Current Changes

Analyze all current changes in the repository and create a well-structured conventional commit.

## Process

1. **Check Git Status**: Run `git status --porcelain` to see all modified, added, and deleted files
2. **Analyze Changes**: Run `git diff` for unstaged changes and `git diff --staged` for staged changes
3. **Determine Commit Type**: Based on the changes, determine the appropriate conventional commit type:
   - `feat`: New feature or functionality
   - `fix`: Bug fix
   - `docs`: Documentation changes only
   - `style`: Code style/formatting (no logic changes)
   - `refactor`: Code refactoring (no feature/fix)
   - `perf`: Performance improvements
   - `test`: Adding or updating tests
   - `build`: Build system or dependency changes
   - `ci`: CI/CD configuration changes
   - `chore`: Maintenance or miscellaneous tasks
4. **Determine Scope**: Identify the area/module affected (e.g., `auth`, `api`, `ui`, `deps`, `config`)
5. **Generate Description**: Create a concise description (imperative mood, present tense, <72 chars)
6. **Stage Files**: Stage all relevant files with `git add -A` or stage specific logical groups
7. **Create Commit**: Execute the commit with the generated conventional commit message
8. **Verify**: Show the commit log to confirm successful commit

## Commit Message Format

```
<type>[optional scope]: <description>

[optional body with bullet points explaining changes]

[optional footer for breaking changes or issue references]
```

## Guidelines

- **Never commit secrets** (.env files, API keys, credentials)
- **Group related changes** into logical commits when possible
- **Use imperative mood**: "add feature" not "added feature"
- **Keep description under 72 characters** for better readability
- **Include body** for complex changes explaining what and why
- **Reference issues** when applicable (e.g., `Closes #123`, `Refs #456`)
- **Breaking changes**: Use `!` after type/scope or add `BREAKING CHANGE:` footer

## Example Commits

```bash
# Simple feature
feat(auth): add OAuth2 login support

# Bug fix with body
fix(api): prevent race condition in user session

Race condition occurred when multiple requests tried to update
the same session simultaneously. Added mutex lock to serialize
access.

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: API v1 endpoints are no longer supported.
Migrate to v2 endpoints documented at /api/v2/docs
```

## Safety Rules

- ❌ NEVER update git config without explicit user request
- ❌ NEVER use `--force` or hard reset without confirmation
- ❌ NEVER skip hooks with `--no-verify` unless requested
- ❌ NEVER force push to main/master branches
- ✅ ALWAYS verify no secrets are being committed
- ✅ ALWAYS use conventional commit format
- ✅ ALWAYS provide clear, descriptive commit messages
