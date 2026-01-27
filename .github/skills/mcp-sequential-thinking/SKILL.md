---
name: mcp-sequential-thinking
description: Advanced problem-solving method. Use when facing ambiguous/complex problems, planning multi-file refactors, debugging difficult bugs, or verifying hypotheses.
---

# Sequential Thinking

## Workflow

1.  **Initiate**: Call `mcp_sequential_thinking` with your initial thought.
2.  **Iterate**: Add more thoughts (`thought_number: 2`, `3`, etc.).
3.  **Refine**: Set `is_revision: true` if you change your mind.
4.  **Conclude**: When `next_thought_needed: false`.

## Best Practices

- **Break it down**: Isolate variables.
- **Hypothesize**: "I think X is causing Y because Z."
- **Verify**: "I will check file A to see if..."
