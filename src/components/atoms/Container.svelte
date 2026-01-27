<script lang="ts">
	interface Props {
		tag?: string;
		children?: import('svelte').Snippet;
		class?: string;
		// Generic HTML props can be expanded if needed, but keeping simple for now
		[key: string]: any;
	}
	let { tag = 'div', children, class: className = '', ...rest }: Props = $props();
</script>

<svelte:element this={tag} class={className} {...rest}>
	{@render children?.()}
</svelte:element>
