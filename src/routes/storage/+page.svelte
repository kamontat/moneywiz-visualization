<script lang="ts">
	import { onMount } from 'svelte'

	import Button from '$components/atoms/Button.svelte'
	import Panel from '$components/atoms/Panel.svelte'
	import StatCard from '$components/atoms/StatCard.svelte'
	import AppBody from '$components/organisms/AppBody.svelte'

	const REFRESH_INTERVAL = 30000
	const DETAIL_LABELS: Record<string, string> = {
		caches: 'Cache Storage',
		fileSystem: 'File System',
		indexedDB: 'IndexedDB',
		localStorage: 'Local Storage',
		serviceWorkerRegistrations: 'Service Worker Registrations',
	}

	let supported = $state(true)
	let loading = $state(false)
	let error = $state<string | undefined>(undefined)
	let usage = $state(0)
	let quota = $state(0)
	let details = $state<Record<string, number>>({})
	let lastUpdated = $state<Date | undefined>(undefined)

	const usedPercent = $derived.by(() => {
		if (quota <= 0) return 0
		return Math.min(100, Math.max(0, (usage / quota) * 100))
	})

	const freeBytes = $derived(Math.max(0, quota - usage))

	const detailRows = $derived.by(() => {
		const rows = Object.entries(details)
			.filter(
				([, value]) => typeof value === 'number' && Number.isFinite(value)
			)
			.sort((a, b) => b[1] - a[1])
		const accounted = rows.reduce((total, [, value]) => total + value, 0)
		const unknown = Math.max(0, usage - accounted)
		if (unknown > 0) rows.push(['other', unknown])

		return rows.map(([key, value]) => ({
			key,
			value,
			label: getDetailLabel(key),
			percentOfUsage: usage > 0 ? (value / usage) * 100 : 0,
		}))
	})

	const getDetailLabel = (key: string): string => {
		if (DETAIL_LABELS[key]) return DETAIL_LABELS[key]
		return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
	}

	const formatBytes = (bytes: number): string => {
		if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
		const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
		const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 5)
		const value = bytes / Math.pow(1024, unit)
		const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2
		return `${value.toLocaleString('en-US', { maximumFractionDigits: digits })} ${units[unit]}`
	}

	const formatPercent = (value: number): string => `${value.toFixed(1)}%`

	let resetting = $state(false)
	let resetError = $state<string | undefined>(undefined)
	let resetSuccess = $state(false)
	let showConfirm = $state(false)

	const resetAllData = async () => {
		resetting = true
		resetError = undefined
		resetSuccess = false
		try {
			localStorage.clear()

			const idbDatabases = await indexedDB.databases()
			await Promise.all(
				idbDatabases.map(
					({ name }) =>
						new Promise<void>((resolve, reject) => {
							if (!name) return resolve()
							const req = indexedDB.deleteDatabase(name)
							req.onsuccess = () => resolve()
							req.onerror = () => reject(req.error)
							req.onblocked = () => resolve()
						})
				)
			)

			if (typeof caches !== 'undefined') {
				const keys = await caches.keys()
				await Promise.all(keys.map((k) => caches.delete(k)))
			}

			if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
				const registrations = await navigator.serviceWorker.getRegistrations()
				await Promise.all(registrations.map((r) => r.unregister()))
			}

			resetSuccess = true
			showConfirm = false
			await refreshUsage()
		} catch (thrown) {
			resetError = thrown instanceof Error ? thrown.message : String(thrown)
		} finally {
			resetting = false
		}
	}

	const refreshUsage = async () => {
		if (
			typeof navigator === 'undefined' ||
			typeof navigator.storage?.estimate !== 'function'
		) {
			supported = false
			error = undefined
			return
		}

		loading = true
		error = undefined
		try {
			const estimate = await navigator.storage.estimate()
			usage = typeof estimate.usage === 'number' ? estimate.usage : 0
			quota = typeof estimate.quota === 'number' ? estimate.quota : 0

			const usageDetails =
				(
					estimate as StorageEstimate & {
						usageDetails?: Record<string, unknown>
					}
				).usageDetails ?? {}
			const nextDetails: Record<string, number> = {}
			for (const [key, value] of Object.entries(usageDetails)) {
				if (typeof value === 'number' && Number.isFinite(value)) {
					nextDetails[key] = value
				}
			}
			details = nextDetails
			lastUpdated = new Date()
			supported = true
		} catch (thrown) {
			error = thrown instanceof Error ? thrown.message : String(thrown)
		} finally {
			loading = false
		}
	}

	onMount(() => {
		void refreshUsage()
		const onFocus = () => {
			void refreshUsage()
		}
		window.addEventListener('focus', onFocus)
		const interval = window.setInterval(() => {
			void refreshUsage()
		}, REFRESH_INTERVAL)

		return () => {
			window.removeEventListener('focus', onFocus)
			window.clearInterval(interval)
		}
	})
