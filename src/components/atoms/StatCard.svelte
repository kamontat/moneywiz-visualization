<script lang="ts">
	import type {
		BaseProps,
		CustomProps,
		VariantProps,
	} from '$lib/components/models'
	import { mergeClass, newTwClass, newVariantClass } from '$lib/components'

	type Variant = 'plain' | 'primary' | 'success' | 'error' | 'warning'
	type Props = BaseProps &
		VariantProps<Variant> &
		CustomProps<{
			title: string
			value: string
			description?: string
		}>

	let {
		variant = 'plain',
		title,
		value,
		description,
		class: className,
		...rest
	}: Props = $props()

	const valueClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		primary: newTwClass(['text-primary']),
		success: newTwClass(['text-success']),
		error: newTwClass(['text-error']),
		warning: newTwClass(['text-warning']),
	})
</script>

<div class={mergeClass(['d-stat'], className)} {...rest}>
	<div class="d-stat-title">{title}</div>
	<div class={mergeClass(['d-stat-value'], valueClass(variant))}>{value}</div>
	{#if description}
		<div class="d-stat-desc">{description}</div>
	{/if}
</div>
