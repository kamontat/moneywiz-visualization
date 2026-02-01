<script lang="ts">
	import type {
		BaseProps,
		VariantProps,
		ElementTagProps,
		ComponentTagProps,
		AnyComponent,
	} from '$lib/components/models'
	import { mergeClass, newBaseClass, newVariantClass } from '$lib/components'

	type TagName = 'span' | 'a' | 'button'
	type Variant = 'plain' | 'small' | 'medium' | 'large'
	type Props = Omit<BaseProps, 'children'> &
		ElementTagProps<TagName> &
		Pick<ComponentTagProps<AnyComponent>, 'Component'> &
		VariantProps<Variant>

	let { tag = 'span', variant = 'medium', class: className, Component, ...rest }: Props = $props()

	const baseClass = newBaseClass(['d-btn', 'd-btn-ghost', 'd-btn-circle'])
	const variantClass = newVariantClass<Variant>({
		plain: [],
		small: ['w-3', 'h-3', 'text-sm'],
		medium: ['w-7', 'h-7', 'text-base'],
		large: ['w-10', 'h-10', 'text-lg'],
	})
</script>

<svelte:element this={tag} class={mergeClass(baseClass(variant), className)} {...rest}>
	<Component class={variantClass(variant)} />
</svelte:element>
