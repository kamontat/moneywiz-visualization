<script lang="ts">
	import type { BaseProps } from '$lib/components/models'
	import Body from '$components/atoms/Body.svelte'

	type Props = BaseProps

	let { children, class: className }: Props = $props()
</script>

<Body class={className}>
	{@render children?.()}
</Body>
