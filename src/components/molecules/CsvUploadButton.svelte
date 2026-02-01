<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements'
	import type {
		BaseProps,
		ComponentProps,
		ElementProps,
	} from '$lib/components/models'
	import UploadIcon from '@iconify-svelte/lucide/upload'

	import Button from '$components/atoms/Button.svelte'
	import Input from '$components/atoms/Input.svelte'
	import { parseCsvFile } from '$lib/csv'
	import { component } from '$lib/loggers'
	import { csvStore, trxStore } from '$lib/stores'
	import { parseTransactions } from '$lib/transactions'

	type Props = Omit<BaseProps, 'children'> &
		Pick<ElementProps<'input'>, 'onchange'> &
		Omit<ElementProps<'button'>, 'onclick' | 'onchange'> &
		ComponentProps<typeof Button>

	let { class: className, onchange: _onchange, ...rest }: Props = $props()
	const log = component.extends('CsvUploadButton')
	let file = $state<Input | null>(null)

	const onchange: ChangeEventHandler<HTMLInputElement> = async (event) => {
		const target = event.currentTarget
		const file = target?.files?.[0]

		if (!file) {
			log.info('no file selected')
			return
		}

		log.info('file selected: %s', file.name)
		const csv = await parseCsvFile(file)
		const transactions = parseTransactions(csv)

		csvStore.reset()
		csvStore.merge({ [file.name]: csv })

		trxStore.reset()
		trxStore.merge(transactions)
		_onchange?.(event)
	}
</script>

<Input
	type="file"
	class="sr-only"
	accept=".csv,text/csv"
	{onchange}
	bind:this={file}
/>
<Button
	variant="primary"
	aria-label="Upload CSV"
	class={className}
	onclick={() => file?.click()}
	{...rest}
>
	<UploadIcon class="h-5 w-5" aria-hidden="true" />
	<span class="ml-2 hidden sm:inline">Upload</span>
</Button>
