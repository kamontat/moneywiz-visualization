<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/components/models'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps & ElementProps<'footer'>

	let { class: className, children, ...rest }: Props = $props()
	const baseClass = newTwClass([
		'd-footer',
		'flex',
		'flex-row',
		'items-center',
		'justify-center',
		'py-2 sm:py-4',
		'bg-neutral',
		'text-neutral-content',
	])
</script>

<footer class={mergeClass(baseClass, className)} {...rest}>
	{@render children?.()}
</footer>
