<script lang="ts">
	import type {
		BaseProps,
		CustomProps,
		ElementProps,
		VariantProps,
	} from '$lib/components/models'
	import { mergeClass, newTwClass, newVariantClass } from '$lib/components'

	type Variant = 'include' | 'exclude'
	type Props = BaseProps &
		VariantProps<Variant> &
		CustomProps<{
			active?: boolean
		}> &
		ElementProps<'button'>

	let {
		variant = 'include',
		active = false,
		children,
		class: className,
		...rest
	}: Props = $props()

	const baseClass = newTwClass([
		'd-badge',
		'cursor-pointer',
		'd-badge-md',
		'text-sm',
		'h-auto',
		'min-h-6',
		'py-1',
		'px-2',
		'transition-all',
		'w-full',
		'max-w-full',
		'min-w-0',
		'justify-center',
		'items-center',
		'flex-wrap',
		'overflow-hidden',
	])
	const inactiveClass = newTwClass([
		'd-badge-outline',
		'text-base-content/70',
		'hover:d-badge-primary',
	])
	const activeClass = newVariantClass<Variant>({
		include: newTwClass(['border-info/30', 'bg-info/10', 'text-info']),
		exclude: newTwClass([
			'border-error/30',
			'bg-error/10',
			'text-error',
			'line-through',
			'opacity-80',
		]),
	})
</script>

<button
	type="button"
	class={mergeClass(
		baseClass,
		active ? activeClass(variant) : inactiveClass,
		className
	)}
	{...rest}
>
	<span
		class="w-full min-w-0 text-center leading-snug break-words whitespace-normal"
	>
		{@render children?.()}
	</span>
</button>
