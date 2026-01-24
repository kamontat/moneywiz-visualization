---
name: "mw.project-archive"
description: "Summarize session work, detect and fix errors, update documentation, and commit all changes with conventional commit message"
agent: "agent"
tools: ["execute", "read", "edit", "search", "web", "svelte/*", "upstash/context7/*"]
model: Claude Opus 4.5 (copilot)
---

# Project Archive: Summary, Fix, and Commit

## Mission

Archive the current chat session by summarizing all work, detecting and fixing potential issues, updating project documentation, and creating a well-structured conventional commit with intelligent staging.

## Scope & Preconditions

- Chat session must contain meaningful changes to summarize
- Repository must be a valid git repository
- User must have commit permissions
- Project documentation files must exist (e.g., README.md, AGENTS.md)

## Workflow

### Phase 1: Session Review & Problem Detection

1. **Review Chat History**: Analyze the current chat session to identify:
   - Code modifications (new features, bug fixes, refactoring)
   - Design decisions and architectural changes
   - Configuration updates (build, deployment, dependencies)
   - Test additions or modifications
   - **Errors encountered during the session**
   - **Workarounds or edge cases discovered**
   - **Documentation gaps or inaccuracies found**

2. **Categorize Changes**: Group changes by type and impact:
   - New features
   - Bug fixes
   - Documentation improvements
   - Configuration changes
   - Test coverage

3. **Detect Potential Problems**: Scan session history and codebase for:
   - **Documentation errors**: Outdated instructions, broken links, incorrect examples
   - **Code inconsistencies**: Mismatches between docs and actual implementation
   - **Configuration issues**: Missing or incorrect settings
   - **Test gaps**: Missing test coverage for new features or fixed bugs
   - **Deprecated patterns**: Old syntax or approaches still documented

### Phase 2: Error Correction & Prevention

4. **Audit Documentation Files**: Review and fix issues in:
   - [README.md](../../README.md) - Verify setup steps, commands, and examples work
   - [AGENTS.md](../../AGENTS.md) - Ensure structure matches actual project
   - [.github/instructions/](../instructions/) - Validate all instruction files are accurate
   - [.github/prompts/](../prompts/) - Verify prompt workflows are correct
   - [.github/skills/](../skills/) - Confirm skill definitions match capabilities

5. **Fix Code & Configuration Issues**: Address problems found:
   - Update outdated code snippets in documentation
   - Fix incorrect paths or file references
   - Correct command syntax and examples
   - Update configuration to handle discovered edge cases
   - Add error handling for problems encountered during session

6. **Prevent Future Issues**: Implement safeguards:
   - Add tests for bugs found during session
   - Update error messages to be more helpful
   - Add validation for common mistakes
   - Document discovered gotchas in relevant files

### Phase 3: Documentation Update

7. **Identify Affected Documentation**: Determine which documentation files need updates:
   - [README.md](../../README.md) - Project overview, setup, usage
   - [AGENTS.md](../../AGENTS.md) - Agent configurations and updates
   - Other relevant documentation files

8. **Update Documentation**: Edit identified files to reflect changes:
   - Maintain existing style and formatting conventions
   - Use clear, concise language
   - Add examples where helpful
   - Update version information if applicable
   - **Include lessons learned from session errors**

9. **Verify Consistency**: Ensure all documentation updates are accurate and consistent with actual changes

### Phase 4: Git Commit

10. **Check Git Status**: Run `git status --porcelain` to see all modified, added, and deleted files

11. **Check Staged Files**: Run `git diff --cached --name-only` to verify if files are already staged:
    - If files are already staged, proceed to step 12
    - If no files are staged, run `git add -A` to stage relevant changes (never stage secrets or credentials)

12. **Analyze Changes**:
    - Run `git diff --staged` to inspect staged changes
    - Run `git diff` for any unstaged work

13. **Determine Commit Type**: Based on changes, select the appropriate conventional commit type:
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

14. **Determine Scope**: Identify the affected area/module (e.g., `auth`, `api`, `ui`, `deps`, `config`, `docs`)

15. **Generate Description**: Create concise description (imperative mood, present tense, <72 characters)

16. **Create Commit**: Execute commit with generated conventional commit message:

    ```bash
    git commit -m "<type>(<scope>): short description" -m "Optional detailed body"
    ```

17. **Verify Commit**: Confirm with `git log -1 --stat` to display the last commit and affected files

## Output Expectations

### Documentation Updates

- **Format**: Updates applied directly to documentation files
- **Content**: Clear, concise summaries following existing documentation style
- **Location**: Updates to README.md, AGENTS.md, and other relevant files

### Error Corrections

- **Code Fixes**: Minimal, targeted fixes with clear rationale
- **Documentation Fixes**: Corrections to outdated or incorrect content
- **Configuration Fixes**: Updates to handle discovered edge cases
- **Tests**: New tests to prevent regression of fixed issues

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

# Error correction commit
fix(docs): correct outdated commands and examples

- Fixed bun command syntax in README
- Updated deprecated Svelte 4 patterns to Svelte 5
- Added missing prerequisites in setup steps
- Corrected broken links in instruction files

# Breaking change
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: API v1 endpoints are no longer supported.
Migrate to v2 endpoints documented at /api/v2/docs
```

## Quality Assurance

### Session Review

- [ ] All errors and issues from chat session are identified
- [ ] Root causes of problems are understood
- [ ] Workarounds are documented for future reference

### Error Correction

- [ ] All identified documentation errors are fixed
- [ ] Code examples are verified to work correctly
- [ ] Configuration issues are resolved
- [ ] Tests are added for discovered bugs

### Documentation

- [ ] All significant changes from chat session are documented
- [ ] Documentation updates follow existing style and formatting
- [ ] Changes are accurate and reflect actual code/config modifications
- [ ] Examples and instructions are clear and actionable
- [ ] Related documentation files are cross-referenced appropriately
- [ ] No broken links or references in updated documentation
- [ ] Lessons learned from errors are incorporated

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
- ❌ NEVER make large refactors without clear documentation of changes
- ✅ ALWAYS verify no secrets are being committed
- ✅ ALWAYS update documentation before committing
- ✅ ALWAYS use conventional commit format
- ✅ ALWAYS provide clear, descriptive commit messages
- ✅ ALWAYS summarize what was done in both docs and commit
- ✅ ALWAYS fix identified errors before finalizing the archive
- ✅ ALWAYS add tests for bugs discovered during the session

## Error Detection Checklist

Use this checklist to scan for common issues:

### Documentation

- [ ] Commands use correct package manager (`bun` not `bunx`/`npm`/`npx`)
- [ ] File paths are correct and files exist
- [ ] Code examples compile/run without errors
- [ ] Instructions match current project structure
- [ ] Links resolve to valid destinations
- [ ] API references match actual implementation

### Code

- [ ] Svelte 5 syntax is used (not Svelte 4 deprecated patterns)
- [ ] Event handlers use `onclick` not `on:click`
- [ ] Imports use correct path aliases (`$lib`, `$components`)
- [ ] Types are accurate and match runtime behavior
- [ ] Error handling covers discovered edge cases

### Configuration

- [ ] Build commands produce expected output
- [ ] Test commands run successfully
- [ ] Environment variables are documented
- [ ] Dependencies are up to date in documentation

## Related Assets

- Related skill: [git-commit](../skills/git-commit/SKILL.md)
- Related instructions: [svelte.instructions.md](../instructions/svelte.instructions.md)
- Related instructions: [mcp-tools.instructions.md](../instructions/mcp-tools.instructions.md)
