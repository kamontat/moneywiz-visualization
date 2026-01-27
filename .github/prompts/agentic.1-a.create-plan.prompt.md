# Create Plan Phase

Create a new plan for a change request.

## User Input

The user will provide: `<text>` describing what they want to change or add.

## Prerequisites

Before proceeding, verify the following:

1. Analyze the user input to understand scope, intent, and constraints
2. If the request is ambiguous or incomplete, ask clarifying questions
3. Check that `.agentic/memories/` and `.agentic/templates/plans/` directories exist

## Instructions

1. **Read Context**
   - Read all memory files in `.agentic/memories/`
   - Read all template files in `.agentic/templates/plans/`

2. **Generate Plan Name**
   - Create a short name (max 6 words, lowercase, dash-separated)
   - Example: `add-user-auth`, `fix-login-bug`

3. **Create Plan Directory**
   - Create `.agentic/plans/<name>/`

4. **Process Templates**
   - Render each template and write output files:
     - `proposal.md.hbs` → `proposal.md`
     - `tasks.md.hbs` → `tasks.md`
     - `tests.md.hbs` → `tests.md`
     - `specs.md.hbs` → `specs.md`

## Template Processing

Templates use Handlebars syntax:

- `{{variable}}` - Replace with value
- `{{#each array}}...{{/each}}` - Loop over items
- `{{this}}` - Current item in loop
- `{{@index}}` - Current index (0-based)
- `{{property}}` - Access object property

Write fully rendered markdown. No raw Handlebars syntax in output files.

## Template Variables

### proposal.md.hbs

Required:
- `name` (string) - Plan name, dash-separated
- `objective` (string) - One-sentence goal statement
- `description` (string) - User-focused explanation (non-technical)
- `criteria` (string[]) - Measurable acceptance criteria

Optional:
- `out_of_scope` (string) - What this plan will NOT do
- `references` (object[]) - Links with `title` and `url`

### tasks.md.hbs

Required:
- `name` (string) - Same as proposal.md
- `steps` (object[]) - Steps with `title`, `description`, `files`, `changes`
- `verification` (string[]) - Final checks

Optional:
- `prerequisites` (string[]) - Pre-conditions to verify

### tests.md.hbs

Required:
- `name` (string) - Same as proposal.md

Optional:
- `unit_tests` (string[]) - Function/component tests
- `integration_tests` (string[]) - Component interaction tests
- `e2e_tests` (string[]) - Full flow tests
- `manual_tests` (string[]) - Manual verification steps
- `edge_cases` (string[]) - Boundary conditions
- `commands` (object[]) - Commands with `description` and `command`

### specs.md.hbs

Required:
- `name` (string) - Same as proposal.md

Optional:
- `modified_specs` (object[]) - Specs with `name`, `slug`, `change_type`, `description`
- `new_specs` (object[]) - New specs with `name`, `purpose`
- `deprecated_specs` (object[]) - Specs with `name`, `reason`, `replacement`
- `no_changes` (object[]) - Unaffected specs with `name`, `reason`

## Output

- `.agentic/plans/<name>/proposal.md`
- `.agentic/plans/<name>/tasks.md`
- `.agentic/plans/<name>/tests.md`
- `.agentic/plans/<name>/specs.md`

## Rules

- `proposal.md` is non-technical (what, not how)
- `tasks.md` is technical (how to implement)
- All files must use the same `name` value
- Omit empty sections or write "N/A"
- Link to existing specs in `.agentic/specs/` if affected
- Ask clarifying questions if the request is ambiguous
