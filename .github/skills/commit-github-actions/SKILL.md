---
name: commit-github-actions
description: Comprehensive guide for building robust, secure, and efficient CI/CD pipelines using GitHub Actions. Covers workflow structure, jobs, steps, environment variables, secret management, caching, matrix strategies, testing, and deployment strategies.
---

# GitHub Actions CI/CD Best Practices

## When to Use This Skill

Use this skill when:
- Designing or optimizing CI/CD pipelines using GitHub Actions.
- Creating automated workflows for building, testing, and deploying applications.
- Implementing security best practices for GitHub Actions (secrets, OIDC, permissions).
- Optimizing workflow performance (caching, matrix strategies).
- Troubleshooting failed workflows or skipped jobs.

## Project Context

This project (MoneyWiz Visualization) uses the following stack:

| Component | Technology |
|-----------|------------|
| Framework | SvelteKit (Svelte 5) with @sveltejs/adapter-static |
| Package Manager | Bun |
| Unit Testing | Vitest (server + client projects) |
| E2E Testing | Playwright |
| Styling | TailwindCSS 4 |
| Deployment | Static site to https://moneywiz.kamontat.net/ |

**Key Commands:**
- `bun install` - Install dependencies
- `bun run build` - Build static site
- `bun run check` - TypeScript and Svelte checks
- `bun run test` - Run all tests (unit + e2e)
- `bun vitest run --project=server` - Server-side unit tests
- `bun vitest run --project=client` - Svelte component tests
- `bun run test:e2e` - Playwright E2E tests

## Core Concepts and Structure

### **1. Workflow Structure (`.github/workflows/*.yml`)**

- **Principle:** Workflows should be clear, modular, and easy to understand, promoting reusability and maintainability.
- **Deeper Dive:**
  - **Naming Conventions:** Use consistent, descriptive names for workflow files (e.g., `build-and-test.yml`, `deploy-prod.yml`).
  - **Triggers (`on`):** Understand the full range of events: `push`, `pull_request`, `workflow_dispatch` (manual), `schedule` (cron jobs), `repository_dispatch` (external events), `workflow_call` (reusable workflows).
  - **Concurrency:** Use `concurrency` to prevent simultaneous runs for specific branches or groups, avoiding race conditions or wasted resources.
  - **Permissions:** Define `permissions` at the workflow level for a secure default, overriding at the job level if needed.
- **Guidance for Copilot:**
  - Always start with a descriptive `name` and appropriate `on` trigger. Suggest granular triggers for specific use cases (e.g., `on: push: branches: [main]` vs. `on: pull_request`).
  - Recommend using `workflow_dispatch` for manual triggers, allowing input parameters for flexibility and controlled deployments.
  - Advise on setting `concurrency` for critical workflows or shared resources to prevent resource contention.
  - Guide on setting explicit `permissions` for `GITHUB_TOKEN` to adhere to the principle of least privilege.
- **Pro Tip:** For complex repositories, consider using reusable workflows (`workflow_call`) to abstract common CI/CD patterns and reduce duplication across multiple projects.

### **2. Jobs**

- **Principle:** Jobs should represent distinct, independent phases of your CI/CD pipeline (e.g., build, test, deploy, lint, security scan).
- **Deeper Dive:**
  - **`runs-on`:** Choose appropriate runners. `ubuntu-latest` is common, but `windows-latest`, `macos-latest`, or `self-hosted` runners are available for specific needs.
  - **`needs`:** Clearly define dependencies. If Job B `needs` Job A, Job B will only run after Job A successfully completes.
  - **`outputs`:** Pass data between jobs using `outputs`. This is crucial for separating concerns (e.g., build job outputs artifact path, deploy job consumes it).
  - **`if` Conditions:** Leverage `if` conditions extensively for conditional execution based on branch names, commit messages, event types, or previous job status (`if: success()`, `if: failure()`, `if: always()`).
  - **Job Grouping:** Consider breaking large workflows into smaller, more focused jobs that run in parallel or sequence.
