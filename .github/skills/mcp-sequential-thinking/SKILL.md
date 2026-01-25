---
name: mcp-sequential-thinking
description: A detailed tool for dynamic and reflective problem-solving through thoughts. Use when breaking down complex problems, planning designs, debugging systematically, or when the full scope of a task is not clear.
---

# Sequential Thinking Skill

Expert-level problem solving using the Sequential Thinking MCP server. This skill helps analyze complex problems through a flexible, iterative thinking process that adapts as understanding deepens.

## When to Use This Skill

Trigger this skill for:
- **Complex Problem Solving**: Breaking down multi-step technical challenges.
- **Architectural Planning**: Designing new features or refactoring existing ones.
- **Systematic Debugging**: Narrowing down root causes of non-obvious bugs.
- **Ambiguous Requirements**: Exploring different approaches when the path forward is unclear.
- **Meta-Cognition**: Reflecting on previous decisions and adjusting strategy.

## Key Features

- **Iterative Refinement**: Adjust the total number of thoughts as you progress.
- **Backtracking/Branching**: Revise previous thoughts or explore alternative paths.
- **Meta-Analysis**: Use thoughts to decide which other tools to use and in what order.
- **Hypothesis Verification**: Generate and verify solutions within the thought process.

## Best Practices

1. **Step-by-Step**: Don't try to solve everything in one thought; use the sequence to build context.
2. **Be Reflective**: Honestly evaluate if a previous thought was incorrect or needs refinement (`is_revision`).
3. **Plan Tooling**: Use thoughts to plan the specific parameters and order for other MCP tool calls.
4. **Identify Uncertainties**: Explicitly state what is unknown and use subsequent thoughts to gather that information.
5. **Final Hypothesis**: Always end with a verified hypothesis before proceeding to implementation.
