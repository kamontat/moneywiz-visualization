<script lang="ts">
	interface Props {
		children: import('svelte').Snippet;
		label?: string;
	}
	let { children, label = 'Dashboard views' }: Props = $props();
</script>

<nav class="mt-4 flex border-b border-mw-border" aria-label={label}>
	{@render children()}
</nav>
