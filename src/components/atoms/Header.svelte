<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/components/models'
	import { mergeClass, newTwClass } from '$lib/components'

	type Props = BaseProps & ElementProps<'header'>
	let { children, class: className, ...rest }: Props = $props()

	const baseClass = newTwClass([
		'd-navbar',
		'justify-between',
		'bg-base-100/30',
		'd-shadow-sm',
		'sticky',
		'top-0',
		'z-50',
		'px-3',
		'py-2',
		'sm:px-4',
		'sm:py-2',
		'backdrop-blur-sm',
	])
</script>

<header class={mergeClass(baseClass, className)} {...rest}>
	{@render children?.()}
</header>
