<script lang="ts">
	import type {
		BaseProps,
		Children,
		CustomProps,
		VariantProps,
	} from '$lib/components/models'
	import { mergeClass, newTwClass, newVariantClass } from '$lib/components'

	type Variant = 'plain' | 'income' | 'expense' | 'neutral' | 'highlight'
	type Props = Omit<BaseProps, 'children'> &
		VariantProps<Variant> &
		CustomProps<{
			title: string
			value: string
			description?: string
			icon?: Children
		}>

	let {
		variant = 'plain',
		title,
		value,
		description,
		icon,
		class: className,
		...rest
	}: Props = $props()

	const containerClass = newVariantClass<Variant>({
		plain: newTwClass(['bg-base-200']),
		income: newTwClass(['bg-success/10', 'border', 'border-success/20']),
		expense: newTwClass(['bg-error/10', 'border', 'border-error/20']),
		neutral: newTwClass(['bg-info/10', 'border', 'border-info/20']),
		highlight: newTwClass(['bg-primary/10', 'border', 'border-primary/20']),
	})

	const valueClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		income: newTwClass(['text-success']),
		expense: newTwClass(['text-error']),
		neutral: newTwClass(['text-info']),
		highlight: newTwClass(['text-primary']),
	})

	const iconClass = newVariantClass<Variant>({
		plain: newTwClass(['text-base-content/60']),
		income: newTwClass(['text-success']),
		expense: newTwClass(['text-error']),
		neutral: newTwClass(['text-info']),
		highlight: newTwClass(['text-primary']),
	})

	const baseClass = newTwClass([
		'd-stat',
		'rounded-box',
		'p-4',
		'transition-all',
		'duration-200',
	])
</script>

<div
	class={mergeClass(baseClass, containerClass(variant), className)}
	{...rest}
>
	{#if icon}
		<div class={mergeClass(['d-stat-figure'], iconClass(variant))}>
			{@render icon()}
		</div>
	{/if}
	<div class="d-stat-title text-base-content/70">{title}</div>
	<div
		class={mergeClass(
			['d-stat-value', 'text-2xl', 'sm:text-3xl'],
			valueClass(variant)
		)}
	>
		{value}
	</div>
	{#if description}
		<div class="d-stat-desc mt-1 text-base-content/50">{description}</div>
	{/if}
</div>
