---
name: 'mw.project-summary'
description: 'Summarize chat session work and update project documentation with changes'
agent: 'agent'
tools: ['execute', 'read', 'edit', 'search', 'upstash/context7/*']
---

# Project Session Summary and Documentation Update

## Mission

Summarize all work completed in the current chat session and update relevant project documentation to accurately reflect code, design, and configuration changes.

## Scope & Preconditions

- Chat session must contain meaningful changes to summarize
- Project documentation files must exist (e.g., README.md, AGENTS.md)
- Changes should be substantive enough to warrant documentation updates

## Workflow

1. **Review Chat History**: Analyze the current chat session to identify all meaningful changes:
   - Code modifications (new features, bug fixes, refactoring)
   - Design decisions and architectural changes
   - Configuration updates (build, deployment, dependencies)
   - Test additions or modifications
2. **Categorize Changes**: Group changes by type and impact:
   - New features
   - Bug fixes
   - Documentation improvements
   - Configuration changes
   - Test coverage
3. **Identify Affected Documentation**: Determine which documentation files need updates:
   - [README.md](../../README.md) - Project overview, setup, usage
   - [AGENTS.md](../../AGENTS.md) - Agent configurations and updates
   - Other relevant documentation files
4. **Update Documentation**: Edit identified files to reflect changes:
   - Maintain existing style and formatting conventions
   - Use clear, concise language
   - Add examples where helpful
   - Update version information if applicable
5. **Verify Consistency**: Ensure all documentation updates are accurate and consistent with actual changes

## Output Expectations

- **Format**: Updates applied directly to documentation files
- **Content**: Clear, concise summaries following existing documentation style
- **Location**: Updates to README.md, AGENTS.md, and other relevant files
- **Summary**: Provide a brief summary of documentation changes made

## Quality Assurance

- [ ] All significant changes from chat session are documented
- [ ] Documentation updates follow existing style and formatting
- [ ] Changes are accurate and reflect actual code/config modifications
- [ ] Examples and instructions are clear and actionable
- [ ] Related documentation files are cross-referenced appropriately
- [ ] No broken links or references in updated documentation
