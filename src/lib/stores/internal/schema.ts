import type {
	STORE_DB_V1,
	STORE_STATE_CSV_KEY_V1,
	STORE_STATE_THM_KEY_V1,
	STORE_STATE_TRX_KEY_V1,
} from './constants'
import type { IStoreSchema, IStoreTableSchema, IStoreValue } from './models'
import type { ParsedCsv } from '$lib/csv'
import type { ParsedTheme } from '$lib/themes'
import type { ParsedTransaction } from '$lib/transactions'
import type { ToKey, ToObj } from '$lib/types'

export type CsvTableSchemaV1 = IStoreTableSchema<
	typeof STORE_STATE_CSV_KEY_V1,
	[IStoreValue<'default', ParsedCsv>]
>

export type ThemeTableSchemaV1 = IStoreTableSchema<
	typeof STORE_STATE_THM_KEY_V1,
	[IStoreValue<'default', ParsedTheme>]
>

export type TransactionTableSchemaV1 = IStoreTableSchema<
	typeof STORE_STATE_TRX_KEY_V1,
	[
		IStoreValue<'fileName', string | null>,
		IStoreValue<
			`transaction/${number}`,
			ParsedTransaction,
			{ date: Date; type: string }
		>,
	]
>

export type StoreSchema = ToObj<
	IStoreSchema<
		typeof STORE_DB_V1,
		[CsvTableSchemaV1, ThemeTableSchemaV1, TransactionTableSchemaV1]
	>
>

export type StoreSchemaVersion = ToKey<StoreSchema>
