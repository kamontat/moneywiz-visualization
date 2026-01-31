<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/components/models'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps & ElementProps<'div'>
	let { children, class: className, ...rest }: Props = $props()
	const baseClass = newTwClass(['flex'])
</script>

<div class={mergeClass(baseClass, className)} {...rest}>
	{@render children?.()}
</div>
