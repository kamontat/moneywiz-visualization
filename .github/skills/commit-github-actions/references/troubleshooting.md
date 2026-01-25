# Troubleshooting Common GitHub Actions Issues

This section provides a guide to diagnosing and resolving frequent problems encountered when working with GitHub Actions workflows.

### **1. Workflow Not Triggering or Jobs/Steps Skipping Unexpectedly**

- **Root Causes:** Mismatched `on` triggers, incorrect `paths` or `branches` filters, erroneous `if` conditions, or `concurrency` limitations.
- **Actionable Steps:**
  - **Verify Triggers:** Check the `on` block for exact match with the event that should trigger the workflow.
  - **Inspect `if` Conditions:** Review all `if` conditions. Use `always()` on a debug step to print context variables.
  - **Check `concurrency`:** Verify if a previous run is blocking a new one.

### **2. Permissions Errors (`Resource not accessible by integration`, `Permission denied`)**

- **Root Causes:** `GITHUB_TOKEN` lacking necessary permissions, incorrect environment secrets access, or insufficient permissions for external actions.
- **Actionable Steps:**
  - **`GITHUB_TOKEN` Permissions:** Review the `permissions` block. Default to `contents: read` globally.
  - **Secret Access:** Verify secret configuration and ensure the workflow has access to the environment.

### **3. Caching Issues (`Cache not found`, `Cache miss`, `Cache creation failed`)**

- **Root Causes:** Incorrect cache key logic, `path` mismatch, cache size limits, or frequent cache invalidation.
- **Actionable Steps:**
  - **Validate Cache Keys:** Ensure keys dynamically change only when dependencies change.
  - **Check `path`:** Ensure the specified path matches the directory where dependencies are installed.

### **4. Long Running Workflows or Timeouts**

- **Root Causes:** Inefficient steps, lack of parallelism, large dependencies, unoptimized Docker image builds, or resource bottlenecks on runners.
- **Actionable Steps:**
  - **Profile Execution Times:** Identify the longest-running jobs and steps.
  - **Optimize Steps:** Combine `run` commands, clean up temporary files, and leverage caching.

### **5. Flaky Tests in CI (`Random failures`, `Passes locally, fails in CI`)**

- **Root Causes:** Non-deterministic tests, race conditions, environmental inconsistencies, or poor test isolation.
- **Actionable Steps:**
  - **Ensure Test Isolation:** Each test should be independent and clean up resources.
  - **Eliminate Race Conditions:** Use explicit waits instead of arbitrary `sleep`.
  - **Debugging Tools:** Capture screenshots and video recordings on test failure.

### **6. Deployment Failures (Application Not Working After Deploy)**

- **Root Causes:** Configuration drift, environmental differences, missing runtime dependencies, application errors, or network issues post-deployment.
- **Actionable Steps:**
  - **Thorough Log Review:** Review application and server logs.
  - **Post-Deployment Health Checks:** Implement robust automated smoke tests.
  - **Rollback Immediately:** If a production deployment fails, trigger the rollback strategy.
