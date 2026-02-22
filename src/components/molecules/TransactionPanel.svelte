<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import Select from '$components/atoms/Select.svelte'
	import TransactionTable from '$components/molecules/TransactionTable.svelte'
	import { mergeClass } from '$lib/components'

	const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

	type PaginationItem =
		| {
				type: 'page'
				value: number
		  }
		| {
				type: 'ellipsis'
				key: string
		  }

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			totalCount?: number
			page?: number
			pageSize?: number
			totalPages?: number
			title?: string
			question?: string
			onpagechange?: (page: number) => void
			onpagesizechange?: (pageSize: number) => void
		}>

	let {
		transactions,
		totalCount = 0,
		page = 1,
		pageSize = 10,
		totalPages = 1,
		title,
		question,
		onpagechange,
		onpagesizechange,
		class: className,
		...rest
	}: Props = $props()

	const hasPreviousPage = $derived(page > 1)
	const hasNextPage = $derived(page < totalPages)
	const pageSizeValues = PAGE_SIZE_OPTIONS.map((size) => ({
		label: String(size),
		value: String(size),
	}))
	const selectedPageSize = $derived(String(pageSize))

	const buildPaginationItems = (
		currentPage: number,
		maxPages: number
	): PaginationItem[] => {
		if (maxPages <= 0) return []

		const pages: number[] = []
		const addPage = (pageNumber: number) => {
			if (
				pageNumber >= 1 &&
				pageNumber <= maxPages &&
				!pages.includes(pageNumber)
			) {
				pages.push(pageNumber)
			}
		}

		addPage(1)
		addPage(maxPages)

		if (maxPages <= 7) {
			for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
				addPage(pageNumber)
			}
		} else if (currentPage <= 4) {
			for (let pageNumber = 1; pageNumber <= 5; pageNumber += 1) {
				addPage(pageNumber)
			}
		} else if (currentPage >= maxPages - 3) {
			for (
				let pageNumber = maxPages - 4;
				pageNumber <= maxPages;
				pageNumber += 1
			) {
				addPage(pageNumber)
			}
		} else {
			for (
				let pageNumber = currentPage - 1;
				pageNumber <= currentPage + 1;
				pageNumber += 1
			) {
				addPage(pageNumber)
			}
		}

		const sortedPages = pages.toSorted((a, b) => a - b)
		const items: PaginationItem[] = []

		for (let index = 0; index < sortedPages.length; index += 1) {
			const current = sortedPages[index]
			const next = sortedPages[index + 1]
			items.push({
				type: 'page',
				value: current,
			})

			if (next !== undefined && next - current > 1) {
				items.push({
					type: 'ellipsis',
					key: `${current}-${next}`,
				})
			}
		}

		return items
	}
	const paginationItems = $derived.by(() =>
		buildPaginationItems(page, totalPages)
	)

	const submitPageInput = (rawValue: string) => {
		const parsed = Number(rawValue)
		const safePage = Number.isFinite(parsed)
			? Math.min(totalPages, Math.max(1, Math.trunc(parsed)))
			: page

		onpagechange?.(safePage)
	}

	const onPageFormSubmit = (
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) => {
		event.preventDefault()
		const input = event.currentTarget.elements.namedItem(
			'transactions-page-input'
		)
		const rawValue =
			input instanceof HTMLInputElement ? input.value : String(page)
		submitPageInput(rawValue)
	}
</script>

