<script lang="ts">
	import type { BaseProps } from '$lib/ui/models'
	import Body from '$components/atoms/Body.svelte'
	import { mergeClass, newTwClass } from '$lib/ui'

	type Props = BaseProps

	let { children, class: className }: Props = $props()
	const baseClass = newTwClass(['text-base-content'])
</script>

<Body class={mergeClass(baseClass, className)}>
	{@render children?.()}
</Body>
