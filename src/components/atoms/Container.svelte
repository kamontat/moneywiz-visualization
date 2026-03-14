<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/ui/models'
	import { mergeClass, newTwClass } from '$lib/ui'

	type Props = BaseProps & ElementProps<'div'>
	let { children, class: className, ...rest }: Props = $props()
	const baseClass = newTwClass(['flex'])
</script>

<div class={mergeClass(baseClass, className)} {...rest}>
	{@render children?.()}
</div>
