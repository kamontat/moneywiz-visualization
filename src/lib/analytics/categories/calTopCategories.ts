import type { ParsedCategory } from '$lib/transactions'
import type { AnalyticFunc } from '../models'

export interface TopCategories {
	max: number
	categories: ParsedCategory
}

export const calTopCategories: AnalyticFunc<TopCategories> = () => {
	// TODO: implement calculation logic
	return {} as TopCategories
}
