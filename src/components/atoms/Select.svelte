<script lang="ts">
	import type { BaseProps, CustomProps, ElementProps, VariantProps } from '$lib/components/models'
	import { mergeClass, newBaseClass, newTwClass, newVariantClass } from '$lib/components'

	type Value = string | { label: string; value: string }
	type Variant = 'plain'
	type Props = Omit<BaseProps, 'children'> &
		VariantProps<Variant> &
		ElementProps<'select'> &
		CustomProps<{
			value: string | undefined
			values: Value[]
		}>

	let { variant, value = $bindable(), values, class: className, ...rest }: Props = $props()

	const baseClass = newBaseClass(['d-select', 'focus:outline-none', 'active:outline-none'])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass([]),
	})
</script>

<select
	class={mergeClass(baseClass(variant), variantClass(variant), className)}
	bind:value
	{...rest}
>
	{#if value}
		{#each values as v (v)}
			<option value={typeof v === 'string' ? v : v.value}>
				{typeof v === 'string' ? v : v.label}
			</option>
		{/each}
	{/if}
</select>
