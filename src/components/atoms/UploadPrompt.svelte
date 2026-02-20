<script lang="ts">
	import type { BaseProps } from '$lib/components/models'
	import FileSpreadsheetIcon from '@iconify-svelte/lucide/file-spreadsheet'
	import UploadIcon from '@iconify-svelte/lucide/upload'

	import { mergeClass, newTwClass } from '$lib/components'

	type Props = Omit<BaseProps, 'children'>

	let { class: className, ...rest }: Props = $props()

	const baseClass = newTwClass([
		'rounded-box',
		'border-2',
		'border-base-300',
		'border-dashed',
		'bg-base-200/30',
		'p-8',
		'sm:p-12',
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'text-center',
		'gap-6',
		'transition-colors',
		'duration-200',
		'hover:border-primary/50',
		'hover:bg-base-200/50',
	])
</script>

<div class={mergeClass(baseClass, className)} {...rest}>
	<div class="relative">
		<div
			class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
		>
			<FileSpreadsheetIcon class="h-10 w-10 text-primary" aria-hidden="true" />
		</div>
		<div
			class="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-base-100 shadow-md"
		>
			<UploadIcon class="h-4 w-4 text-base-content/60" aria-hidden="true" />
		</div>
	</div>
	<div class="flex flex-col gap-2">
		<p class="text-xl font-semibold text-base-content">Upload your data</p>
		<p class="max-w-sm text-sm text-base-content/60">
			Click the <span class="font-medium text-primary">Upload</span> button in the
			header to import your MoneyWiz SQLite database
		</p>
	</div>
	<div
		class="flex flex-wrap items-center justify-center gap-4 text-xs text-base-content/50"
	>
		<span class="flex items-center gap-1">
			<span class="inline-block h-2 w-2 rounded-full bg-success"></span>
			Track income
		</span>
		<span class="flex items-center gap-1">
			<span class="inline-block h-2 w-2 rounded-full bg-error"></span>
			Monitor expenses
		</span>
		<span class="flex items-center gap-1">
			<span class="inline-block h-2 w-2 rounded-full bg-info"></span>
			View transfers
		</span>
	</div>
</div>
