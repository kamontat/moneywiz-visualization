---
name: 'mw.project-test-ui'
description: 'Generate Playwright test from scenario using live browser interaction and Playwright MCP'
agent: 'agent'
tools: ['execute', 'read', 'edit/editFiles', 'search', 'web/fetch', 'microsoft/playwright/*']
argument-hint: '<test scenario>'
model: Claude Sonnet 4.5 (copilot)
---

# Test Generation with Playwright MCP

## Mission

Generate a complete Playwright TypeScript test by executing the scenario step-by-step using Playwright MCP, then codifying the validated interactions into a test file.

## Scope & Preconditions

- Target framework: `@playwright/test` (TypeScript)
- Test location: `tests/` directory
- Prerequisites: Playwright MCP Server must be available
- Related files: [Playwright Instructions](../instructions/playwright-typescript.instructions.md)

## Inputs

- **Test Scenario** (required): `${input:scenario:Login and verify dashboard}` - Description of the user flow to test
- If no scenario is provided, request it from the user and stop until provided

## Workflow

1. **Validate Scenario**: Ensure the test scenario is clear and actionable
2. **Execute Steps Interactively**: Use Playwright MCP to run each step in the scenario one by one:
   - Navigate to pages
   - Interact with elements (click, fill, etc.)
   - Verify expected outcomes
   - Document element locators discovered during execution
3. **Generate Test Code**: After completing all steps, create a Playwright TypeScript test based on:
   - Message history of executed steps
   - Discovered locators (prefer role-based)
   - Validated assertions
4. **Save Test File**: Write the test to `tests/<feature-name>.spec.ts` using kebab-case naming
5. **Execute Test**: Run the generated test using `npx playwright test --project=chromium`
6. **Iterate Until Passing**: If the test fails:
   - Analyze failure reasons
   - Refine locators or assertions
   - Re-run until the test passes

## Output Expectations

- **Format**: TypeScript test file using `@playwright/test`
- **Structure**: Follow [Playwright TypeScript Instructions](../instructions/playwright-typescript.instructions.md)
- **Location**: `tests/<feature-name>.spec.ts`
- **Success Criteria**: Test executes successfully and passes

## Quality Assurance

- [ ] Test scenario executed step-by-step before code generation
- [ ] Generated test uses role-based locators (getByRole, getByLabel, etc.)
- [ ] Test includes proper test.describe() and test.step() structure
- [ ] Test passes when executed with `npx playwright test --project=chromium`
- [ ] Test file saved in `tests/` directory with appropriate naming

## Guard Rails

- **Do NOT** generate test code prematurely without executing steps
- **Do NOT** use hard-coded waits; rely on Playwright's auto-waiting
- **Do NOT** skip test execution validation
