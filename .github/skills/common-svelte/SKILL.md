---
name: common-svelte
description: Comprehensive Svelte 5 and SvelteKit development guide. Covers Runes ($state, $derived, $effect), syntax migration, SvelteKit patterns, TypeScript integration, and best practices.
---

# Svelte 5 and SvelteKit Development

Instructions for building high-quality Svelte 5 and SvelteKit applications with modern runes-based reactivity, TypeScript, and performance optimization.

## Svelte 5 Syntax Migration

Always use Svelte 5 runes. Never use Svelte 4 patterns.

### Svelte 4 → Svelte 5

| Svelte 4 ❌ | Svelte 5 ✅ |
| --- | --- |
| `export let foo` | `let { foo } = $props()` |
| `export let foo = 'default'` | `let { foo = 'default' } = $props()` |
| `$: doubled = x * 2` | `let doubled = $derived(x * 2)` |
| `$: { sideEffect() }` | `$effect(() => { sideEffect() })` |
| `on:click={handler}` | `onclick={handler}` |
| `on:input={handler}` | `oninput={handler}` |
| `on:click\|preventDefault={h}` | `onclick={e => { e.preventDefault(); h(e) }}` |
| `<slot />` | `{@render children()}` |
| `<slot name="x" />` | `{@render x?.()}` |
| `$$props` | Use `$props()` with rest: `let { ...rest } = $props()` |
| `$$restProps` | `let { known, ...rest } = $props()` |
| `createEventDispatcher()` | Pass callback props: `let { onchange } = $props()` |

### Stores → Runes

| Svelte 4 ❌ | Svelte 5 ✅ |
| --- | --- |
| `import { writable } from 'svelte/store'` | Remove import |
| `const count = writable(0)` | `let count = $state(0)` |
| `$count` (auto-subscribe) | `count` (direct access) |
| `count.set(1)` | `count = 1` |
| `count.update(n => n + 1)` | `count += 1` |

### Quick Reference

```svelte
<script>
  // Props (with defaults and rest)
  let { required, optional = 'default', ...rest } = $props();

  // Two-way bindable prop
  let { value = $bindable() } = $props();

  // Reactive state
  let count = $state(0);
  let items = $state([]);      // arrays are deeply reactive
  let user = $state({ name: '' }); // objects too

  // Derived values
  let doubled = $derived(count * 2);
  let complex = $derived.by(() => {
    // multi-line logic here
    return expensiveCalc(count);
  });

  // Side effects
  $effect(() => {
    console.log(count);
    return () => cleanup(); // optional cleanup
  });
</script>

<!-- Events: native names, no colon -->
<button onclick={() => count++}>Click</button>
<input oninput={e => value = e.target.value} />

<!-- Render snippets (replaces slots) -->
{@render children?.()}
```

### Snippets (Replace Slots)

```svelte
<!-- Parent passes snippets -->
<Dialog>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}

  {#snippet footer(close)}
    <button onclick={close}>Done</button>
  {/snippet}
</Dialog>

<!-- Child renders them -->
<script>
  let { header, footer, children } = $props();
</script>
{@render header?.()}
{@render children?.()}
{@render footer?.(() => open = false)}
```

## Core Concepts & Architecture

### Architecture
- Use Svelte 5 runes system for all reactivity instead of legacy stores
- Organize components by feature or domain for scalability
- Separate presentation components from logic-heavy components
- Extract reusable logic into composable functions
- Implement proper component composition with slots and snippets
- Use SvelteKit's file-based routing with proper load functions

### Component Design
- Follow single responsibility principle for components
- Use `<script lang="ts">` with runes syntax as default
- Keep components small and focused on one concern
- Implement proper prop validation with TypeScript annotations
- Use `{#snippet}` blocks for reusable template logic within components
- Use slots for component composition and content projection
- Pass `children` snippet for flexible parent-child composition
- Design components to be testable and reusable

## Svelte Development Workflow (MCP Tools)

Utilize the configured Svelte MCP server to ensure code quality and bridge knowledge gaps.

### 1. Documentation Lookup
When uncertain about Svelte 5 syntax or SvelteKit patterns:
1.  Run `list-sections` to see available topics.
2.  Run `get-documentation` for the relevant sections (e.g., "$state, $derived, $effect").

### 2. Code Analysis & Validation
Before finalizing any component or when debugging:
1.  Run `svelte-autofixer` on the file path or current code.
2.  Review and apply suggested fixes for reactivity issues or deprecated patterns.

> **Terminal Tip:** When passing code with runes via terminal, escape the `$` character as `\$` (e.g., `let count = \$state(0)`).

## Reactivity and State Management

### Svelte 5 Runes System
- Use `$state()` for reactive local state management
- Implement `$derived()` for computed values and expensive calculations
- Use `$derived.by()` for complex computations beyond simple expressions
- Use `$effect()` sparingly - prefer `$derived` or function bindings for state sync
- Implement `$effect.pre()` for running code before DOM updates
- Use `untrack()` to prevent infinite loops when reading/writing same state in effects
- Define component props with `$props()` and destructuring with TypeScript annotations
- Use `$bindable()` for two-way data binding between components
- Migrate from legacy stores to runes for better performance
- Override derived values directly for optimistic UI patterns (Svelte 5.25+)

### State Management
- Use `$state()` for local component state
- Implement type-safe context with `createContext()` helper over raw `setContext`/`getContext`
- Use context API for sharing reactive state down component trees
- Avoid global `$state` modules for SSR - use context to prevent cross-request data leaks
- Use SvelteKit stores for global application state when needed
- Keep state normalized for complex data structures
- Prefer `$derived()` over `$effect()` for computed values
- Implement proper state persistence for client-side data

