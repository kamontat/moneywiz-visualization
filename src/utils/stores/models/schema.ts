import type {
	STORE_DB_V1,
	STATE_DB_V1,
	STATE_THEME_V1,
	STATE_TRX_V1,
	STATE_FILTER_OPTIONS_V1,
	STATE_FX_RATE_CACHE_V1,
} from '../constants'
import type { FilterOptions } from '$lib/analytics/filters/models'
import type { FxRateCacheState } from '$lib/currency/models'
import type { SourceManifest } from '$lib/session/models'
import type { ParsedTheme } from '$lib/themes/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import type { ISchemaDB, ISchemaState, ISchemaTable } from '$utils/db/models'

type DatabaseState = Pick<SourceManifest, 'fileName' | 'size' | 'modifiedAt'>

type ThemeTableSchemaV1 = ISchemaTable<
	typeof STATE_THEME_V1,
	[ISchemaState<'default', ParsedTheme>]
>

type DatabaseTableSchemaV1 = ISchemaTable<
	typeof STATE_DB_V1,
	[ISchemaState<'default', DatabaseState | undefined>]
>

type FilterOptionsTableSchemaV1 = ISchemaTable<
	typeof STATE_FILTER_OPTIONS_V1,
	[ISchemaState<'default', FilterOptions | undefined>]
>

type FxRateCacheTableSchemaV1 = ISchemaTable<
	typeof STATE_FX_RATE_CACHE_V1,
	[ISchemaState<'default', FxRateCacheState>]
>

export type TransactionTableSchemaV1 = ISchemaTable<
	typeof STATE_TRX_V1,
	[
		ISchemaState<
			number,
			ParsedTransaction,
			{ date: Date; account: string; type: string }
		>,
	]
>

export type StoreSchema = ISchemaDB<{
	[STORE_DB_V1]: [
		ThemeTableSchemaV1,
		DatabaseTableSchemaV1,
		FilterOptionsTableSchemaV1,
		FxRateCacheTableSchemaV1,
		TransactionTableSchemaV1,
	]
}>
