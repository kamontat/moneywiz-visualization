import type {
	ParsedCategorizedTransferTransaction,
	ParsedExpenseTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
} from './transaction'

export type ParsedTransaction =
	| ParsedExpenseTransaction
	| ParsedRefundTransaction
	| ParsedIncomeTransaction
	| ParsedTransferTransaction
	| ParsedCategorizedTransferTransaction
	| ParsedUnknownTransaction

export type ParsedTransactionType = ParsedTransaction['type']
