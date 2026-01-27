<script lang="ts">
	interface Props {
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		children: import('svelte').Snippet;
		class?: string;
		id?: string;
	}
	let { level = 2, children, class: className = '', id }: Props = $props();

	const sizes = {
		1: 'text-3xl font-bold tracking-tight',
		2: 'text-2xl font-bold',
		3: 'text-lg font-semibold',
		4: 'text-base font-semibold',
		5: 'text-sm font-semibold',
		6: 'text-xs font-semibold',
	};
	const baseClass = 'text-mw-text-main m-0';
</script>

<svelte:element this={`h${level}`} {id} class="{baseClass} {sizes[level]} {className}">
	{@render children()}
</svelte:element>
