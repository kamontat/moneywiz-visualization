<script lang="ts">
	import type { BaseProps, CustomProps, ElementProps } from '$lib/models/props'

	type Variant = 'plain' | 'primary' | 'danger' | 'icon'
	type Props = BaseProps &
		(ElementProps<'button'> | ElementProps<'input'>) &
		CustomProps<{
			variant?: Variant
			label?: string
		}>

	let {
		tag = 'button',
		variant = 'primary',
		label,
		class: className,
		children,
		...rest
	}: Props = $props()

	const baseClass = [
		'inline-flex',
		'items-center',
		'justify-center',
		'gap-2',
		'cursor-pointer',
		'transition-all',
		'duration-150',
		'ease-in-out',
		'focus-visible:outline',
		'focus-visible:outline-2',
		'focus-visible:outline-offset-2',
		'disabled:opacity-75',
		'disabled:shadow-none',
		'disabled:cursor-not-allowed',
	]
	const variantClass: Record<Variant, string[]> = {
		plain: [],
		primary: baseClass.concat([
			'px-3.5',
			'py-2',
			'text-sm',
			'font-bold',
			'text-white',
			'bg-gradient-to-br',
			'from-mw-primary',
			'to-mw-primary-dark',
			'border',
			'border-mw-primary',
			'rounded-full',
			'shadow-md',
			'shadow-mw-primary/20',
			'hover:not-disabled:from-mw-primary-dark',
			'hover:not-disabled:to-mw-primary-dark',
			'hover:not-disabled:shadow-lg',
			'hover:not-disabled:shadow-mw-primary/30',
			'hover:not-disabled:-translate-y-px',
			'focus-visible:outline-mw-primary',
		]),
		danger: baseClass.concat([
			'px-3',
			'py-2',
			'text-sm',
			'font-semibold',
			'text-red-600',
			'bg-red-50',
			'border',
			'border-red-200/50',
			'rounded-full',
			'hover:bg-red-100',
			'hover:border-red-300',
			'focus-visible:outline-red-600',
		]),
		icon: baseClass.concat(['p-2', 'rounded-full', 'hover:bg-black/5']),
	}
</script>

<svelte:element
	this={tag}
	class={[...variantClass[variant], className].flat()}
	aria-label={label}
	{...rest}
>
	{@render children?.()}
</svelte:element>
