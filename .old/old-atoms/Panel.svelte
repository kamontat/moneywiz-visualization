<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/models/props'

	type Props = BaseProps & ElementProps<'div' | 'section' | 'article' | 'aside' | 'main'>

	let { tag = 'div', children, class: className = '', ...rest }: Props = $props()

	const baseClass = [
		'bg-mw-surface',
		'border',
		'border-mw-border',
		'rounded-xl',
		'p-4',
		'shadow-sm',
		'transition-shadow',
	]
</script>

<svelte:element this={tag} class={[...baseClass, className].flat()} {...rest}>
	{@render children?.()}
</svelte:element>
