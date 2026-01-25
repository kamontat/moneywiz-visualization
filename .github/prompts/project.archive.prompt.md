---
description: Archive work session—review, fix errors, update docs, archive OpenSpec changes, and commit
model: Claude Sonnet 4.5 (copilot)
---

<!-- PROJECT WRAPPER: This prompt combines session archival + OpenSpec change archival -->

$ARGUMENTS

## Mission

Archive the current work session by:
1. Reviewing and categorizing all work done
2. Detecting and fixing errors, inconsistencies, or documentation gaps
3. Archiving any deployed OpenSpec changes
4. Updating project documentation
5. Creating a well-structured conventional commit

## Scope & Preconditions

- Chat session must contain meaningful changes to archive
- Repository must be a valid git repository with commit permissions
- Project documentation files exist (README.md, AGENTS.md, instructions, skills)
- If OpenSpec changes were implemented, they must be validated and ready to archive

## Inputs

- **Change ID** (${input:changeId}): Optional OpenSpec change ID to archive (leave empty if no OpenSpec work)
- **Session Context**: The current chat session history and changes made

## Workflow

### Phase 1: Session Review & Problem Detection

1. **Review Chat History**:
   - Analyze the current chat session to identify:
     * Code modifications (features, fixes, refactoring)
     * Design decisions and architectural changes
     * Configuration updates (build, deployment, dependencies)
     * Test additions or modifications
     * **Errors encountered during the session**
     * **Workarounds or edge cases discovered**
     * **Documentation gaps or inaccuracies found**

2. **Categorize Changes**:
   - Group changes by type and impact:
     * New features
     * Bug fixes
     * Documentation improvements
     * Configuration changes
     * Test coverage
     * OpenSpec changes (proposals, implementations, archives)

3. **Detect Potential Problems**:
   - Scan session history and codebase for:
     * **Documentation errors**: Outdated instructions, broken links, incorrect examples
     * **Code inconsistencies**: Mismatches between docs and implementation
     * **Configuration issues**: Missing or incorrect settings
     * **Test gaps**: Missing coverage for new features or fixed bugs
     * **Deprecated patterns**: Old syntax still documented (e.g., Svelte 4 vs 5)

### Phase 2: Error Correction & Prevention

4. **Audit Documentation Files**:
   - Review and fix issues in:
     * [README.md](../../README.md) - Verify setup steps, commands, examples
     * [AGENTS.md](../../AGENTS.md) - Ensure structure matches actual project
     * [.github/instructions/](../instructions/) - Validate instruction accuracy
     * [.github/prompts/](../prompts/) - Verify prompt workflows
     * [.github/skills/](../skills/) - Confirm skill definitions

5. **Fix Code & Configuration Issues**:
   - Address problems found:
     * Update outdated code snippets in documentation
     * Fix incorrect paths or file references
     * Correct command syntax (ensure `bun` not `npm`/`npx`)
     * Update configuration for discovered edge cases
     * Add error handling for session problems

6. **Prevent Future Issues**:
   - Implement safeguards:
     * Add tests for bugs found during session
     * Update error messages to be more helpful
     * Add validation for common mistakes
     * Document discovered gotchas

### Phase 3: OpenSpec Change Archival (If Applicable)

**Execute this phase only if an OpenSpec change was implemented and needs archival.**

7. **Identify Change to Archive**:
   - If change ID provided in inputs, use it
   - Otherwise, check if session involved OpenSpec implementation:
     * Run `openspec list` to see pending changes
     * Confirm with user which change (if any) to archive
     * Skip this phase if no OpenSpec work was done

8. **Archive OpenSpec Change**:
   - Follow the workflow from [openspec-archive.prompt.md](openspec-archive.prompt.md):
     * Validate the change ID with `openspec list` or `openspec show <id>`
     * Run `openspec archive <id> --yes` to move change and update specs
     * Review command output to confirm updates
     * Validate with `openspec validate --strict --no-interactive`
     * Inspect with `openspec show <id>` if needed

### Phase 4: Documentation Update

9. **Identify Affected Documentation**:
   - Determine which documentation files need updates:
     * [README.md](../../README.md) - Project overview, setup, usage
     * [AGENTS.md](../../AGENTS.md) - Agent configurations
     * Other relevant documentation files

10. **Update Documentation**:
    - Edit identified files to reflect changes:
      * Maintain existing style and formatting
      * Use clear, concise language
      * Add examples where helpful
      * Update version information if applicable
      * **Include lessons learned from session errors**

11. **Verify Consistency**:
    - Ensure all documentation updates are accurate and consistent with actual changes
    - Check for broken links or references

### Phase 5: Git Commit

12. **Check Git Status**:
    - Run `git status --porcelain` to see modified, added, deleted files

13. **Check Staged Files**:
    - Run `git diff --cached --name-only` to verify if files are already staged
    - If no files staged, run `git add -A` (never stage secrets)

14. **Analyze Changes**:
    - Run `git diff --staged` to inspect staged changes
    - Run `git diff` for unstaged work

15. **Determine Commit Type**:
    - Select appropriate conventional commit type:
      * `feat` - New feature or functionality
      * `fix` - Bug fix
      * `docs` - Documentation changes only
      * `style` - Code style/formatting (no logic changes)
      * `refactor` - Code refactoring (no feature/fix)
      * `perf` - Performance improvements
      * `test` - Adding or updating tests
      * `build` - Build system or dependency changes
      * `ci` - CI/CD configuration changes
      * `chore` - Maintenance or miscellaneous tasks

