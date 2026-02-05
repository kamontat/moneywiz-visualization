import type {
	STORE_DB_V1,
	STATE_CSV_V1,
	STATE_THEME_V1,
	STATE_CSV_RAW_ROWS_V1,
	STATE_CSV_RAW_HEAD_V1,
	STATE_TRX_V1,
} from '../constants'
import type { CsvState, ParsedCsv } from '$lib/csv/models'
import type { ParsedTheme } from '$lib/themes/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import type { ISchemaDB, ISchemaState, ISchemaTable } from '$utils/db/models'

type ThemeTableSchemaV1 = ISchemaTable<
	typeof STATE_THEME_V1,
	[ISchemaState<'default', ParsedTheme>]
>

type CsvTableSchemaV1 = ISchemaTable<
	typeof STATE_CSV_V1,
	[ISchemaState<'default', CsvState | undefined>]
>

type CsvRawHeadTableSchemaV1 = ISchemaTable<
	typeof STATE_CSV_RAW_HEAD_V1,
	[ISchemaState<number, ParsedCsv['headers'][number]>]
>
type CsvRawRowTableSchemaV1 = ISchemaTable<
	typeof STATE_CSV_RAW_ROWS_V1,
	[ISchemaState<number, ParsedCsv['rows'][number]>]
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
		CsvTableSchemaV1,
		CsvRawHeadTableSchemaV1,
		CsvRawRowTableSchemaV1,
		TransactionTableSchemaV1,
	]
	// 'v2:app-db': [CsvTableSchemaV1, ThemeTableSchemaV1, TransactionTableSchemaV1]
}>
