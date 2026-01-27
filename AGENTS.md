# Agentic Coding Framework

This repository uses a structured agentic workflow for AI-assisted development. All changes follow a defined lifecycle of planning, building, and archiving.

## Quick Start

Use prompts in `.github/prompts/` to guide the workflow:

```
/agentic.0.initiate      # Initialize framework (done)
/agentic.1-a.create-plan # Create a new plan
/agentic.1-b.refine-plan # Refine plan until approved (optional)
/agentic.2-a.build-app   # Implement the plan
/agentic.2-b.iterate-app # Iterate on implementation (optional)
/agentic.3.archive       # Archive and update specs
/agentic.4.deploy        # Commit changes
```

## Available Prompts

| Prompt | When to Use |
|--------|-------------|
| `0.initiate` | Initialize framework in a new repository |
| `1-a.create-plan` | Start a new feature, fix, or change |
| `1-b.refine-plan` | Iterate on plan until approved *(optional)* |
| `2-a.build-app` | Implement code for an approved plan |
| `2-b.iterate-app` | Fix bugs or adjust implementation *(optional)* |
| `3.archive` | Complete work, update specs, delete plan |
| `4.deploy` | Update docs and create git commit |

## Directory Structure

```
.agentic/
├── memories/           # Long-term rules and context
│   └── CONSTITUTION.md   # Rules AI must ALWAYS follow
├── plans/              # Active plans (temporary)
│   └── <plan-name>/
│       ├── proposal.md   # What to build (non-technical)
│       ├── tasks.md      # How to build (technical)
│       ├── tests.md      # How to verify
│       └── specs.md      # Affected specifications
├── specs/              # Canonical specifications (permanent)
│   └── <spec-name>/
│       ├── spec.md       # Requirements and constraints
│       └── changelog.md  # History of changes
└── templates/          # Handlebars templates for generating files
```

## Workflow Lifecycle

```
1. Initiate   →  Initialize context (this phase)
2. Plan       →  Create proposal, tasks, tests, affected specs
3. Refine     →  Iterate until plan is approved (optional)
4. Build      →  Implement minimal code, track progress
5. Iterate    →  Fix bugs or adjust implementation (optional)
6. Archive    →  Update specs, delete plan
7. Deploy     →  Update docs, commit changes
```

### Key Principles

- **Specs are truth** — All requirements live in spec files
- **Plans are temporary** — Deleted after archiving
- **Minimal implementation** — Only what's needed for acceptance criteria
- **No scope creep** — Stay within plan boundaries

## Commands

```bash
# Development
bun run dev              # Start dev server
bun run test             # Run all tests
bun vitest run --project=server   # Server tests only
bun vitest run --project=client   # Client tests only

# Building
bun run build            # Production build
bun run preview          # Preview production build
```

## Constitution

AI agents must follow rules in `.agentic/memories/CONSTITUTION.md`. Key rules:

- Use `bun` exclusively (never npm/npx/bunx)
- Follow Svelte 5 Runes syntax
- Write co-located tests (`.spec.ts` next to source)
- Use Conventional Commits format
- Respect atomic design in `src/components/`
