<script lang="ts">
	import type { BaseProps, CustomProps, ElementProps } from '$lib/models/props'

	type Props = BaseProps &
		ElementProps<'input'> &
		CustomProps<{
			variant?: 'default' | 'error'
			fullWidth?: boolean
		}>

	let {
		type = 'text',
		variant = 'default',
		fullWidth = false,
		class: className = '',
		value = $bindable(),
		...rest
	}: Props = $props()

	const baseClass = [
		'block',
		'rounded-md',
		'border-0',
		'py-1.5',
		'text-mw-text-main',
		'shadow-sm',
		'ring-1',
		'ring-inset',
		'ring-gray-300',
		'placeholder:text-gray-400',
		'focus:ring-2',
		'focus:ring-inset',
		'focus:ring-mw-primary',
		'sm:text-sm',
		'sm:leading-6',
		'disabled:cursor-not-allowed',
		'disabled:bg-gray-50',
		'disabled:text-gray-500',
		'disabled:ring-gray-200',
	]

	const variantClass = {
		default: [],
		error: ['text-red-900', 'ring-red-300', 'placeholder:text-red-300', 'focus:ring-red-500'],
	}
</script>

<input
	{type}
	bind:value
	class={[...baseClass, ...(variantClass[variant] ?? []), fullWidth ? 'w-full' : '', className]
		.flat()
		.filter(Boolean)}
	{...rest}
/>
