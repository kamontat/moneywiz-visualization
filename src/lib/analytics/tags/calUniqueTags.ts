import type { AnalyticFunc } from '../models'

export type UniqueTags = Record<string, string[]>

export const calUniqueTags: AnalyticFunc<UniqueTags> = () => {
	// TODO: implement unique tags calculation
	return {} as UniqueTags
}
