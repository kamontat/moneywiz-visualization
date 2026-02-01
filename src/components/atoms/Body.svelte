<script lang="ts">
	import type { BaseProps } from '$lib/components/models'
	import Container from './Container.svelte'

	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps
	let { class: className, children }: Props = $props()

	const baseClass = newTwClass(['flex', 'flex-col', 'grow', 'mt-4', 'mx-3'])
</script>

<Container class={mergeClass(baseClass, className)}>
	{@render children?.()}
</Container>
