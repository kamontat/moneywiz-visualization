import type {
	STORE_DB_V1,
	STORE_STATE_CSV_KEY_V1,
	STORE_STATE_THM_KEY_V1,
	STORE_STATE_TRX_KEY_V1,
} from '../constants'
import type { ParsedCsv } from '$lib/csv'
import type { ParsedTheme } from '$lib/themes'
import type { ParsedTransactions } from '$lib/transactions'
import type { ISchemaDB, ISchemaState, ISchemaTable } from '$utils/db/models'

export type ThemeTableSchemaV1 = ISchemaTable<
	typeof STORE_STATE_THM_KEY_V1,
	[ISchemaState<'default', ParsedTheme>]
>

export type CsvTableSchemaV1 = ISchemaTable<
	typeof STORE_STATE_CSV_KEY_V1,
	[ISchemaState<'default', ParsedCsv>]
>

export type TransactionTableSchemaV1 = ISchemaTable<
	typeof STORE_STATE_TRX_KEY_V1,
	[
		ISchemaState<'fileName', string | null>,
		ISchemaState<
			`transaction/${number}`,
			ParsedTransactions,
			{ date: Date; type: string }
		>,
	]
>

export type StoreSchema = ISchemaDB<{
	[STORE_DB_V1]: [
		CsvTableSchemaV1,
		ThemeTableSchemaV1,
		TransactionTableSchemaV1,
	]
	// 'v2:app-db': [CsvTableSchemaV1, ThemeTableSchemaV1, TransactionTableSchemaV1]
}>
