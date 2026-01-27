---
name: mcp-time
description: Get current date, time, and timezone information. Use when performing date/time calculations, timezone conversions, or handling scheduling and time-based logic.
---

# Time MCP Skill

Get current date, time, and timezone information.

## Overview

The Time MCP server provides tools to retrieve the current time in various formats and perform timezone conversions.

## When to Use This Skill

Trigger this skill when:

- Date/time calculations are needed
- Timezone conversions are required
- Scheduling and time-based logic is being implemented
- Verifying the current server or local time

## Tools

- `get_current_time`: Returns the current time in a specified timezone.
- `convert_time`: Converts time between different timezones.

## Best Practices

- Always specify the timezone explicitly when possible.
- Use IANA timezone names (e.g., `America/New_York`, `UTC`).
- Be aware that the user's local timezone might differ from the server's.
