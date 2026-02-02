<script lang="ts">
	import type {
		BaseProps,
		ElementProps,
		VariantProps,
	} from '$lib/components/models'
	import {
		mergeClass,
		newBaseClass,
		newTwClass,
		newVariantClass,
	} from '$lib/components'

	type Variant = 'plain' | 'primary' | 'secondary' | 'danger'
	type Props = BaseProps & VariantProps<Variant> & ElementProps<'button'>

	let {
		variant = 'primary',
		children,
		class: className,
		...rest
	}: Props = $props()

	const baseClass = newBaseClass(['d-btn'])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		primary: newTwClass(['d-btn-primary']),
		secondary: newTwClass(['d-btn-secondary']),
		danger: newTwClass(['d-btn-warning']),
	})
</script>

<button
	class={mergeClass(baseClass(variant), variantClass(variant), className)}
	{...rest}
>
	{@render children?.()}
</button>
