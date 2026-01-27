# Build App Phase

Implement minimum viable code for a plan.

## User Input

The user may provide: `[plan]` - the name of the plan directory.

## Prerequisites

Before proceeding, verify the following:

1. If plan name provided, verify it exists in `.agentic/plans/`
2. If not provided, check available plans in `.agentic/plans/`:
   - If exactly one plan exists, automatically select it
   - If multiple plans exist, list them and ask user to select one
   - If no plans exist, inform user and stop
3. Do not proceed until a valid plan is identified

## Instructions

1. **Read Context**
   - Read all memory files in `.agentic/memories/`
   - Read the plan from `.agentic/plans/<plan>/`

2. **Understand Plan Files**
   - `proposal.md` - Objective and acceptance criteria
   - `tasks.md` - Implementation steps
   - `tests.md` - Test plan
   - `specs.md` - Affected specifications

3. **Implement Code**
   - Implement minimum working code that satisfies the plan
   - Create tests based on `tests.md`

4. **Track Progress**
   - Update `tasks.md` to mark completed steps with `[x]`

5. **Validate**
   - Verify implementation meets all acceptance criteria

## Implementation Guidelines

### Before Writing Code

- Study existing codebase structure and patterns
- Identify files to modify vs. new files to create
- Plan implementation order based on dependencies
- Review `tests.md` to understand expected behavior

### While Writing Code

- Follow existing code patterns and conventions
- Write minimal code - only what's needed
- Add inline comments only for complex logic
- Handle errors appropriately without over-engineering
- Create tests before or alongside implementation (TDD preferred)

### After Writing Code

- Run existing tests to ensure no regressions
- Run new tests to verify implementation
- Update `tasks.md` checkboxes to reflect progress
- Verify each acceptance criterion is satisfied

## Progress Tracking

Mark tasks as complete in `tasks.md`:

```markdown
## Prerequisites
- [x] Database connection is configured
- [ ] Environment variables set

## Implementation Steps
### Step 0: Create User Model
- [x] Completed
```

## Output

- Working code that satisfies acceptance criteria
- Tests that verify the implementation
- Updated `tasks.md` with completed steps marked

## Rules

- Follow existing code patterns in the repository
- Write minimal code - only what's needed for the plan
- Do not modify specs (that happens in archive phase)
- Do not add features beyond the plan scope
- Do not refactor unrelated code
- Ask questions if requirements are unclear
- If a step is blocked, note why and continue with other steps
