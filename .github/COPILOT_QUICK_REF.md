# GitHub Copilot Quick Reference

## Prompts (Slash Commands)

Invoke these with `/` in GitHub Copilot Chat:

| Command | Purpose | Collection |
|---------|---------|------------|
| `/playwright-generate-test` | Generate Playwright test from scenario with MCP | Frontend, Testing |
| `/playwright-explore-website` | Explore website for testing with Playwright | Frontend, Testing |
| `/junit-best-practices` | Get JUnit 5+ testing best practices | Testing |
| `/nunit-best-practices` | Get NUnit testing best practices | Testing |
| `/ai-prompt-safety-review` | Review AI prompts for safety and bias | Testing, Security |

## Agents (@agent-name)

Switch to specialized agents for focused tasks:

| Agent | Purpose | Collection |
|-------|---------|------------|
| `@tdd-red` | Write failing tests from GitHub issue requirements | Testing |
| `@tdd-green` | Implement minimal code to pass tests | Testing |
| `@tdd-refactor` | Improve quality, security, design | Testing |
| `@playwright-tester` | Playwright testing mode | Testing |
| `@expert-react-frontend-engineer` | Expert React 19.2 engineer | Frontend |
| `@electron-angular-native` | Electron + Angular code review | Frontend |

## Instructions (Auto-Active)

These automatically apply when editing matching files:

### Frontend Development
- **Angular** - `.component.ts`, `.service.ts`, `.module.ts`
- **React** - `.tsx`, `.jsx`
- **Next.js** - Next.js project files
- **Vue** - `.vue` files
- **TypeScript** - `.ts` files
- **Playwright** - Playwright test files

### Security & Quality
- **Accessibility** - Web code files (HTML, JSX, Vue, Svelte)
- **OWASP Security** - All code files
- **Performance** - All code files
- **Object Calisthenics** - Business domain code
- **Self-Explanatory Code** - All code files

## TDD Workflow

For GitHub issue-driven development:

```bash
# 1. Create branch from issue number
git checkout -b feature/123-add-user-auth

# 2. Use TDD Red Phase
@tdd-red Write tests for user authentication feature

# 3. Use TDD Green Phase
@tdd-green Implement authentication to pass tests

# 4. Use TDD Refactor Phase
@tdd-refactor Improve authentication code quality
```

## Testing Workflows

### E2E Testing with Playwright
```bash
# Generate test from scenario
/playwright-generate-test

# Explore website for test ideas
/playwright-explore-website URL
```

### Unit Testing Best Practices
```bash
# JUnit (Java)
/junit-best-practices

# NUnit (C#)
/nunit-best-practices
```

## Security Review

```bash
# Review AI prompts for safety
/ai-prompt-safety-review

# OWASP guidelines auto-apply when editing code
# Accessibility checks auto-apply for web components
```

## Tips

1. **Instructions are always active** - No need to invoke them explicitly
2. **Use prompts for one-off tasks** - Like generating tests or getting best practices
3. **Switch agents for extended workflows** - Like TDD cycles or code reviews
4. **Combine with MCP tools** - Playwright prompts work with Playwright MCP server

## Common Commands

| Task | Command |
|------|---------|
| Generate Playwright test | `/playwright-generate-test` |
| Switch to TDD Red phase | `@tdd-red` |
| Get testing best practices | `/junit-best-practices` or `/nunit-best-practices` |
| Review prompt safety | `/ai-prompt-safety-review` |
| Expert React help | `@expert-react-frontend-engineer` |

## File Locations

- **Prompts:** `.github/prompts/*.prompt.md`
- **Instructions:** `.github/instructions/*.instructions.md`
- **Agents:** `.github/agents/*.agent.md`
- **Documentation:** `.github/COLLECTIONS_INSTALLED.md`
