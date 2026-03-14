<script lang="ts">
	import type { BaseProps, CustomProps, ElementProps } from '$lib/ui/models'
	import { mergeClass, newTwClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			open?: boolean
		}> &
		ElementProps<'div'>

	let { open = false, children, class: className, ...rest }: Props = $props()

	const baseClass = newTwClass(['flex', 'flex-col', 'gap-4'])
</script>

{#if open}
	<div class={mergeClass(baseClass, className)} {...rest}>
		{@render children?.()}
	</div>
{/if}
