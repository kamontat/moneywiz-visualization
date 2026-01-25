# Complete SvelteKit CI/CD Workflow Example

This workflow is tailored for the MoneyWiz Visualization project.

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  lint-and-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - name: Run Svelte checks
        run: bun run check

  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: [server, client]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Cache Bun dependencies
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
      - run: bun install --frozen-lockfile
      - name: Run ${{ matrix.project }} tests
        run: bun vitest run --project=${{ matrix.project }}

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-check, unit-tests]
    outputs:
      build-sha: ${{ github.sha }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - name: Build static site
        run: bun run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: sveltekit-build-${{ github.sha }}
          path: build/
          retention-days: 7

  e2e-tests:
    runs-on: ubuntu-latest
    needs: build
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: sveltekit-build-${{ github.sha }}
          path: build/
      - name: Install Playwright ${{ matrix.browser }}
        run: bunx playwright install --with-deps ${{ matrix.browser }}
      - name: Run E2E tests
        run: bun run test:e2e --project=${{ matrix.browser }}
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-${{ matrix.browser }}
          path: test-results/
          retention-days: 7

  deploy:
    runs-on: ubuntu-latest
    needs: [build, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://moneywiz.kamontat.net/
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: sveltekit-build-${{ github.sha }}
          path: build/
      - name: Deploy to production
        run: |
          echo "Deploying build ${{ github.sha }} to production..."
          # Add your deployment commands here (e.g., Cloudflare Pages, Vercel, etc.)
```
