<script lang="ts">
    import IncomeByCategory from './IncomeByCategory.svelte';
    import ExpenseByCategory from './ExpenseByCategory.svelte';
    import IncomeExpenseRatioChart from './IncomeExpenseRatioChart.svelte';
    import IncomeExpenseBarChart from './IncomeExpenseBarChart.svelte';
    import TopCategoriesChart from './TopCategoriesChart.svelte';
    import DashboardPanel from '$components/molecules/DashboardPanel.svelte';
    import Title from '$components/atoms/Title.svelte';

    interface Props {
        breakdown: any;
        totals: any;
        tsData: any;
        topCategories: any;
    }
    let { breakdown, totals, tsData, topCategories }: Props = $props();
</script>

<div class="flex flex-col gap-4 animate-in fade-in duration-300 slide-in-from-bottom-2 pt-4">
    <!-- Row 1: Split Category Breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IncomeByCategory items={breakdown.income} total={totals.income} />
        <ExpenseByCategory items={breakdown.expenses} total={totals.expenses} />
    </div>

    <!-- Row 2: Pies & Bar Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardPanel class="lg:col-span-1" aria-labelledby="ratio-title">
            <Title level={2} id="ratio-title" class="mb-4">Income vs Expenses</Title>
            <IncomeExpenseRatioChart income={totals.income} expenses={totals.expenses} />
        </DashboardPanel>

        <DashboardPanel class="lg:col-span-2" aria-labelledby="trend-title">
             <Title level={2} id="trend-title" class="mb-4">Income & Expense Trend ({tsData.mode})</Title>
             <IncomeExpenseBarChart data={tsData} />
        </DashboardPanel>
    </div>

    <!-- Row 3: Top Categories -->
    <div class="grid grid-cols-1 gap-4">
        <TopCategoriesChart data={topCategories} />
    </div>
</div>
