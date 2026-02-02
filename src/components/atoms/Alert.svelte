<script lang="ts">
	import type {
		BaseProps,
		CustomProps,
		VariantProps,
	} from '$lib/components/models'
	import SuccessIcon from '@iconify-svelte/lucide/badge-check'
	import ErrorIcon from '@iconify-svelte/lucide/circle-x'
	import InfoIcon from '@iconify-svelte/lucide/info'
	import WarnIcon from '@iconify-svelte/lucide/triangle-alert'

	import { mergeClass, newBaseClass, newVariantClass } from '$lib/components'
	import { component } from '$lib/loggers'

	export type Variant = 'plain' | 'info' | 'success' | 'warning' | 'error'
	type Props = BaseProps &
		VariantProps<Variant> &
		CustomProps<{
			id?: string
			onclose?: (id?: string) => void
		}>

	let {
		id,
		variant,
		class: className,
		onclose: _onclose,
		children,
	}: Props = $props()
	let element = $state<HTMLButtonElement | null>(null)
	const log = component.extends('AlertMessage')

	const baseClass = newBaseClass([
		'd-alert',
		'dark:d-alert-soft',
		'd-alert-vertical',
		'sm:d-alert-horizontal',
		'mt-3',
		'mx-2',
		'py-2',
	])
	const variantClass = newVariantClass<Variant>({
		plain: ['d-alert'],
		info: ['d-alert-info'],
		success: ['d-alert-success'],
		warning: ['d-alert-warning'],
		error: ['d-alert-error'],
	})

	const onclose = () => {
		log.debug('closing alert message')
		element?.classList.remove('opacity-100')
		element?.classList.add('opacity-0')
	}
	const close = () => {
		log.debug('removing alert message from DOM')
		element?.parentNode?.removeChild(element)
		element = null
		_onclose?.(id)
	}
</script>

<button
	{id}
	class="opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none"
	onclick={onclose}
	bind:this={element}
	ontransitionend={close}
>
	<div
		class={mergeClass(baseClass(variant), variantClass(variant), className)}
		role="alert"
	>
		{#if variant === 'info'}
			<InfoIcon class="h-6 w-6" />
		{:else if variant === 'success'}
			<SuccessIcon class="h-6 w-6" />
		{:else if variant === 'warning'}
			<WarnIcon class="h-6 w-6" />
		{:else if variant === 'error'}
			<ErrorIcon class="h-6 w-6" />
		{/if}
		<span>{@render children?.()}</span>
	</div>
</button>