- **Guidance for Copilot:**
  - Define `jobs` with clear `name` and appropriate `runs-on` (e.g., `ubuntu-latest`, `windows-latest`, `self-hosted`).
  - Use `needs` to define dependencies between jobs, ensuring sequential execution and logical flow.
  - Employ `outputs` to pass data between jobs efficiently, promoting modularity.
  - Utilize `if` conditions for conditional job execution (e.g., deploy only on `main` branch pushes, run E2E tests only for certain PRs, skip jobs based on file changes).

### **3. Steps and Actions**

- **Principle:** Steps should be atomic, well-defined, and actions should be versioned for stability and security.
- **Deeper Dive:**
  - **`uses`:** Referencing marketplace actions (e.g., `actions/checkout@v4`, `actions/setup-node@v3`) or custom actions. Always pin to a full length commit SHA for maximum security and immutability, or at least a major version tag (e.g., `@v4`). Avoid pinning to `main` or `latest`.
  - **`name`:** Essential for clear logging and debugging. Make step names descriptive.
  - **`run`:** For executing shell commands. Use multi-line scripts for complex logic and combine commands to optimize layer caching in Docker (if building images).
  - **`env`:** Define environment variables at the step or job level. Do not hardcode sensitive data here.
  - **`with`:** Provide inputs to actions. Ensure all required inputs are present.
- **Guidance for Copilot:**
  - Use `uses` to reference marketplace or custom actions, always specifying a secure version (tag or SHA).
  - Use `name` for each step for readability in logs and easier debugging.
  - Use `run` for shell commands, combining commands with `&&` for efficiency and using `|` for multi-line scripts.
  - Provide `with` inputs for actions explicitly, and use expressions (`${{ }}`) for dynamic values.

## Security Best Practices

### **1. Secret Management**

- Use GitHub Secrets for sensitive information (API keys, passwords, cloud credentials, tokens).
- Access secrets via `secrets.<SECRET_NAME>` in workflows.
- Use environment-specific secrets for deployment environments to enforce stricter access controls and approvals.

### **2. OpenID Connect (OIDC) for Cloud Authentication**

- Use OIDC for secure, credential-less authentication with cloud providers (AWS, Azure, GCP, etc.).
- Eliminates the need for long-lived static credentials.

### **3. Least Privilege for `GITHUB_TOKEN`**

- Configure `permissions` at the workflow or job level to restrict access.
- Default to `contents: read` as the baseline.

### **4. Dependency Review and SAST**

- Integrate Software Composition Analysis (SCA) and Static Application Security Testing (SAST) tools (CodeQL, dependency-review-action, etc.) into the CI pipeline.

## Optimization and Performance

### **1. Caching GitHub Actions**

- Use `actions/cache` to cache dependencies and build outputs.
- Design effective cache keys using `hashFiles`.

### **2. Matrix Strategies for Parallelization**

- Use `strategy.matrix` to run jobs across multiple configurations concurrently.

### **3. Fast Checkout**

- Use `actions/checkout@v4` with `fetch-depth: 1` as the default to save time and bandwidth.

## Troubleshooting

See [Troubleshooting Common GitHub Actions Issues](./references/troubleshooting.md) for detailed guidance.

| Issue | Resolution |
|-------|------------|
| Workflow not triggering | Check `on` triggers, `branches`/`paths` filters, and `if` conditions. |
| Permissions errors | Verify `permissions` block and `GITHUB_TOKEN` scope. |
| Cache misses | Validate cache `key` logic and ensure `path` existence. |
| Flaky tests | Ensure isolation, eliminate race conditions with explicit waits, and use retries. |

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Project CI/CD Pipeline Example](./references/pipeline-example.md)
- [Troubleshooting Guide](./references/troubleshooting.md)
