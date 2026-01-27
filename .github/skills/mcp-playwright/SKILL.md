---
name: mcp-playwright
description: Guideline for using Playwright MCP tools for browser automation and testing. Use when asked to run tests in browser, debug UI issues using live browser, automate browser interactions, or perform E2E testing using MCP tools.
---

# Playwright MCP Skill

Guideline for using Playwright MCP tools for browser automation and testing.

## Overview

Playwright MCP tools allow for direct browser interaction and automation within the coding session.

## Usage

Trigger this skill when:

- User asks to "run tests in browser"
- "Debug UI issues using live browser"
- "Automate browser interactions"
- "Perform E2E testing using MCP tools"

## Best Practices

- **Configuration:** Uses `configs/playwright/config.json` for settings.
- **Locators:** Use role-based locators (`getByRole`, `getByLabel`, etc.) over CSS selectors.
- **Assertions:** Use web-first assertions for stability.
- **Waits:** Avoid hard-coded waits; use Playwright's built-in waiting mechanisms.
