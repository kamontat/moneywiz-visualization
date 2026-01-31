<script lang="ts">
	interface Props {
		children: import('svelte').Snippet
		label?: string
	}
	let { children, label = 'Dashboard views' }: Props = $props()
</script>

<nav class="border-mw-border mt-4 flex border-b" aria-label={label}>
	{@render children()}
</nav>
