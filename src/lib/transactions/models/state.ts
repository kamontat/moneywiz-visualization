import type {
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
	| ParsedUnknownTransaction

export type ParsedTransactionType = ParsedTransaction['type']
