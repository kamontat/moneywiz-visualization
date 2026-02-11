<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements'
	import type {
		SQLiteParseProgress,
		SQLiteSection,
		SQLiteSectionPage,
		SQLiteSession,
	} from '$lib/sqlite/models'
	import { onDestroy } from 'svelte'

	import Button from '$components/atoms/Button.svelte'
	import Input from '$components/atoms/Input.svelte'
	import AppBody from '$components/organisms/AppBody.svelte'
	import { createSQLiteSession } from '$lib/sqlite'

	const DEFAULT_PAGE_SIZE = 200
	const SECTION_OPTIONS: { value: SQLiteSection; label: string }[] = [
		{ value: 'transactions', label: 'Transactions' },
		{ value: 'accounts', label: 'Accounts' },
		{ value: 'payees', label: 'Payees' },
		{ value: 'categories', label: 'Categories' },
		{ value: 'tags', label: 'Tags' },
	]

	let fileInput = $state<Input | null>(null)
	let loadingFile = $state(false)
	let loadingPage = $state(false)
	let error = $state<string | undefined>(undefined)
	let progress = $state<SQLiteParseProgress | undefined>(undefined)
	let session = $state<SQLiteSession | undefined>(undefined)
	let overview = $state<SQLiteSession['overview'] | undefined>(undefined)
	let pageData = $state<SQLiteSectionPage | undefined>(undefined)
	let section = $state<SQLiteSection>('transactions')
	let pageSize = $state(DEFAULT_PAGE_SIZE)
	let currentPage = $state(1)
	let pageRequestToken = 0

	const normalizedPageSize = $derived(
		Math.min(1000, Math.max(1, Math.trunc(pageSize)))
	)

	const totalPages = $derived.by(() => {
		const total = pageData?.total ?? 0
		return Math.max(1, Math.ceil(total / normalizedPageSize))
	})

	const hasPreviousPage = $derived(currentPage > 1)
	const hasNextPage = $derived(currentPage < totalPages)

	const jsonPreview = $derived.by(() => {
		if (!overview) return ''
		const payload = {
			meta: overview.meta,
			counts: overview.counts,
			entities: overview.entities,
			page: pageData
				? {
						section: pageData.section,
						page: currentPage,
						pageSize: pageData.limit,
						offset: pageData.offset,
						totalRows: pageData.total,
						totalPages,
					}
				: undefined,
			items: pageData?.items ?? [],
		}
		return JSON.stringify(payload, null, 2)
	})

	const closeSession = async () => {
		const active = session
		pageRequestToken += 1
		session = undefined
		overview = undefined
		pageData = undefined
		progress = undefined
		loadingPage = false

		if (!active) return
		try {
			await active.close()
		} catch {
			// Ignore close errors from terminated workers.
		}
	}

	const loadPage = async () => {
		const active = session
		if (!active) return

		const token = ++pageRequestToken
		const safePage = Math.max(1, Math.trunc(currentPage))
		const offset = (safePage - 1) * normalizedPageSize

		loadingPage = true
		try {
			const next = await active.getPage({
				section,
				offset,
				limit: normalizedPageSize,
			})
			if (token !== pageRequestToken) return

			pageData = next
			currentPage = Math.floor(next.offset / next.limit) + 1
		} catch (thrown) {
			if (token !== pageRequestToken) return
			error = thrown instanceof Error ? thrown.message : String(thrown)
		} finally {
			if (token === pageRequestToken) {
				loadingPage = false
			}
		}
	}

	const onUpload: ChangeEventHandler<HTMLInputElement> = async (event) => {
		error = undefined
		progress = undefined
		const file = event.currentTarget.files?.[0]
		if (!file) return

		loadingFile = true
		await closeSession()

		try {
			const nextSession = await createSQLiteSession(file, {
				onProgress: (nextProgress) => {
					progress = nextProgress
				},
			})
			session = nextSession
			overview = nextSession.overview
			section = 'transactions'
			currentPage = 1
			await loadPage()
		} catch (thrown) {
			error = thrown instanceof Error ? thrown.message : String(thrown)
		} finally {
			loadingFile = false
		}
	}

	const onSectionChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
		section = event.currentTarget.value as SQLiteSection
		currentPage = 1
		void loadPage()
	}

	const onPageSizeChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		pageSize = Number(event.currentTarget.value || DEFAULT_PAGE_SIZE)
		currentPage = 1
		void loadPage()
	}

	const gotoPreviousPage = () => {
		if (!hasPreviousPage) return
		currentPage -= 1
		void loadPage()
	}

	const gotoNextPage = () => {
		if (!hasNextPage) return
		currentPage += 1
		void loadPage()
	}

	onDestroy(() => {
		void closeSession()
	})
