---
name: "mw.project-explore-ui"
description: "Explore website functionality and identify key user flows for testing using Playwright MCP"
agent: "agent"
tools: ["execute", "read", "edit/editFiles", "search", "web/fetch", "microsoft/playwright/*"]
argument-hint: "<url>"
model: Claude Sonnet 4.5 (copilot)
---

# Website Exploration for Testing

## Mission

Explore a website using Playwright MCP to identify and document key functionalities and user flows that should be covered by automated tests.

## Inputs

- **URL** (required): `${input:url:https://example.com}` - The website URL to explore
- If no URL is provided, request it from the user and stop until provided

## Workflow

1. **Navigate to Website**: Use Playwright MCP Server to navigate to the provided URL
2. **Identify Core Features**: Explore and interact with 3-5 core features or user flows
3. **Document Interactions**: Record user interactions, UI element locators (prefer role-based locators), and expected outcomes
4. **Close Browser**: Clean up the browser context upon completion
5. **Summarize Findings**: Provide a concise summary of discovered functionalities
6. **Propose Test Cases**: Generate test case recommendations based on the exploration

## Output Expectations

- **Format**: Structured markdown report with sections for each explored feature
- **Content**: Include UI element locators, user flows, and expected behaviors
- **Location**: Present findings in chat for review
- **Test Proposals**: List recommended test scenarios with priorities

## Quality Assurance

- [ ] All 3-5 core features documented with locators
- [ ] User flows are clear and actionable
- [ ] Browser context properly closed
- [ ] Test case proposals are specific and testable
