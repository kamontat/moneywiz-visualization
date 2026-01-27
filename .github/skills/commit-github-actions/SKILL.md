---
name: commit-github-actions
description: Build, configure, and optimize CI/CD pipelines using GitHub Actions. Use when designing workflows, creating automated building/testing/deploying workflows, implementing security best practices (secrets, OIDC), optimizing performance, or troubleshooting failed jobs.
---

# GitHub Actions CI/CD Best Practices

## Project Context

This project (MoneyWiz Visualization) uses the following stack:

| Component       | Technology                                         |
| --------------- | -------------------------------------------------- |
| Framework       | SvelteKit (Svelte 5) with @sveltejs/adapter-static |
| Package Manager | Bun                                                |
| Unit Testing    | Vitest (server + client projects)                  |
| E2E Testing     | Playwright                                         |
| Styling         | TailwindCSS 4                                      |
| Deployment      | Static site to https://moneywiz.kamontat.net/      |

**Key Commands:**
- `bun install` - Install dependencies
- `bun run build` - Build static site
- `bun run check` - TypeScript and Svelte checks
- `bun run test` - Run all tests (unit + e2e)
- `bun vitest run --project=server` - Server-side unit tests
- `bun vitest run --project=client` - Svelte component tests
- `bun run test:e2e` - Playwright E2E tests

## Core Concepts and Structure

### 1. Workflow Structure (`.github/workflows/*.yml`)

- **Principle:** Workflows should be clear, modular, and easy to understand.
- **Naming:** Use descriptive names (e.g., `build-and-test.yml`).
- **Triggers:** Use granular triggers (e.g., `branches: [main]`). Use `workflow_dispatch` for manual runs.
- **Concurrency:** Prevent race conditions with `concurrency` groups.
- **Permissions:** Set least-privilege `permissions` at the workflow level.

### 2. Jobs

- **Principle:** Jobs represent independent phases (build, test, deploy).
- **Runners:** Use `runs-on: ubuntu-latest` unless checking OS compatibility.
- **Dependencies:** Use `needs` to define execution order.
- **Outputs:** Pass data between jobs using `outputs`.
- **Conditionals:** Use `if` conditions (e.g., `if: github.ref == 'refs/heads/main'`).

### 3. Steps and Actions

- **Principle:** Atomic steps with versioned actions.
- **Versioning:** Pin actions to a commit SHA or specific version tag (e.g., `@v4`) for security.
- **Shell:** Use `run` for commands. Combine related commands with `&&` or `|` for scripts.
- **Inputs:** Provide explicit `with` inputs.

## Security Best Practices

### 1. Secret Management
- Use `secrets.<NAME>` for sensitive data.
- Never print secrets to logs.

### 2. OIDC
- Use OIDC for cloud provider authentication to avoid long-lived credentials.

### 3. Least Privilege
- Restrict `GITHUB_TOKEN` permissions. Default to `contents: read`.

### 4. Security Scanning
- Integrate tools like CodeQL or dependency reviewers.

## Optimization

- **Caching:** Use `actions/cache` for dependencies (`node_modules`, `~/.bun`).
- **Matrix:** Use `strategy.matrix` for parallel testing across versions/OS.
- **Checkout:** Use `fetch-depth: 1` generally.

## Troubleshooting

- **Workflow not triggering:** Check `on` filters and paths.
- **Permissions errors:** Verify `permissions` and token scopes.
- **Cache misses:** Check `key` logic and paths.
- **Flaky tests:** Isolate tests and add retries.

## References
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
