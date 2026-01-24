---
name: 'mw.project-archive'
description: 'Summarize session work, update documentation, and commit all changes with conventional commit message'
agent: 'agent'
tools: ['execute', 'read', 'edit', 'search', 'web', 'upstash/context7/*']
model: Claude Opus 4.5 (copilot)
---

# Project Archive: Summary and Commit

## Mission

Archive the current chat session by summarizing all work, updating project documentation, and creating a well-structured conventional commit with intelligent staging.

## Scope & Preconditions

- Chat session must contain meaningful changes to summarize
- Repository must be a valid git repository
- User must have commit permissions
- Project documentation files must exist (e.g., README.md, AGENTS.md)

## Workflow

### Phase 1: Documentation Summary

1. **Review Chat History**: Analyze the current chat session to identify all meaningful changes:
   - Code modifications (new features, bug fixes, refactoring)
   - Design decisions and architectural changes
   - Configuration updates (build, deployment, dependencies)
   - Test additions or modifications

2. **Categorize Changes**: Group changes by type and impact:
   - New features
   - Bug fixes
   - Documentation improvements
   - Configuration changes
   - Test coverage

3. **Identify Affected Documentation**: Determine which documentation files need updates:
   - [README.md](../../README.md) - Project overview, setup, usage
   - [AGENTS.md](../../AGENTS.md) - Agent configurations and updates
   - Other relevant documentation files

4. **Update Documentation**: Edit identified files to reflect changes:
   - Maintain existing style and formatting conventions
   - Use clear, concise language
   - Add examples where helpful
   - Update version information if applicable

5. **Verify Consistency**: Ensure all documentation updates are accurate and consistent with actual changes

### Phase 2: Git Commit

6. **Check Git Status**: Run `git status --porcelain` to see all modified, added, and deleted files

7. **Check Staged Files**: Run `git diff --cached --name-only` to verify if files are already staged:
   - If files are already staged, proceed to step 8
   - If no files are staged, run `git add -A` to stage relevant changes (never stage secrets or credentials)

8. **Analyze Changes**:
   - Run `git diff --staged` to inspect staged changes
   - Run `git diff` for any unstaged work

9. **Determine Commit Type**: Based on changes, select the appropriate conventional commit type:
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

10. **Determine Scope**: Identify the affected area/module (e.g., `auth`, `api`, `ui`, `deps`, `config`, `docs`)

11. **Generate Description**: Create concise description (imperative mood, present tense, <72 characters)

12. **Create Commit**: Execute commit with generated conventional commit message:
    ```bash
    git commit -m "<type>(<scope>): short description" -m "Optional detailed body"
    ```

13. **Verify Commit**: Confirm with `git log -1 --stat` to display the last commit and affected files

## Output Expectations

### Documentation Updates

- **Format**: Updates applied directly to documentation files
- **Content**: Clear, concise summaries following existing documentation style
- **Location**: Updates to README.md, AGENTS.md, and other relevant files

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
# Documentation updates with code changes
feat(dashboard): add summary cards and update docs

- Added THB summary cards for income/expenses
- Updated AGENTS.md with recent improvements
- Documented debug logging system

# Pure documentation
docs(agents): restructure AGENTS.md and split instructions

Moved project-specific configuration to separate instruction
file for better organization and token efficiency.

# Breaking change
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: API v1 endpoints are no longer supported.
Migrate to v2 endpoints documented at /api/v2/docs
```

## Quality Assurance

### Documentation
- [ ] All significant changes from chat session are documented
- [ ] Documentation updates follow existing style and formatting
- [ ] Changes are accurate and reflect actual code/config modifications
- [ ] Examples and instructions are clear and actionable
- [ ] Related documentation files are cross-referenced appropriately
- [ ] No broken links or references in updated documentation

### Git Commit
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
- ❌ NEVER commit secrets or credentials
- ✅ ALWAYS verify no secrets are being committed
- ✅ ALWAYS update documentation before committing
- ✅ ALWAYS use conventional commit format
- ✅ ALWAYS provide clear, descriptive commit messages
- ✅ ALWAYS summarize what was done in both docs and commit

## Related Assets

- Related skill: [git-commit](../skills/git-commit/SKILL.md)
