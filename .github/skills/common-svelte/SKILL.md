---
name: common-svelte
description: Develop Svelte 5 and SvelteKit applications using Runes and modern patterns. Use whenever need to modify any Svelte code including Sveltekit.
---

# Svelte 5 and SvelteKit Development

## Svelte 5 Runes (Required)

Always use Runes. **Do not use legacy stores** (`svelte/store`) or Svelte 4 syntax (`export let`).

### Basic Syntax

```svelte
<script>
	let { title, count = 0, ...rest } = $props(); // Props
	let internalCount = $state(count); // State
	let double = $derived(internalCount * 2); // Derived

	function increment() {
		internalCount += 1;
	}

	$effect(() => {
		console.log(internalCount);
		return () => console.log('cleanup');
	});
</script>

<button onclick={increment}>{double}</button>
```

### Key Variations

- **Props**: `let { prop } = $props()`
- **Bindings**: `let { value = $bindable() } = $props()`
- **Ref**: `bind:this={element}`
- **Context**: Use `setContext` and `getContext` with strongly typed keys.

### Snippets (Replacement for Slots)

```svelte
{#snippet header(text)}
	<h1>{text}</h1>
{/snippet}

{@render header('Hello')}
```

## SvelteKit Patterns

### Data Loading

- **Server Load**: `+page.server.ts`
  ```typescript
  export const load = async ({ locals }) => {
  	return { user: locals.user };
  };
  ```
- **Page Data**:
  ```svelte
  <script>
  	let { data } = $props();
  </script>
  ```

### Form Actions (`+page.server.ts`)

```typescript
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		// process
	},
};
```

## Styling

- Use **Tailwind CSS**.
- Scoped styles in `<style>` are allowed but Tailwind is preferred for this project.

## Common Pitfalls

- **Async in Effects**: Dependencies aren't tracked after `await`.
- **State in Modules**: Avoid global `$state` on the server (cross-request leaks). Use Context.
- **Updates**: `$state` arrays/objects are deeply reactive. Just mutate them (`arr.push(1)`).

## MCP Tools Integration

- Use **Svelte MCP** (`get-documentation`, `svelte-autofixer`) to validate Runes syntax if unsure.
