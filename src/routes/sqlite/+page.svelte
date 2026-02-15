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
	type SectionPanelState = {
		pageSize: number
		currentPage: number
		pageData?: SQLiteSectionPage
		loading: boolean
		error?: string
		panelOpen: boolean
		jsonOpen: boolean
	}

	const SECTION_OPTIONS: { value: SQLiteSection; label: string }[] = [
		{ value: 'transactions', label: 'Transactions' },
		{ value: 'accounts', label: 'Accounts' },
		{ value: 'payees', label: 'Payees' },
		{ value: 'categories', label: 'Categories' },
		{ value: 'tags', label: 'Tags' },
		{ value: 'users', label: 'Users' },
	]

	let fileInput = $state<Input | null>(null)
	let loadingFile = $state(false)
	let error = $state<string | undefined>(undefined)
	let progress = $state<SQLiteParseProgress | undefined>(undefined)
	let session = $state<SQLiteSession | undefined>(undefined)
	let overview = $state<SQLiteSession['overview'] | undefined>(undefined)
	let panelStates =
		$state<Record<SQLiteSection, SectionPanelState>>(createPanelStates())
	let pageRequestTokens = createSectionRecord(0)

	const toJson = (value: unknown) => JSON.stringify(value, null, 2)

	const formatFileSize = (bytes: number) => {
		if (!Number.isFinite(bytes) || bytes < 0) return '0 B'

		const units = ['B', 'KB', 'MB', 'GB', 'TB']
		let value = bytes
		let unitIndex = 0

		while (value >= 1024 && unitIndex < units.length - 1) {
			value /= 1024
			unitIndex += 1
		}

		const formatted =
			unitIndex === 0 ? Math.round(value).toString() : value.toFixed(1)

		return `${formatted} ${units[unitIndex]}`
	}

	const overviewJsonViewers = $derived.by(() => {
		if (!overview) return []

		return [
			{ key: 'meta', label: 'Meta', json: toJson(overview.meta) },
			{ key: 'counts', label: 'Counts', json: toJson(overview.counts) },
			{ key: 'entities', label: 'Entities', json: toJson(overview.entities) },
			{
				key: 'active-user',
				label: 'Active User',
				json: toJson(overview.activeUser ?? null),
			},
		]
	})

	function createSectionRecord<T>(value: T): Record<SQLiteSection, T> {
		return {
			transactions: value,
			accounts: value,
			payees: value,
			categories: value,
			tags: value,
			users: value,
		}
	}

	function createPanelStates(): Record<SQLiteSection, SectionPanelState> {
		return {
			transactions: createPanelState(true),
			accounts: createPanelState(),
			payees: createPanelState(),
			categories: createPanelState(),
			tags: createPanelState(),
			users: createPanelState(),
		}
	}

	function createPanelState(isOpen = false): SectionPanelState {
		return {
			pageSize: DEFAULT_PAGE_SIZE,
			currentPage: 1,
			loading: false,
			panelOpen: isOpen,
			jsonOpen: true,
		}
	}

	const getPageSize = (panel: SectionPanelState) => {
		return Math.min(1000, Math.max(1, Math.trunc(panel.pageSize)))
	}

	const getTotalPages = (panel: SectionPanelState) => {
		const totalRows = panel.pageData?.total ?? 0
		return Math.max(1, Math.ceil(totalRows / getPageSize(panel)))
	}

	const getSectionJsonPreview = (targetSection: SQLiteSection) => {
		const panel = panelStates[targetSection]
		const totalPages = getTotalPages(panel)

		return toJson({
			section: targetSection,
			page: panel.currentPage,
			pageSize: getPageSize(panel),
			offset: panel.pageData?.offset ?? 0,
			totalRows: panel.pageData?.total ?? 0,
			totalPages,
			items: panel.pageData?.items ?? [],
		})
	}

	const closeSession = async () => {
		const active = session
		pageRequestTokens = createSectionRecord(0)
		session = undefined
		overview = undefined
		panelStates = createPanelStates()
		progress = undefined

		if (!active) return
		try {
			await active.close()
		} catch {
			// Ignore close errors from terminated workers.
		}
	}

	const loadPage = async (targetSection: SQLiteSection) => {
		const active = session
		if (!active) return
		const panel = panelStates[targetSection]

		const token = ++pageRequestTokens[targetSection]
		const safePage = Math.max(1, Math.trunc(panel.currentPage))
		const pageSize = getPageSize(panel)
		const offset = (safePage - 1) * pageSize

		panel.loading = true
		panel.error = undefined
		try {
			const next = await active.getPage({
				section: targetSection,
				offset,
				limit: pageSize,
			})
			if (token !== pageRequestTokens[targetSection]) return

			panel.pageData = next
			panel.currentPage = Math.floor(next.offset / next.limit) + 1
		} catch (thrown) {
			if (token !== pageRequestTokens[targetSection]) return
			panel.error = thrown instanceof Error ? thrown.message : String(thrown)
		} finally {
			if (token === pageRequestTokens[targetSection]) {
				panel.loading = false
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
			await Promise.all(
				SECTION_OPTIONS.map(async (option) => {
					await loadPage(option.value)
				})
			)
		} catch (thrown) {
			error = thrown instanceof Error ? thrown.message : String(thrown)
		} finally {
			loadingFile = false
		}
	}

	const onPageSizeChange = (
		targetSection: SQLiteSection,
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const panel = panelStates[targetSection]
		panel.pageSize = Number(event.currentTarget.value || DEFAULT_PAGE_SIZE)
		panel.currentPage = 1
		void loadPage(targetSection)
	}

	const gotoPreviousPage = (targetSection: SQLiteSection) => {
		const panel = panelStates[targetSection]
		if (panel.currentPage <= 1) return

		panel.currentPage -= 1
		void loadPage(targetSection)
	}

	const gotoNextPage = (targetSection: SQLiteSection) => {
		const panel = panelStates[targetSection]
		const totalPages = getTotalPages(panel)
		if (panel.currentPage >= totalPages) return

		panel.currentPage += 1
		void loadPage(targetSection)
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
						<div class="d-stat-title">File Name</div>
						<div class="d-stat-value text-lg">
							{overview.meta.fileName}
						</div>
					</div>
					<div class="d-stat">
						<div class="d-stat-title">File Size</div>
						<div class="d-stat-value text-lg">
							{formatFileSize(overview.meta.fileSizeBytes)}
						</div>
					</div>
					<div class="d-stat">
						<div class="d-stat-title">Parsed Time</div>
						<div class="d-stat-value text-lg">
							{new Date(overview.meta.parsedAt).toLocaleString()}
						</div>
					</div>
				</div>

				<div class="grid gap-3 md:grid-cols-2">
					{#each overviewJsonViewers as viewer (viewer.key)}
						<details class="rounded-lg border border-base-300 bg-base-100" open>
							<summary class="cursor-pointer px-4 py-3 text-sm font-semibold">
								{viewer.label}
							</summary>
							<div class="border-t border-base-300 p-3">
								<pre
									class="max-h-[40vh] overflow-auto rounded-lg bg-neutral p-4 text-xs text-neutral-content">{viewer.json}</pre>
							</div>
						</details>
					{/each}
				</div>

				<div class="space-y-3">
					{#each SECTION_OPTIONS as option (option.value)}
						{@const panel = panelStates[option.value]}
						{@const totalPages = getTotalPages(panel)}
						{@const hasPreviousPage = panel.currentPage > 1}
						{@const hasNextPage = panel.currentPage < totalPages}

						<details
							class="rounded-lg border border-base-300 bg-base-100"
							bind:open={panel.panelOpen}
						>
							<summary class="cursor-pointer px-4 py-3 text-sm font-semibold">
								{option.label}
							</summary>
							<div class="space-y-3 border-t border-base-300 p-4">
								<div class="flex flex-wrap items-end gap-2">
									<div class="min-w-40">
										<label
											for={`sqlite-page-size-${option.value}`}
											class="mb-1 block text-xs text-base-content/60 uppercase"
										>
											Page Size (max 1000)
										</label>
										<input
											id={`sqlite-page-size-${option.value}`}
											type="number"
											min="1"
											max="1000"
											step="50"
											class="d-input-bordered d-input w-full"
											bind:value={panel.pageSize}
											onchange={(event) =>
												onPageSizeChange(option.value, event)}
											disabled={!session || panel.loading}
										/>
									</div>

									<Button
										variant="secondary"
										onclick={() => gotoPreviousPage(option.value)}
										disabled={!hasPreviousPage || panel.loading}
									>
										Previous
									</Button>
									<Button
										variant="secondary"
										onclick={() => gotoNextPage(option.value)}
										disabled={!hasNextPage || panel.loading}
									>
										Next
									</Button>

									<span class="text-sm text-base-content/70">
										Page {panel.currentPage.toLocaleString()} of
										{totalPages.toLocaleString()}
										{#if panel.pageData}
											({panel.pageData.total.toLocaleString()} rows)
										{/if}
									</span>
									{#if panel.loading}
										<span class="text-sm text-base-content/70">
											Loading page...
										</span>
									{/if}
								</div>

								{#if panel.error}
									<div class="d-alert text-sm d-alert-error">
										<span>{panel.error}</span>
									</div>
								{/if}

								<details
									class="rounded-lg border border-base-300 bg-base-200"
									bind:open={panel.jsonOpen}
								>
									<summary
										class="cursor-pointer px-4 py-3 text-sm font-semibold"
									>
										JSON Data
									</summary>
									<div class="border-t border-base-300 p-3">
										<pre
											class="max-h-[60vh] overflow-auto rounded-lg bg-neutral p-4 text-xs text-neutral-content">{getSectionJsonPreview(
												option.value
											)}</pre>
									</div>
								</details>
							</div>
						</details>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</AppBody>
