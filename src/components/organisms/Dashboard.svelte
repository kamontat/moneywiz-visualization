<script lang="ts">
	import FilterBar from '$components/organisms/FilterBar.svelte'
	import QuickSummary from './QuickSummary.svelte'
	import OverviewTab from './OverviewTab.svelte'
	import PreviewTab from './PreviewTab.svelte'
	import DateRangeDisplay from '$components/atoms/DateRangeDisplay.svelte'
	import Title from '$components/atoms/Title.svelte'
	import DashboardContainer from '$components/molecules/DashboardContainer.svelte'
	import NavigationBar from '$components/molecules/NavigationBar.svelte'
	import NavigationItem from '$components/molecules/NavigationItem.svelte'
	import type {
		CategoryBreakdown,
		IncomeExpenseTimeSeries,
		TagFilter,
		TopCategoriesData,
		Totals,
	} from '$lib/analytics'
	import type { CsvRow, ParsedCsv } from '$lib/csv'

	// Using explicit types would be better, but assuming current structure
	interface Props {
		csvFileName: string | null
		dateRange: { start: Date; end: Date } | null
		rowCount: number
		filteredCount: number
		thbCount: number
		filterStart: Date | null
		filterEnd: Date | null
		tagFilters: TagFilter[]
		thbRows: CsvRow[]
		totals: Totals
		breakdown: CategoryBreakdown
		tsData: IncomeExpenseTimeSeries
		topCategories: TopCategoriesData
		previewData: ParsedCsv | null
	}

	let {
		csvFileName,
		dateRange,
		rowCount,
		filteredCount,
		thbCount,
		filterStart = $bindable(),
		filterEnd = $bindable(),
		tagFilters = $bindable(),
		thbRows,
		totals,
		breakdown,
		tsData,
		topCategories,
		previewData,
	}: Props = $props()

	let activeTab = $state('overview')
</script>

<DashboardContainer aria-labelledby="dash-title">
	<header class="flex flex-col gap-1 py-1">
		<Title level={1} id="dash-title">{csvFileName || 'Dashboard'}</Title>

		<!-- Meta Info -->
		<div
			class="animate-in fade-in mt-1 flex flex-wrap items-center gap-2 text-xs text-mw-text-muted duration-300 sm:text-sm"
		>
			{#if dateRange}
				<DateRangeDisplay start={dateRange.start} end={dateRange.end} class="" />
				<span class="opacity-40">|</span>
			{/if}

			<span>{rowCount} rows total</span>

			{#if filteredCount !== thbCount}
				<span class="opacity-40">|</span>
				<span class="font-medium text-mw-primary">{filteredCount} shown</span>
			{/if}
		</div>
	</header>

	<!-- Filter Panel -->
	<section aria-label="Filters" class="z-20">
		<FilterBar bind:start={filterStart} bind:end={filterEnd} bind:tagFilters rows={thbRows} />
	</section>

	<!-- Quick Summary Section -->
	<section aria-label="Quick Summary" class="flex flex-col gap-2">
		<QuickSummary {totals} />
	</section>

	<!-- Tabs -->
	<NavigationBar label="Dashboard views">
		<NavigationItem
			label="Overview"
			active={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		/>
		<NavigationItem
			label="Preview"
			active={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
		/>
	</NavigationBar>

	<!-- Tab Content -->
	{#if activeTab === 'overview'}
		<OverviewTab {breakdown} {totals} {tsData} {topCategories} />
	{:else if activeTab === 'preview'}
		<PreviewTab data={previewData} />
	{/if}
</DashboardContainer>