16. **Determine Scope**:
    - Identify affected area/module (e.g., `dashboard`, `csv`, `docs`, `openspec`)

17. **Generate Description**:
    - Create concise description:
      * Imperative mood, present tense
      * Under 72 characters
      * Clear and specific

18. **Create Commit**:
    - Execute commit with conventional commit message:
      ```bash
      git commit -m "<type>(<scope>): <description>" -m "<optional detailed body>"
      ```

19. **Verify Commit**:
    - Confirm with `git log -1 --stat` to display last commit and affected files

## Output Expectations

### Documentation Updates
- Updates applied directly to documentation files
- Clear, concise summaries following existing style
- Updates to README.md, AGENTS.md, and other relevant files

### Error Corrections
- Code fixes with clear rationale
- Documentation corrections (outdated/incorrect content)
- Configuration updates for edge cases
- Tests to prevent regression

### Commit Message Format
```
<type>[optional scope]: <description>

[optional body with bullet points explaining changes]

[optional footer for breaking changes or issue references]
```

## Quality Assurance Checklist

### Session Review
- [ ] All errors and issues from chat session are identified
- [ ] Root causes understood
- [ ] Workarounds documented

### Error Correction
- [ ] All documentation errors fixed
- [ ] Code examples verified to work
- [ ] Configuration issues resolved
- [ ] Tests added for discovered bugs

### Error Detection
Use this checklist to scan for common issues:

#### Documentation
- [ ] Commands use `bun` (not `bunx`/`npm`/`npx`)
- [ ] File paths are correct and files exist
- [ ] Code examples compile/run without errors
- [ ] Instructions match current project structure
- [ ] Links resolve to valid destinations
- [ ] API references match actual implementation

#### Code
- [ ] Svelte 5 syntax used (not Svelte 4 patterns)
- [ ] Event handlers use `onclick` not `on:click`
- [ ] Imports use correct path aliases (`$lib`, `$components`)
- [ ] Types are accurate and match runtime behavior
- [ ] Error handling covers edge cases

#### Configuration
- [ ] Build commands produce expected output
- [ ] Test commands run successfully
- [ ] Environment variables documented
- [ ] Dependencies up to date in documentation

### OpenSpec Archival (if applicable)
- [ ] Change ID validated with `openspec list`
- [ ] `openspec archive <id> --yes` completed successfully
- [ ] Target specs updated correctly
- [ ] Change moved to `changes/archive/`
- [ ] `openspec validate --strict` passes

### Documentation
- [ ] All significant changes documented
- [ ] Updates follow existing style
- [ ] Changes accurate and reflect actual modifications
- [ ] Examples clear and actionable
- [ ] Related files cross-referenced
- [ ] No broken links
- [ ] Lessons learned incorporated

### Git Commit
- [ ] No secrets, credentials, or sensitive data staged
- [ ] Commit type accurately reflects changes
- [ ] Scope correctly identifies affected area
- [ ] Description is imperative mood, present tense, <72 chars
- [ ] Complex changes include explanatory body
- [ ] Related issues referenced in footer
- [ ] Breaking changes marked with `!` or footer
- [ ] Commit verified with `git log -1 --stat`

## Guardrails

- ❌ NEVER update git config without explicit user request
- ❌ NEVER use `--force` or hard reset without confirmation
- ❌ NEVER skip hooks with `--no-verify` unless requested
- ❌ NEVER force push to main/master branches
- ❌ NEVER commit secrets or credentials
- ❌ NEVER make large refactors without clear documentation
- ✅ ALWAYS verify no secrets being committed
- ✅ ALWAYS update documentation before committing
- ✅ ALWAYS use conventional commit format
- ✅ ALWAYS provide clear, descriptive commit messages
- ✅ ALWAYS summarize work in both docs and commit
- ✅ ALWAYS fix identified errors before finalizing
- ✅ ALWAYS add tests for bugs discovered during session

## Example Commits

```bash
# Documentation updates with code changes
feat(dashboard): add summary cards and update docs

- Added THB summary cards for income/expenses
- Updated AGENTS.md with recent improvements
- Documented debug logging system

# Pure documentation
docs(agents): restructure AGENTS.md and split instructions

Moved project-specific configuration to separate instruction file for
better organization and token efficiency.

# Error correction commit
fix(docs): correct outdated commands and examples

- Fixed bun command syntax in README
- Updated deprecated Svelte 4 patterns to Svelte 5
- Added missing prerequisites in setup steps
- Corrected broken links in instruction files

# OpenSpec archival
chore(openspec): archive deployed change-id

- Archived change-id after successful deployment
- Updated related specs with approved requirements
- Documented lessons learned in design notes

# Breaking change
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: API v1 endpoints are no longer supported.
Migrate to v2 endpoints documented at /api/v2/docs
```

## Reference

- OpenSpec archival: [openspec-archive.prompt.md](openspec-archive.prompt.md)
- Project guidelines: [AGENTS.md](../../AGENTS.md)
- Commit skill: `.github/skills/common-conventional-commits/SKILL.md`
- Svelte instructions: `.github/instructions/svelte.instructions.md`
