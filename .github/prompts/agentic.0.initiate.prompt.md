# Initiate Phase

Initialize the agentic coding environment for a new or existing repository.

## User Input

The user will provide: `<text>` indicating the desire to initialize the framework, and potentially a description of the project if it's new.

## Prerequisites

Before proceeding, verify the following:

1. Check if `.git` directory exists
   - If not, stop and ask the user to initialize git first (or offer to do it)
2. Check if `AGENTS.md` and `.agentic/memories/CONSTITUTION.md` already exist
   - If they exist, stop and ask the user for confirmation to re-initialize
   - Warn that this might overwrite existing documentation
3. If repository is empty and user hasn't provided a description, ask for one

## Instructions

1. **Analyze the Repository**
   - Read `README.md` and project configuration files (e.g., `package.json`, `Cargo.toml`, `requirements.txt`)
   - Understand the project domain and structure
   - If context is insufficient, ask the user for a brief project description

2. **Initiate Constitution**
   - Check if `.agentic/memories/CONSTITUTION.md` exists
   - If it exists, read and preserve its rules
   - If it does not exist:
     - Ask the user for coding style, language conventions, and hard constraints
     - Create `.agentic/memories/CONSTITUTION.md` with these rules

3. **Create AGENTS.md**
   - Create (or overwrite) `AGENTS.md` in the repository root
   - Include the content described in the AGENTS.md Content section below

## AGENTS.md Content

The file must include:

- **Introduction** - Explain that this repository uses an agentic workflow
- **Framework Usage** - How to use prompts in `.github/prompts/`
- **Available Prompts** - List all prompts with when to use each:
  - `0.initiate` - Initialize framework
  - `1-a.create-plan` - Create new plan
  - `1-b.refine-plan` - Refine plan until approved _(optional)_
  - `2-a.build-app` - Implement code
  - `2-b.iterate-app` - Iterate on implementation _(optional)_
  - `3.archive` - Archive and update specs
  - `4.deploy` - Commit changes
- **File Structure** - Purpose of `.agentic/` directory:
  - `memories/` - Long-term rules and context (CONSTITUTION)
  - `plans/` - Active plans (proposal, tasks, tests, specs)
  - `specs/` - System specifications and changelogs
  - `templates/` - Handlebars templates for generating artifacts
- **Workflow** - Standard lifecycle:
  1. Initiate - Initialize context
  2. Create Plan - Define a change
  3. Refine Plan - Iterate until approved _(optional, skip if 1a meets expectations)_
  4. Build App - Implement code
  5. Iterate App - Iterate on implementation _(optional, skip if 2a meets expectations)_
  6. Archive - Update specs and cleanup
  7. Deploy - Commit changes

## Output

- `.agentic/memories/CONSTITUTION.md` (created or preserved)
- `AGENTS.md` in repository root

## Rules

- Do not proceed with code changes in this phase
- Focus on setup and documentation only
- Format `AGENTS.md` with clear Markdown
- Make `CONSTITUTION.md` comprehensive enough to guide future tasks
- Ask clarifying questions if project context is unclear
