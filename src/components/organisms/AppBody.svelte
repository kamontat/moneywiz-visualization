<script lang="ts">
	import type { BaseProps } from '$lib/components/models'
	import Body from '$components/atoms/Body.svelte'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps

	let { children, class: className }: Props = $props()
	const baseClass = newTwClass(['text-base-content'])
</script>

<Body class={mergeClass(baseClass, className)}>
	{@render children?.()}
</Body>
