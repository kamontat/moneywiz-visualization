<script lang="ts">
	interface Props {
		tag?: 'p' | 'span' | 'div' | 'label';
		variant?: 'body' | 'muted' | 'small' | 'error';
		children: import('svelte').Snippet;
		class?: string;
		for?: string;
	}
	let { tag = 'p', variant = 'body', children, class: className = '', ...rest }: Props = $props();

	const variants = {
		body: 'text-mw-text-main',
		muted: 'text-mw-text-muted',
		small: 'text-xs text-secondary',
		error: 'text-red-500 text-sm'
	};
</script>

<svelte:element this={tag} class="{variants[variant]} {className}" {...rest}>
	{@render children()}
</svelte:element>