<Panel class={mergeClass([], className)} {title} {question} {...rest}>
	<TransactionTable {transactions} {totalCount} {page} {pageSize} />

	{#if totalCount > 0}
		<div class="mt-4 border-t border-base-300/70 pt-4">
			<div
				class="rounded-xl border border-base-300/70 bg-base-100/65 px-3 py-3
					shadow-sm sm:px-4"
			>
				<div
					class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
				>
					<nav
						aria-label="Transactions pagination"
						class="flex max-w-full items-center gap-1 overflow-x-auto pb-1"
					>
						<button
							type="button"
							class="inline-flex h-10 min-h-10 min-w-10 items-center justify-center
								rounded-lg px-2 text-lg leading-none text-base-content/55
								transition-colors duration-150 hover:bg-base-200/70
								hover:text-base-content focus-visible:ring-2
								focus-visible:ring-primary/40 focus-visible:outline-hidden disabled:cursor-not-allowed
								disabled:text-base-content/25"
							aria-label="Previous page"
							onclick={() => onpagechange?.(page - 1)}
							disabled={!hasPreviousPage}
						>
							&#x2039;
						</button>

						{#each paginationItems as item (item.type === 'page' ? item.value : item.key)}
							{#if item.type === 'ellipsis'}
								<span
									class="inline-flex h-10 min-h-10 items-center px-1 text-base
										font-medium text-base-content/45"
									aria-hidden="true"
								>
									&hellip;
								</span>
							{:else}
								<button
									type="button"
									class={`inline-flex h-10 min-h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold tabular-nums transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-hidden ${
										item.value === page
											? 'border-primary/60 bg-primary/12 text-primary shadow-sm'
											: 'border-transparent text-base-content/80 hover:border-base-300/70 hover:bg-base-200/65 hover:text-base-content'
									}`}
									aria-label={`Go to page ${item.value}`}
									aria-current={item.value === page ? 'page' : undefined}
									onclick={() => onpagechange?.(item.value)}
								>
									{item.value}
								</button>
							{/if}
						{/each}

						<button
							type="button"
							class="inline-flex h-10 min-h-10 min-w-10 items-center justify-center
								rounded-lg px-2 text-lg leading-none text-base-content/55
								transition-colors duration-150 hover:bg-base-200/70
								hover:text-base-content focus-visible:ring-2
								focus-visible:ring-primary/40 focus-visible:outline-hidden disabled:cursor-not-allowed
								disabled:text-base-content/25"
							aria-label="Next page"
							onclick={() => onpagechange?.(page + 1)}
							disabled={!hasNextPage}
						>
							&#x203A;
						</button>
					</nav>

					<div class="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
						<label for="transactions-page-size-input" class="sr-only">
							Rows per page
						</label>
						<Select
							id="transactions-page-size-input"
							name="transactions-page-size"
							value={selectedPageSize}
							values={pageSizeValues}
							class="d-select-bordered h-11 min-h-11 w-20 rounded-lg
								bg-base-100/90 text-sm font-medium shadow-sm transition-colors
								duration-150 focus-visible:ring-2 focus-visible:ring-primary/40
								sm:w-24"
							aria-label="Page size"
							onchange={(event) =>
								onpagesizechange?.(Number(event.currentTarget.value))}
						/>

						<span class="font-medium text-base-content/70">go to</span>

						<form class="contents" onsubmit={onPageFormSubmit}>
							<label for="transactions-page-input" class="sr-only">
								Go to page
							</label>
							<input
								id="transactions-page-input"
								name="transactions-page-input"
								type="number"
								min="1"
								max={totalPages}
								step="1"
								class="d-input-bordered d-input h-11 min-h-11 w-20 rounded-lg
									bg-base-100/90 text-center font-medium tabular-nums shadow-sm
									transition-colors duration-150 focus-visible:ring-2
									focus-visible:ring-primary/40"
								autocomplete="off"
								inputmode="numeric"
								aria-label="Go to page number"
								value={String(page)}
								onchange={(event) => submitPageInput(event.currentTarget.value)}
							/>
						</form>

						<span class="font-medium text-base-content/70">page</span>
					</div>
				</div>

				<p class="mt-3 text-sm text-base-content/70 lg:text-right">
					Page
					<span class="font-semibold text-base-content tabular-nums">
						{page.toLocaleString()}
					</span>
					of
					<span class="font-semibold text-base-content tabular-nums">
						{totalPages.toLocaleString()}
					</span>
				</p>
			</div>
		</div>
	{/if}
</Panel>
