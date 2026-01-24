You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Agent Guidelines

**Important:** When working on this project, you MUST:

1. **Always update this AGENTS.md file** after making any changes to the project configuration, setup, or resolving issues
2. **Always check available MCP tools** and utilize them if they match what you're trying to accomplish
3. **Always use Context7 and DeepWiki MCP tools** when you need to understand or search for information about 3rd-party dependencies

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

### 5. context7 (mcp_upstash_conte_*)

Use Context7 MCP tools to retrieve up-to-date documentation and code examples for any library:
- **resolve-library-id**: First, resolve the library name to get the Context7-compatible library ID
- **query-docs**: Then query documentation with the library ID and your question

Example: For TailwindCSS questions, first resolve "tailwindcss" to get library ID, then query with specific questions.

### 6. deepwiki (mcp_cognitionai_d_*)

Use DeepWiki MCP tools to explore GitHub repository documentation:
- **read_wiki_structure**: Get a list of documentation topics available in a repository
- **read_wiki_contents**: View detailed documentation about a specific GitHub repository
- **ask_question**: Ask any question about a GitHub repository

Example: For understanding how a GitHub project works, use these tools instead of manually browsing files.

---

## Project Configuration

### Deployment Target
- **Custom Domain:** https://moneywiz.kamontat.net/
- **Hosting:** Root-level deployment (no base path required)
- **Adapter:** `@sveltejs/adapter-static` for static site generation

### SvelteKit Configuration

#### svelte.config.js
```javascript
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html'
    })
  }
};
```

**Note:** No `paths.base` configuration is needed since the site deploys to a custom domain at root level.

#### Prerendering Setup
All pages must be prerendered for static deployment. This is configured in `src/routes/+layout.ts`:

```typescript
// Prerender all pages for static deployment
export const prerender = true;
```

This ensures all routes are statically generated at build time, which is required for static hosting.

### Image Handling

Images imported from `$lib/images/` are automatically processed by Vite during build:
- Images are hashed and placed in `build/_app/immutable/assets/`
- Paths are resolved as absolute from root (e.g., `/_app/immutable/assets/svelte-welcome.BVO9-vKb.webp`)
- Works correctly for root-level deployment without requiring manual path resolution

Example usage:
```svelte
<script lang="ts">
  import welcome from '$lib/images/svelte-welcome.webp';
</script>

<img src={welcome} alt="Welcome" />
```

### Service Worker

An empty service worker (`static/sw.js`) is included to prevent 404 errors from SvelteKit's client-side service worker update checks:

```javascript
// Empty service worker to prevent 404 errors
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
```

This file is copied to `build/sw.js` during the build process.

### Build Commands

- `bun run dev` - Development server
- `bun run build` - Production build (outputs to `build/` directory)
- `bun run preview` - Preview production build locally

### Common Issues & Solutions

1. **404 /sw.js Error**
   - Fixed by adding empty service worker in `static/sw.js`

2. **Images Not Loading**
   - Ensure `src/routes/+layout.ts` has `export const prerender = true`
   - Images from `src/lib/images/` are automatically processed by Vite
   - No manual path resolution needed for root-level deployment

3. **Routes Not Rendering**
   - All routes must be prerendered with `export const prerender = true`
   - Set at root layout level to apply to all pages

---

## Installed GitHub Copilot Collections

This project has three curated GitHub Copilot collections installed from [awesome-copilot](https://github.com/github/awesome-copilot) to enhance development workflow:

### 1. Frontend Web Development Collection (11 items)

Essential prompts, instructions, and agents for modern frontend web development including React, Angular, Vue, TypeScript, and CSS frameworks.

**Installed Assets:**
- **Instructions:** Angular, Next.js, Next.js + Tailwind, ReactJS, TanStack Start + Shadcn, VueJS 3, Node.js + JavaScript + Vitest, Playwright Python, Playwright TypeScript
- **Agents:** Electron Angular Native, Expert React Frontend Engineer
- **Prompts:** Playwright Generate Test, Playwright Explore Website

**Usage Examples:**
- React Development: Instructions automatically apply to `.tsx`, `.jsx` files
- Next.js + Tailwind: Instructions guide best practices for App Router, Server Components, and Tailwind
- Playwright Testing: Use `/playwright-generate-test` prompt to create e2e tests with MCP integration
- Expert React Agent: Switch to specialized React agent for complex component development

### 2. Testing & Test Automation Collection (11 items)

Comprehensive collection for writing tests, test automation, and test-driven development including unit tests, integration tests, and end-to-end testing strategies.

**Installed Assets:**
- **Agents:** Playwright Tester, TDD Red Phase, TDD Green Phase, TDD Refactor Phase
- **Prompts:** JUnit Best Practices, NUnit Best Practices, AI Prompt Safety Review
- **Instructions:** Playwright Python, Playwright TypeScript

**Usage Examples:**
- **TDD Workflow:** Use three specialized TDD agents for Test-Driven Development cycle:
  1. **/red**: TDD Red Phase agent - Write failing tests first based on GitHub issue requirements
  2. **/green**: TDD Green Phase agent - Implement minimal code to make tests pass
  3. **/refactor**: TDD Refactor Phase agent - Improve code quality while keeping tests green
- **Playwright Testing:** Use `/playwright-generate-test` prompt to create e2e tests with MCP integration
- **Best Practices:** Use `/junit-best-practices` or `/nunit-best-practices` for unit testing guidance

### 3. Security & Code Quality Collection (6 items)

Security frameworks, accessibility guidelines, performance optimization, and code quality best practices for building secure, maintainable, and high-performance applications.

**Installed Assets:**
- **Instructions:** Accessibility, Object Calisthenics, Performance Optimization, Secure Coding (OWASP), Self-Explanatory Code
- **Prompts:** AI Prompt Safety Review

**Usage Examples:**
- **Accessibility:** Instructions automatically apply to ensure WCAG compliance in web code
- **Security:** OWASP guidelines automatically enforce secure coding practices (SQL injection prevention, XSS protection, etc.)
- **Performance:** Instructions guide optimization strategies for frontend, backend, and database
- **Code Quality:** Object Calisthenics rules enforce clean, maintainable code in business logic
- **Prompt Safety:** Use `/ai-prompt-safety-review` to analyze and improve AI prompts for safety and bias

### How to Use Installed Assets

**Instructions (.instructions.md):**
- Automatically activate when editing matching files
- Apply project-specific coding standards and best practices
- No explicit invocation needed - they're always active in context

**Prompts (.prompt.md):**
- Invoke with `/` in GitHub Copilot Chat (e.g., `/playwright-generate-test`)
- Run from Command Palette: `Chat: Run Prompt`
- Click run button when viewing prompt file in VS Code

**Agents (.agent.md):**
- Switch agents using `@agent-name` in Copilot Chat (e.g., `@tdd-red`)
- Specialized agents provide focused expertise for specific tasks
- Can hand off between agents for workflow automation

### Collection Benefits for This Project

1. **Svelte/TypeScript Development:** React and TypeScript instructions provide relevant patterns adaptable to Svelte
2. **Playwright Integration:** Test automation tools work seamlessly with existing Playwright + Vitest setup
3. **Tailwind CSS:** Next.js + Tailwind instructions align with project's Tailwind 4 configuration
4. **Security & Performance:** OWASP and performance guidelines ensure production-ready code
5. **Test-Driven Development:** TDD agents enable disciplined testing workflow with GitHub issue integration

