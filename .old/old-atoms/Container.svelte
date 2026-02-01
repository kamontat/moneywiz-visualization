<script lang="ts">
	import type { BaseProps, ElementProps, TagName } from '$lib/models/props'

	type Props = BaseProps & ElementProps<TagName>

	let { tag = 'div', children, class: className = '', ...rest }: Props = $props()

	const baseClass = [] as string[]
</script>

<svelte:element this={tag} class={[...baseClass, className].flat()} {...rest}>
	{@render children?.()}
</svelte:element>
