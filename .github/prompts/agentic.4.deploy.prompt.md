# Deploy Phase

Update documentation and create git commit.

## User Input

None required by default. This phase uses context from the conversation and git state.

The user may optionally provide:

- Custom commit message
- Specific files to include/exclude
- Request to skip documentation updates
- Request to push to remote

## Prerequisites

Before proceeding, verify the following:

1. Review git status to understand current changes
2. If user input conflicts with best practices (e.g., committing sensitive data), warn before proceeding
3. Ensure all tests pass before committing

## Instructions

1. **Read Context**
   - Read all memory files in `.agentic/memories/`

2. **Review Changes**
   - Run `git status` to see modified files
   - Run `git diff` to understand all modifications

3. **Identify Documentation Updates**
   - Determine which docs need updates based on changes made

4. **Update Documentation**
   - Update relevant documentation files

5. **Stage Changes**
   - Stage files selectively (avoid staging unrelated files)

6. **Create Commit**
   - Write descriptive commit message
   - Include co-author attribution

## Documentation Guidelines

### When to Update

- **README.md** - Public API or usage changed, installation steps changed, CLI commands changed, configuration options changed, new dependencies
- **docs/** - Detailed API changes, new guides needed, architecture affected, configuration reference
- **CHANGELOG.md** - If project maintains a changelog

### When NOT to Update

- Internal refactoring with no external impact
- Bug fixes that don't change expected behavior
- Test-only changes
- Code style or formatting changes

## Commit Message Format

Follow conventional commits if the project uses them:

```
<type>: <short summary>

<optional body explaining what and why>

Plan: <plan-name>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example:

```
feat: add user authentication system

Implement login/register with JWT tokens.
- Add User model and auth service
- Create login/register API endpoints
- Add session management middleware

Plan: add-user-auth

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Pre-Commit Checklist

Before committing, verify:

- **Tests** - All tests pass
- **Staged files** - No unintended files staged
- **Commit message** - Accurately describes changes
- **Documentation** - Reflects current behavior
- **Security** - No sensitive data (keys, passwords) in commit

## Output

- Updated documentation (if applicable)
- Git commit with all changes
- Summary of what was committed

## Rules

- Only update documentation directly affected by the changes
- Do not add unnecessary documentation
- Write clear, concise commit messages
- Always include "Co-Authored-By" for AI-assisted work
- Do not push to remote unless explicitly requested
- Follow repository's existing commit message conventions
- Stage files selectively - avoid `git add .` if there are unrelated changes
- If unsure about documentation updates, ask user
