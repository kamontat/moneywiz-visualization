---
description: Implement an approved OpenSpec change with full SvelteKit integration and testing
model: Gemini 3 Pro (Preview) (copilot)
---

<!-- PROJECT WRAPPER: This prompt combines OpenSpec apply + project-specific implementation -->

$ARGUMENTS

## Mission

Deliver end-to-end implementation for approved OpenSpec changes in the MoneyWiz Visualization SvelteKit project, including business logic, UI components, tests, and documentation updates.

## Scope & Preconditions

- OpenSpec change must be approved and ready for implementation
- Use SvelteKit with static adapter constraints
- Keep route files minimal; move logic to `$lib` and components to `$components`
- Prefer Bun for all commands and scripts
- Read relevant instruction files and specs before editing

## Inputs

- **Change ID** (${input:changeId}): The OpenSpec change identifier to implement
- **Scope** (${input:scope}): Affected areas or files if known
- **Tests** (${input:tests}): Testing expectations (unit/e2e) and data dependencies

## Workflow

### Phase 1: OpenSpec Context Loading

Execute the OpenSpec apply workflow from [openspec-apply.prompt.md](openspec-apply.prompt.md):

1. **Load Change Documents**:
   - Read `openspec/changes/<id>/proposal.md` for objectives and acceptance criteria
   - Read `openspec/changes/<id>/design.md` (if present) for architectural decisions
   - Read `openspec/changes/<id>/tasks.md` for ordered work items

2. **Understand Current State**:
   - Review related specs with `openspec list --specs`
   - Use `openspec show <id> --json --deltas-only` for additional context

### Phase 2: Project-Specific Implementation

3. **Analyze Requirements**:
   - Restate the implementation plan clearly
   - Identify which instructions/docs to read (use Svelte MCP when applicable)
   - Ask focused questions only when essential context is missing

4. **Draft Implementation Plan**:
   - Break down into small, reviewable steps
   - Plan UI components (`$components`), business logic (`$lib`), routes, and tests
   - Identify data dependencies and static rendering requirements

5. **Implement Systematically**:
   - Keep business logic in `$lib/`, UI in `$components/`, and routes minimal
   - Use path aliases: `$lib` and `$components`
   - Follow Svelte 5 syntax (runes, event handlers, etc.)
   - Add comments only for non-obvious logic
   - Work through `tasks.md` sequentially, marking each task `[x]` when complete

6. **Add Test Coverage**:
   - Add/update Vitest tests for business logic in `*.spec.ts` files
   - Add/update Playwright E2E tests in `e2e/` directory
   - Follow testing guidelines from project skills (web-unit-tester, web-e2e-tester)
   - Align tests with acceptance criteria

7. **Run Validation Checks**:
   - Run `bun test` for unit tests (when feasible)
   - Run `bun run test:e2e` for E2E tests (when feasible)
   - Note any skipped steps and why

### Phase 3: Finalization

8. **Update Task Checklist**:
   - Mark all completed tasks as `[x]` in `openspec/changes/<id>/tasks.md`
   - Ensure checklist reflects actual implementation state

9. **Validate OpenSpec**:
   - Run `openspec validate <id> --strict --no-interactive`
   - Address any validation issues

## Output Expectations

- **Change Notes**: Linked file references with rationale, risks, assumptions, and follow-ups
- **Test Results**: List tests executed (or not run) with commands
- **Task Status**: Updated `tasks.md` with all items marked complete
- **Concise Communication**: Focus on implementation outcomes, not tool usage

## Quality Assurance

### Code Quality
- [ ] Business logic in `$lib/`, components in `$components/`, routes minimal
- [ ] Svelte 5 syntax used (runes, `onclick` not `on:click`)
- [ ] Path aliases used correctly (`$lib`, `$components`)
- [ ] Static adapter compatibility maintained (all pages prerenderable)
- [ ] Accessibility standards met
- [ ] Performance considerations addressed

### Testing
- [ ] Unit tests added/updated for business logic
- [ ] E2E tests added/updated for user flows
- [ ] Tests align with acceptance criteria
- [ ] Test commands documented

### Documentation
- [ ] Code comments added for non-obvious logic
- [ ] Related documentation updated if needed
- [ ] Examples verified to work

### OpenSpec Compliance
- [ ] All tasks in `tasks.md` completed and marked `[x]`
- [ ] Implementation matches proposal and design docs
- [ ] `openspec validate <id>` passes with `--strict`

## Boundaries & Guardrails

- ✅ ALWAYS read proposal and design docs before implementing
- ✅ ALWAYS keep changes tightly scoped to the approved change
- ✅ ALWAYS use `bun` (not npm/npx/bunx)
- ✅ ALWAYS update `tasks.md` checklist as you complete work
- ✅ ALWAYS validate with `openspec validate` before finishing
- ❌ NEVER make speculative refactors outside the change scope
- ❌ NEVER remove user-authored content or unrelated changes
- ❌ NEVER skip validation steps
- ❌ NEVER assume context—read the proposal documents

## Reference

- Core workflow: [openspec-apply.prompt.md](openspec-apply.prompt.md)
- Project guidelines: [AGENTS.md](../../AGENTS.md)
- Svelte guide: `.github/skills/common-svelte/SKILL.md`
- Testing guides: `.github/skills/web-unit-tester/SKILL.md`, `.github/skills/web-e2e-tester/SKILL.md`
