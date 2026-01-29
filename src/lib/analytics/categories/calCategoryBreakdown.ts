import type { ParsedCategory } from '$lib/transactions'
import type { AnalyticFunc } from '../models'

export interface CategoryBreakdown {
	incomes: ParsedCategory[]
	expenses: ParsedCategory[]
}

export const calCategoryBreakdown: AnalyticFunc<CategoryBreakdown> = () => {
	// TODO: implement calculation logic
	return {
		incomes: [],
		expenses: [],
	}
}