</script>

<AppBody class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
	<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="text-2xl font-semibold text-base-content">
				Browser Storage Usage
			</h1>
			<p class="text-sm text-base-content/70">
				Tracks estimated quota usage from your current browser profile.
			</p>
			{#if lastUpdated}
				<p class="mt-1 text-xs text-base-content/60 tabular-nums">
					Last updated:
					{lastUpdated.toLocaleDateString('en-US')}
					{lastUpdated.toLocaleTimeString('en-US')}
				</p>
			{/if}
		</div>

		<div class="flex gap-2">
			<Button
				variant="secondary"
				onclick={() => void refreshUsage()}
				disabled={loading || !supported}
			>
				{#if loading}
					<span class="d-loading d-loading-sm d-loading-spinner"></span>
				{/if}
				Refresh
			</Button>
			<Button
				variant="danger"
				onclick={() => (showConfirm = true)}
				disabled={resetting}
			>
				Reset All Data
			</Button>
		</div>
	</div>

	{#if !supported}
		<div class="mb-4 d-alert text-sm d-alert-warning">
			<span>
				`navigator.storage.estimate()` is not supported in this browser.
			</span>
		</div>
	{/if}

	{#if error}
		<div class="mb-4 d-alert text-sm d-alert-error">
			<span>Failed to read storage usage: {error}</span>
		</div>
	{/if}

	{#if resetSuccess}
		<div class="mb-4 d-alert text-sm d-alert-success">
			<span>All browser storage data has been cleared successfully.</span>
		</div>
	{/if}

	{#if resetError}
		<div class="mb-4 d-alert text-sm d-alert-error">
			<span>Failed to reset storage: {resetError}</span>
		</div>
	{/if}

	{#if showConfirm}
		<div class="d-modal-open d-modal">
			<div class="d-modal-box">
				<h3 class="text-lg font-bold">Reset All Data</h3>
				<p class="py-4 text-sm text-base-content/80">
					This will permanently delete all browser storage for this app,
					including localStorage, IndexedDB, caches, and service worker
					registrations. This action cannot be undone.
				</p>
				<div class="d-modal-action">
					<Button
						variant="secondary"
						onclick={() => (showConfirm = false)}
						disabled={resetting}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onclick={() => void resetAllData()}
						disabled={resetting}
					>
						{#if resetting}
							<span class="d-loading d-loading-sm d-loading-spinner"></span>
						{/if}
						Yes, Reset Everything
					</Button>
				</div>
			</div>
			<div
				class="d-modal-backdrop"
				role="button"
				tabindex="0"
				aria-label="Close dialog"
				onclick={() => (showConfirm = false)}
				onkeydown={(e) => e.key === 'Escape' && (showConfirm = false)}
			></div>
		</div>
	{/if}

	{#if supported}
		<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
			<StatCard
				title="Used"
				value={formatBytes(usage)}
				description={`${formatPercent(usedPercent)} of available quota`}
				variant={usedPercent >= 90
					? 'expense'
					: usedPercent >= 75
						? 'neutral'
						: 'highlight'}
			/>
			<StatCard
				title="Available"
				value={quota > 0 ? formatBytes(freeBytes) : 'Unknown'}
				description={quota > 0
					? `${formatPercent(100 - usedPercent)} free`
					: 'Browser did not report quota'}
				variant="income"
			/>
			<StatCard
				title="Quota"
				value={quota > 0 ? formatBytes(quota) : 'Unknown'}
				description="Estimated browser-managed storage limit"
				variant="plain"
			/>
		</div>

		<Panel title="Storage Fill Level" class="mb-4">
			<progress
				class="d-progress h-4 w-full d-progress-primary"
				value={usedPercent}
				max="100"
			></progress>
			<div
				class="mt-2 flex justify-between text-xs text-base-content/60 tabular-nums"
			>
				<span>{formatBytes(usage)} used</span>
				<span>{quota > 0 ? formatBytes(quota) : 'Unknown'} total</span>
			</div>
		</Panel>

		<Panel title="Usage Breakdown by Storage Type">
			{#if detailRows.length === 0}
				<p class="text-sm text-base-content/60">
					No detailed breakdown was reported by this browser.
				</p>
			{:else}
				<div class="space-y-3">
					{#each detailRows as row (row.key)}
						<div class="space-y-1">
							<div class="flex items-baseline justify-between gap-4">
								<span class="text-sm font-medium">{row.label}</span>
								<span class="text-xs text-base-content/60 tabular-nums">
									{formatBytes(row.value)} ({formatPercent(row.percentOfUsage)})
								</span>
							</div>
							<progress
								class="d-progress h-2 w-full d-progress-secondary"
								value={row.percentOfUsage}
								max="100"
							></progress>
						</div>
					{/each}
				</div>
			{/if}
		</Panel>
	{/if}
</AppBody>