### Effect Best Practices
- **Avoid** using `$effect()` to synchronize state - use `$derived()` instead
- **Do** use `$effect()` for side effects: analytics, logging, DOM manipulation
- **Do** return cleanup functions from effects for proper teardown
- Use `$effect.pre()` when code must run before DOM updates (e.g., scroll position)
- Use `$effect.root()` for manually controlled effects outside component lifecycle
- Use `untrack()` to read state without creating dependencies in effects
- Remember: async code in effects doesn't track dependencies after `await`

## SvelteKit Patterns

### Routing and Layouts
- Use `+page.svelte` for page components with proper SEO
- Implement `+layout.svelte` for shared layouts and navigation
- Handle routing with SvelteKit's file-based system

### Data Loading and Mutations
- Use `+page.server.ts` for server-side data loading and API calls
- Implement form actions in `+page.server.ts` for data mutations
- Use `+server.ts` for API endpoints and server-side logic
- Use SvelteKit's load functions for server-side and universal data fetching
- Implement proper loading, error, and success states
- Handle streaming data with promises in server load functions
- Use `invalidate()` and `invalidateAll()` for cache management
- Implement optimistic updates for better user experience
- Handle offline scenarios and network errors gracefully

### Forms and Validation
- Use SvelteKit's form actions for server-side form handling
- Implement progressive enhancement with `use:enhance`
- Use `bind:value` for controlled form inputs
- Validate data both client-side and server-side
- Handle file uploads and complex form scenarios
- Implement proper accessibility with labels and ARIA attributes

## UI and Styling

### Styling
- Use component-scoped styles with `<style>` blocks
- Implement CSS custom properties for theming and design systems
- Use `class:` directive for conditional styling
- Follow BEM or utility-first CSS conventions
- Implement responsive design with mobile-first approach
- Use `:global()` sparingly for truly global styles

### Transitions and Animations
- Use `transition:` directive for enter/exit animations (fade, slide, scale, fly)
- Use `in:` and `out:` for separate enter/exit transitions
- Implement `animate:` directive with `flip` for smooth list reordering
- Create custom transitions for branded motion design
- Use `|local` modifier to trigger transitions only on direct changes
- Combine transitions with keyed `{#each}` blocks for list animations

## TypeScript and Tooling

### TypeScript Integration
- Enable strict mode in `tsconfig.json` for maximum type safety
- Annotate props with TypeScript: `let { name }: { name: string } = $props()`
- Type event handlers, refs, and SvelteKit's generated types
- Use generic types for reusable components
- Leverage `$types.ts` files generated by SvelteKit
- Implement proper type checking with `svelte-check`
- Use type inference where possible to reduce boilerplate

### Development Tools
- Use ESLint with eslint-plugin-svelte and Prettier for code consistency
- Use Svelte DevTools for debugging and performance analysis
- Keep dependencies up to date and audit for security vulnerabilities
- Document complex components and logic with JSDoc
- Follow Svelte's naming conventions (PascalCase for components, camelCase for functions)

## Production Readiness

### Performance Optimization
- Use keyed `{#each}` blocks for efficient list rendering
- Implement lazy loading with dynamic imports and `<svelte:component>`
- Use `$derived()` for expensive computations to avoid unnecessary recalculations
- Use `$derived.by()` for complex derived values that require multiple statements
- Avoid `$effect()` for derived state - it's less efficient than `$derived()`
- Leverage SvelteKit's automatic code splitting and preloading
- Optimize bundle size with tree shaking and proper imports
- Profile with Svelte DevTools to identify performance bottlenecks
- Use `$effect.tracking()` in abstractions to conditionally create reactive listeners

### Error Handling
- Implement `+error.svelte` pages for route-level error boundaries
- Use try/catch blocks in load functions and form actions
- Provide meaningful error messages and fallback UI
- Log errors appropriately for debugging and monitoring
- Handle validation errors in forms with proper user feedback
- Use SvelteKit's `error()` and `redirect()` helpers for proper responses
- Track pending promises with `$effect.pending()` for loading states

### Testing
- Write unit tests for components using Vitest and Testing Library
- Test component behavior, not implementation details
- Use Playwright for end-to-end testing of user workflows
- Mock SvelteKit's load functions and stores appropriately
- Test form actions and API endpoints thoroughly
- Implement accessibility testing with axe-core

### Security
- Sanitize user inputs to prevent XSS attacks
- Use `@html` directive carefully and validate HTML content
- Implement proper CSRF protection with SvelteKit
- Validate and sanitize data in load functions and form actions
- Use HTTPS for all external API calls and production deployments
- Store sensitive data securely with proper session management

### Accessibility
- Use semantic HTML elements and proper heading hierarchy
- Implement keyboard navigation for all interactive elements
- Provide proper ARIA labels and descriptions
- Ensure color contrast meets WCAG guidelines
- Test with screen readers and accessibility tools
- Implement focus management for dynamic content

## Common Patterns
- Renderless components with slots for flexible UI composition
- Custom actions (`use:` directives) for cross-cutting concerns and DOM manipulation
- `{#snippet}` blocks for reusable template logic within components
- Type-safe context with `createContext()` for component tree state sharing
- Progressive enhancement for forms and interactive features with `use:enhance`
- Server-side rendering with client-side hydration for optimal performance
- Function bindings (`bind:value={() => value, setValue}`) for two-way binding
- Avoid `$effect()` for state synchronization - use `$derived()` or callbacks instead

## References

- **[references/typescript.md](./references/typescript.md)** — Typing props, state, derived, snippets, events, context
- **[references/patterns.md](./references/patterns.md)** — Context API, controlled inputs, forwarding props, async data, debouncing
- **[references/gotchas.md](./references/gotchas.md)** — Reactivity edge cases, effect pitfalls, binding quirks
