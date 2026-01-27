# Archive Phase

Archive the completed plan and update specifications.

## User Input

The user may provide: `[plan]` - the name of the plan to archive.

## Prerequisites

Before proceeding, verify the following:

1. If plan name provided, verify it exists in `.agentic/plans/`
2. If not provided, list completed plans and ask user which one to archive
3. Verify plan contains all required files:
   - `proposal.md`
   - `tasks.md`
   - `tests.md`
   - `specs.md`
4. Verify completion (see Completion Verification section)
5. Do not archive incomplete plans

## Instructions

1. **Read Context**
   - Read all memory files in `.agentic/memories/`
   - Read all spec templates in `.agentic/templates/specs/`

2. **Identify Plan**
   - Locate plan in `.agentic/plans/<plan>/`

3. **Verify Completion**
   - Check all criteria in Completion Verification section

4. **Read specs.md**
   - Identify affected specifications

5. **Update Existing Specs**
   - For each spec in `modified_specs`, update `.agentic/specs/<slug>/`

6. **Create New Specs**
   - For each spec in `new_specs`, create `.agentic/specs/<slug>/`

7. **Confirm and Delete**
   - Ask for confirmation before deleting
   - Delete the plan directory from `.agentic/plans/`

## Completion Verification

All items must pass before archiving:

- **Acceptance criteria** - All criteria in `proposal.md` are checked or marked satisfied
- **Tests** - All tests in `tests.md` pass (manual and automated)
- **Tasks** - All steps in `tasks.md` are marked complete `[x]`
- **Review** - Code has been reviewed (if applicable)

### Interpreting Checklists

- Complete: marked `[x]` or explicitly stated as done
- N/A sections: treat as complete
- Unclear: ask user for confirmation

If any check fails, report what is incomplete and stop.

## Spec Update Guidelines

### Updating Existing Specs

For each spec in `modified_specs`:

1. Navigate to `.agentic/specs/<slug>/spec.md`
2. Update based on `change_type`:
   - **Update** - Modify existing content
   - **Extend** - Add new sections or items
   - **Revise** - Rewrite sections significantly
3. Add changelog entry to `.agentic/specs/<slug>/changelog.md`:

```markdown
## <plan-name>

### Changed

- Description of what changed

### Added

- Description of what was added
```

### Creating New Specs

For each spec in `new_specs`:

1. Determine the spec category and apply the correct prefix:
   - **`tech-`** for technical specs (database, API, infrastructure, techstack, caching, deployment)
   - **`biz-`** for business specs (UI design, business logic, user flows, features, domain rules)
2. Create directory `.agentic/specs/<prefix><slug>/`
3. Process templates from `.agentic/templates/specs/`:
   - `spec.md.hbs` → `spec.md`
   - `changelog.md.hbs` → `changelog.md`
4. Fill in content based on plan

**Spec Naming Examples:**

- Database schema spec → `tech-database-schema`
- User authentication flow → `biz-user-auth`
- API endpoints → `tech-api-routes`
- Checkout process → `biz-checkout-flow`

## Template Variables

### spec.md.hbs

Required:

- `name` (string) - Spec name
- `purpose` (string) - One-sentence purpose

Optional:

- `constraints` (string[]) - Constraints or limitations
- `examples` (object[]) - Examples with `language` and `code`
- `notes` (string) - Additional notes

### changelog.md.hbs

Required:

- `name` (string) - Spec name

Optional:

- `versions` (object[]) - Entries with `version`, `added`, `changed`, `deprecated`, `removed`, `fixed`

## Output

- Updated spec files in `.agentic/specs/`
- New spec directories if needed (with `spec.md` and `changelog.md`)
- Deleted plan directory from `.agentic/plans/`

## Rules

- Verify all acceptance criteria are met before archiving
- Preserve spec history in `changelog.md`
- Use consistent formatting matching existing spec files
- If specs don't exist yet, create them using templates
- Ask for confirmation before deleting the plan directory
- Never archive incomplete plans
- Keep changelog entries concise but informative
