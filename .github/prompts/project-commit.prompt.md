---
name: 'mw.project-commit'
description: 'Analyze changes and create conventional commit with intelligent staging and message generation'
agent: 'agent'
model: 'GPT-5 mini'
tools: ['read', 'search', 'web', 'askQuestions']
---

# Git Commit Current Changes

## Mission

Analyze all current changes in the repository and create a well-structured conventional commit with intelligent staging and proper message formatting.

## Scope & Preconditions

- Repository must be a valid git repository
- User must have commit permissions
- Related skill: [git-commit](../skills/git-commit/SKILL.md)

## Workflow

1. **Check Git Status**: Run `git status --porcelain` to see all modified, added, and deleted files
2. **Check Staged Files**: Run `git diff --cached --name-only` to verify if files are already staged:
   - If files are already staged, proceed to step 3
   - If no files are staged, run `git add -A` to stage relevant changes (never stage secrets or credentials)
3. **Analyze Changes**:
   - Run `git diff --staged` to inspect staged changes
   - Run `git diff` for any unstaged work
4. **Determine Commit Type**: Based on changes, select the appropriate conventional commit type:
   - `feat` - New feature or functionality
   - `fix` - Bug fix
   - `docs` - Documentation changes only
   - `style` - Code style/formatting (no logic changes)
   - `refactor` - Code refactoring (no feature/fix)
   - `perf` - Performance improvements
   - `test` - Adding or updating tests
   - `build` - Build system or dependency changes
   - `ci` - CI/CD configuration changes
   - `chore` - Maintenance or miscellaneous tasks
5. **Determine Scope**: Identify the affected area/module (e.g., `auth`, `api`, `ui`, `deps`, `config`)
6. **Generate Description**: Create concise description (imperative mood, present tense, <72 characters)
7. **Create Commit**: Execute commit with generated conventional commit message:
   ```bash
   git commit -m "<type>(<scope>): short description" -m "Optional detailed body"
   ```
8. **Verify Commit**: Confirm with `git log -1 --stat` to display the last commit and affected files

## Output Expectations

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body with bullet points explaining changes]

[optional footer for breaking changes or issue references]
```

### Guidelines

- Never commit secrets (.env files, API keys, credentials)
- Group related changes into logical commits when possible
- Use imperative mood: "add feature" not "added feature"
- Keep description under 72 characters for better readability
- Include body for complex changes explaining what and why
- Reference issues when applicable (e.g., `Closes #123`, `Refs #456`)
- Breaking changes: Use `!` after type/scope or add `BREAKING CHANGE:` footer

### Example Commits

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

## Quality Assurance

- [ ] No secrets, credentials, or sensitive data are staged
- [ ] Commit type accurately reflects the nature of changes
- [ ] Scope correctly identifies the affected area
- [ ] Description is imperative mood, present tense, <72 characters
- [ ] Complex changes include explanatory body text
- [ ] Related issues are referenced in footer
- [ ] Breaking changes are properly marked with `!` or footer
- [ ] Commit verified with `git log -1 --stat`

## Guard Rails

- ❌ NEVER update git config without explicit user request
- ❌ NEVER use `--force` or hard reset without confirmation
- ❌ NEVER skip hooks with `--no-verify` unless requested
- ❌ NEVER force push to main/master branches
- ✅ ALWAYS verify no secrets are being committed
- ✅ ALWAYS use conventional commit format
- ✅ ALWAYS provide clear, descriptive commit messages
