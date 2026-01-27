# Iterate App Phase

Iterate on the implementation based on feedback.

## User Input

The user will provide: `<text>` describing what needs to change or improve.

Examples:

- Bug reports: "The login doesn't work when email has uppercase letters"
- Feature adjustments: "Also add a 'remember me' checkbox"
- Performance issues: "The query is too slow, needs optimization"
- UX improvements: "Show loading spinner during API calls"

## Prerequisites

Before proceeding, verify the following:

1. Analyze the feedback to understand what changes are needed
2. Determine if feedback is within the original plan scope
3. If feedback is unclear or ambiguous, ask for clarification

## Instructions

1. **Read Context**
   - Read all memory files in `.agentic/memories/`

2. **Identify Active Plan**
   - Look in `.agentic/plans/` for plans with in-progress tasks (has `[x]` but not all complete)
   - If multiple active plans, ask user which one
   - If none found, ask user to specify

3. **Read Plan Files**
   - `proposal.md` - Original objective and acceptance criteria
   - `tasks.md` - Implementation progress and remaining steps
   - `tests.md` - Test plan and coverage
   - `specs.md` - Affected specifications

4. **Analyze Feedback**
   - Determine scope: within original plan or new?
   - Assess impact: code only, tests affected, or requirements changed?
   - Check dependencies: related components, existing tests, documentation

5. **Update Implementation**
   - Make changes based on feedback
   - Update tests if behavior changes
   - Update plan files if requirements changed

## Feedback Analysis

### Scope Check

- **Within original plan** → Proceed with changes
- **Beyond original scope** → Suggest creating a new plan

### Impact Assessment

- **Code only** → Update implementation
- **Tests affected** → Update implementation + tests
- **Requirements changed** → Update implementation + tests + plan files

### Dependency Check

Consider:

- Related functions or components
- Existing tests that may break
- Documentation that references changed behavior

## When to Suggest New Plan

Suggest creating a new plan when feedback:

- Introduces entirely new features not in original scope
- Requires architectural changes beyond the plan
- Would significantly delay current plan completion
- Conflicts with original acceptance criteria

Example:

> This feedback suggests adding OAuth support, which is beyond the current plan scope (email/password auth only). I recommend completing this plan first, then creating a new plan for OAuth integration.

## Output

- Updated code based on feedback
- Updated tests if behavior changed
- Updated plan files if requirements changed:
  - `proposal.md` - If acceptance criteria changed
  - `tasks.md` - If implementation steps changed
  - `tests.md` - If test plan changed

## Rules

- Keep changes focused on the feedback
- Do not scope-creep beyond the original plan
- Update `tasks.md` to reflect any new or changed steps
- Preserve existing functionality unless explicitly changing it
- Run tests after changes to verify no regressions
- If significant changes needed, suggest creating a new plan
