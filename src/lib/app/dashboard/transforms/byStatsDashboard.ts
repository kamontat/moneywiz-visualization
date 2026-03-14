import type {
	StatsDashboard,
	StatsDashboardOptions,
	TransformBy,
	TransformByFunc,
} from '../models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { buildStatsDashboard } from './byStatsDashboard/build-dashboard'

export const byStatsDashboard: TransformByFunc<
	[ParsedTransaction[], StatsDashboardOptions?],
	StatsDashboard
> = (baselineTransactions, options = {}) => {
	const by: TransformBy<StatsDashboard> = (transactions) => {
		return buildStatsDashboard(transactions, baselineTransactions, options)
	}

	by.type = 'byStatsDashboard'
	return by
}