</script>

<AppBody class="mb-8">
	<div class="d-card bg-base-200">
		<div class="d-card-body gap-4">
			<h1 class="d-card-title">SQLite Experiment (Paged Worker)</h1>
			<p class="text-sm text-base-content/70">
				Loads SQLite in a Web Worker, keeps summary metadata in memory, then
				queries each section page on demand.
			</p>

			<div class="flex flex-wrap items-end gap-2">
				<div class="min-w-40">
					<label
						for="sqlite-section"
						class="mb-1 block text-xs text-base-content/60 uppercase"
					>
						Section
					</label>
					<select
						id="sqlite-section"
						class="d-select-bordered d-select w-full"
						bind:value={section}
						onchange={onSectionChange}
						disabled={!session || loadingPage}
					>
						{#each SECTION_OPTIONS as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="min-w-40">
					<label
						for="sqlite-page-size"
						class="mb-1 block text-xs text-base-content/60 uppercase"
					>
						Page Size (max 1000)
					</label>
					<input
						id="sqlite-page-size"
						type="number"
						min="1"
						max="1000"
						step="50"
						class="d-input-bordered d-input w-full"
						bind:value={pageSize}
						onchange={onPageSizeChange}
						disabled={!session || loadingPage}
					/>
				</div>

				<Input
					type="file"
					class="sr-only"
					accept=".sqlite,.db,application/vnd.sqlite3,application/x-sqlite3"
					onchange={onUpload}
					onclick={(event) => {
						event.currentTarget.value = ''
					}}
					bind:this={fileInput}
					disabled={loadingFile}
				/>
				<Button onclick={() => fileInput?.click()} disabled={loadingFile}>
					{#if loadingFile}
						<span class="tabular-nums">
							Opening {progress?.phase ?? 'loading'}...
						</span>
					{:else}
						Load SQLite
					{/if}
				</Button>
			</div>

			{#if loadingFile && progress}
				<p class="text-sm text-base-content/70">
					Open phase: {progress.phase} ({progress.processed.toLocaleString()}
					{#if progress.total}
						/{progress.total.toLocaleString()}
					{/if})
				</p>
			{/if}

			{#if error}
				<div class="d-alert text-sm d-alert-error">
					<span>{error}</span>
				</div>
			{/if}

			{#if overview}
				<div class="d-stats-sm d-stats d-stats-vertical md:d-stats-horizontal">
					<div class="d-stat">
						<div class="d-stat-title">Sync Rows</div>
						<div class="d-stat-value text-lg">
							{overview.counts.syncObjectRows.toLocaleString()}
						</div>
					</div>
					<div class="d-stat">
						<div class="d-stat-title">Transactions</div>
						<div class="d-stat-value text-lg">
							{overview.counts.transactions.toLocaleString()}
						</div>
					</div>
					<div class="d-stat">
						<div class="d-stat-title">Open Time</div>
						<div class="d-stat-value text-lg">
							{overview.meta.parseDurationMs.toLocaleString()} ms
						</div>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<Button
						variant="secondary"
						onclick={gotoPreviousPage}
						disabled={!hasPreviousPage || loadingPage}
					>
						Previous
					</Button>
					<Button
						variant="secondary"
						onclick={gotoNextPage}
						disabled={!hasNextPage || loadingPage}
					>
						Next
					</Button>
					<span class="text-sm text-base-content/70">
						Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
						{#if pageData}
							({pageData.total.toLocaleString()} rows)
						{/if}
					</span>
					{#if loadingPage}
						<span class="text-sm text-base-content/70">Loading page...</span>
					{/if}
				</div>

				<pre
					class="max-h-[70vh] overflow-auto rounded-lg bg-neutral p-4 text-xs text-neutral-content">{jsonPreview}</pre>
			{/if}
		</div>
	</div>
</AppBody>
