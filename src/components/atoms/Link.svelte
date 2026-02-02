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

	type Variant = 'plain' | 'primary' | 'secondary' | 'accent'
	type Props = BaseProps & VariantProps<Variant> & ElementProps<'a'>

	let { variant, children, class: className, ...rest }: Props = $props()

	const baseClass = newBaseClass(['flex', 'items-center', 'justify-center'])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass(['flex', 'items-center', 'justify-center']),
		primary: newTwClass(['d-link-primary']),
		secondary: newTwClass(['d-link-secondary']),
		accent: newTwClass(['d-link-accent']),
	})
</script>

<a
	class={mergeClass(baseClass(variant), variantClass(variant), className)}
	{...rest}
>
	{@render children?.()}
</a>
