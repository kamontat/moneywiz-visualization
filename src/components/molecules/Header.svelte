<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = '',
	}: {
		children?: Snippet;
		class?: string;
	} = $props();

	// Sticky header styles
	const headerClass =
		'sticky top-0 z-50 flex flex-row items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2 bg-white/70 dark:bg-mw-surface-alt/80 backdrop-blur-md border-b border-mw-border/50';
</script>

<header class="{headerClass} {className}">
	{@render children?.()}
</header>
