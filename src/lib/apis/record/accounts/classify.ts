import type { RawAccount } from './querier/types'
import type { AccountType, DataAccount, DataAccounts } from './types'

const ACCOUNT_TYPE_MAP: ReadonlyMap<number, AccountType> = new Map([
	[12, 'wallet'],
	[10, 'checking'],
	[11, 'checking'],
	[13, 'creditcard'],
	[14, 'loan'],
	[15, 'investment'],
	[16, 'unknown'],
])

export function classifyAccounts(rawAccounts: RawAccount[]): DataAccounts {
	const accounts: DataAccount[] = rawAccounts.map((raw) => ({
		id: raw.id,
		name: raw.name,
		currency: raw.currency ?? 'THB',
		type: ACCOUNT_TYPE_MAP.get(raw.entityType) ?? 'unknown',
	}))

	return {
		name: 'accounts',
		type: 'record',
		accounts,
	}
}
