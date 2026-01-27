# Refine Plan Phase

Iterate on plan documents until they meet expectations.

## User Input

The user will provide: `<text>` describing what needs to change in the plan.

Examples:

- Scope changes: "Remove the email notification feature from scope"
- Clarifications: "Be more specific about the API endpoints needed"
- Task adjustments: "Break down step 2 into smaller tasks"
- Test additions: "Add edge cases for empty input"
- Criteria updates: "Add a performance requirement"

## Prerequisites

Before proceeding, verify the following:

1. Identify which plan to refine:
   - If user specifies a plan name, verify it exists in `.agentic/plans/`
   - If not specified, check `.agentic/plans/` for plans
   - If multiple exist, ask user which one to refine
   - If none exist, inform user and stop
2. Analyze the feedback to understand what changes are needed
3. If feedback is unclear, ask for clarification before making changes

## Instructions

1. **Read Context**
   - Read all memory files in `.agentic/memories/`

2. **Read Current Plan**
   - Read all files in `.agentic/plans/<plan>/`:
     - `proposal.md` - Objective and acceptance criteria
     - `tasks.md` - Implementation steps
     - `tests.md` - Test plan
     - `specs.md` - Affected specifications

3. **Analyze Feedback**
   - Determine which files need changes
   - Identify specific sections to modify

4. **Update Plan Files**
   - Make changes based on feedback
   - Ensure consistency across all files

5. **Present Changes**
   - Summarize what was changed
   - Ask if further revisions are needed

6. **Iterate**
   - If user requests more changes, repeat from step 3
   - If user approves, confirm plan is ready for implementation

## File-Specific Guidance

### Revising proposal.md

Common changes:

- Adjust objective statement
- Add/remove/modify acceptance criteria
- Update scope boundaries (out_of_scope)
- Add references or context

### Revising tasks.md

Common changes:

- Add/remove implementation steps
- Break large steps into smaller ones
- Reorder steps based on dependencies
- Add/update prerequisites
- Clarify file changes needed

### Revising tests.md

Common changes:

- Add/remove test cases
- Add edge cases
- Clarify test expectations
- Add manual verification steps
- Update test commands

### Revising specs.md

Common changes:

- Add/remove affected specs
- Change modification type (update/extend/revise)
- Add new specs to create
- Update deprecation plans

## Revision Checklist

After each revision, verify:

- **Consistency** - All files use the same plan name
- **Completeness** - No placeholder text or TODOs remain
- **Clarity** - Requirements are specific and measurable
- **Feasibility** - Tasks are actionable and well-defined
- **Testability** - Each criterion has a corresponding test

## Output

- Updated plan files in `.agentic/plans/<plan>/`
- Summary of changes made
- Confirmation of readiness (or request for further feedback)

## Rules

- Do not write any implementation code
- Do not modify files outside `.agentic/plans/<plan>/`
- Keep all four plan files in sync
- Preserve the original intent unless explicitly changing it
- Ask clarifying questions rather than assuming
- Always summarize changes and ask for confirmation
- Continue iterating until user explicitly approves
- If changes would fundamentally alter the plan, confirm with user first
