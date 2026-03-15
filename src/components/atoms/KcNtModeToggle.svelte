<script lang="ts">
	import type {
		BaseProps,
		CustomProps,
		ElementProps,
	} from '$lib/components/models'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		ElementProps<'label'> &
		CustomProps<{
			checked?: boolean
			oncheckedchange?: (checked: boolean) => void
		}>

	let {
		checked = false,
		oncheckedchange,
		class: className,
		...rest
	}: Props = $props()

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		oncheckedchange?.(target.checked)
	}
</script>

<label
	class={mergeClass(
		[
			'flex',
			'items-center',
			'gap-2',
			'px-2',
			'py-1',
			'rounded-lg',
			'cursor-pointer',
			'hover:bg-base-300/50',
			'transition-colors',
		],
		className
	)}
	{...rest}
>
	<span class="text-xs font-medium text-base-content/70">KcNt</span>
	<input
		type="checkbox"
		class="d-toggle d-toggle-primary d-toggle-xs"
		{checked}
		onchange={handleChange}
	/>
</label>
