<script lang="ts">
	import type { BaseProps, ElementProps, TagName } from '$lib/models/props'

	type Props = BaseProps & ElementProps<TagName>

	const baseClass = ['container']

	let { tag = 'div', children, class: className = '', ...rest }: Props = $props()
</script>

<svelte:element this={tag} class={[...baseClass, className].flat()} {...rest}>
	{@render children?.()}
</svelte:element>
