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
	type Props = Omit<BaseProps, 'children'> &
		VariantProps<Variant> &
		ElementProps<'input'>
	let { variant = 'primary', class: className, ...rest }: Props = $props()

	const baseClass = newBaseClass([])
	const variantClass = newVariantClass<Variant>({
		plain: newTwClass([]),
		primary: newTwClass([
			'bg-primary',
			'text-primary-content',
			'hover:bg-primary/90',
		]),
		secondary: newTwClass([
			'bg-base-200',
			'text-base-content',
			'hover:bg-base-300',
		]),
		danger: newTwClass(['bg-error', 'text-error-content', 'hover:bg-error/90']),
	})

	let element = $state<HTMLInputElement | null>(null)
	export const click = () => {
		element?.click()
	}
</script>

<input
	class={mergeClass(baseClass(variant), variantClass(variant), className)}
	bind:this={element}
	{...rest}
/>
