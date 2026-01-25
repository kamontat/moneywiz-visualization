---
description: Archive deployed OpenSpec changes to the archive folder
model: Claude Sonnet 4.5 (copilot)
---

$ARGUMENTS

## Mission

Archive a deployed OpenSpec change by moving it to the archive folder and updating related specs.

## Scope & Preconditions

- OpenSpec change must be implemented and validated
- Change must exist in `openspec/changes/` (not already archived)
- All tests passing and feature deployed/verified

## Inputs

- **Change ID** (${input:changeId}): OpenSpec change ID to archive (required if multiple changes exist)
- **Session Context**: The current chat session history for context

## Workflow

### Phase 1: Identify Change to Archive

1. **List Available Changes**:
   - Run `openspec list` to see pending changes
   - If change ID provided in inputs, validate it exists
   - If multiple changes exist and no ID provided, ask user which to archive
   - Stop if no changes are ready to archive

2. **Validate Change Status**:
   - Run `openspec show <id>` to verify change details
   - Confirm change is implemented and tested
   - Check that change is not already archived

### Phase 2: Archive OpenSpec Change

3. **Execute Archive Command**:
   - Run `openspec archive <id> --yes` to:
     * Move change to `changes/archive/`
     * Apply spec updates without prompts
   - Use `--skip-specs` only for tooling-only work

4. **Review Archive Output**:
   - Confirm target specs were updated
   - Verify change landed in `changes/archive/`
   - Check for any warnings or errors

### Phase 3: Validate Archive

5. **Run Validation**:
   - Execute `openspec validate --strict --no-interactive --changes`
   - Address any validation issues

6. **Inspect Results**:
   - Run `openspec view` to verify the result

## Output Expectations

### Archive Results
- Change moved to `openspec/changes/archive/<change-id>/`
- Related specs updated with approved requirements
- Validation passes without errors

## Quality Assurance Checklist

- [ ] Change ID validated with `openspec list`
- [ ] Change is implemented and tested
- [ ] `openspec archive <id> --yes` completed successfully
- [ ] Target specs updated correctly
- [ ] Change moved to `changes/archive/`
- [ ] `openspec validate --strict` passes
- [ ] `openspec show <id>` confirms archived state

## Guardrails

- ❌ NEVER archive changes that aren't fully implemented
- ❌ NEVER archive without validating change ID first
- ❌ NEVER skip validation after archiving
- ✅ ALWAYS validate change ID with `openspec list`
- ✅ ALWAYS review archive command output
- ✅ ALWAYS run validation after archiving

## Example Usage

```bash
# List available changes
openspec list

# Archive a specific change
openspec archive add-header-icons --yes

# Validate after archive
openspec validate --strict --no-interactive

# Verify archived state
openspec show add-header-icons
```

## Next Steps

After archiving, run the **cleanup prompt** (`/project.cleanup`) to:
- Update project documentation
- Review all changes made
- Create a conventional commit

## Reference

- OpenSpec archival: [openspec-archive.prompt.md](openspec-archive.prompt.md)
- OpenSpec agents guide: [openspec/AGENTS.md](../../openspec/AGENTS.md)
- Cleanup prompt: [project.4.cleanup.prompt.md](project.4.cleanup.prompt.md)
