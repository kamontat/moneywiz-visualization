# MoneyWiz Visualization

A Svelte-based web application for visualizing MoneyWiz CSV export data. Upload your MoneyWiz financial reports and get an interactive dashboard with income/expense breakdowns, category analysis, and trend charts.

**Live Demo:** https://moneywiz.kamontat.net/
**Local Dev:** http://localhost:5173/

## Constitution

All AI agents **must follow** the rules defined in [CONSTITUTION.md](./.agentic/memories/CONSTITUTION.md).

Key rules include:

- Use `bun` exclusively (never `npm`, `npx`, or `bunx`)
- TypeScript required with Svelte 5 Runes syntax
- Atomic Design for components (`atoms/`, `molecules/`, `organisms/`)
- Run `bun run fix` and `bun run check` after any code changes
- Conventional Commits format for git messages

## Commands

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `bun run dev`       | Start development server (port 5173)    |
| `bun run build`     | Create production build                 |
| `bun run preview`   | Preview production build                |
| `bun run check`     | Validate formatting, linting, and types |
| `bun run fix`       | Auto-fix formatting and linting issues  |
| `bun run test`      | Run all tests (unit + E2E)              |
| `bun run test:unit` | Run unit tests with Vitest              |
| `bun run test:e2e`  | Run E2E tests with Playwright           |
| `bun run format`    | Format code with Prettier               |
| `bun run lint`      | Lint code with ESLint                   |

## AI Frameworks

This project uses the **Agentic Coding Framework** for structured AI-assisted development.

### Workflow Phases

| Phase | Command                    | Purpose                       |
| ----- | -------------------------- | ----------------------------- |
| 0     | `/agentic.0.initiate`      | Initialize framework          |
| 1a    | `/agentic.1-a.create-plan` | Create a new plan             |
| 1b    | `/agentic.1-b.refine-plan` | Refine plan until approved    |
| 2a    | `/agentic.2-a.build-app`   | Implement the plan            |
| 2b    | `/agentic.2-b.iterate-app` | Iterate on implementation     |
| 3     | `/agentic.3.archive`       | Archive plan and update specs |
| 4     | `/agentic.4.deploy`        | Update docs and commit        |

### Key Concepts

- **Plans** (`.agentic/plans/`): Temporary working documents for active development
- **Specs** (`.agentic/specs/`): Permanent canonical specifications (source of truth)
- **Memories** (`.agentic/memories/`): AI rules and context files

For detailed documentation, read [.agentic/README.md](./.agentic/README.md).
