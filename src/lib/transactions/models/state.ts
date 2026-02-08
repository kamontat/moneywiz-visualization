import type {
	ParsedDebtRepaymentTransaction,
	ParsedDebtTransaction,
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedRefundTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
	ParsedWindfallTransaction,
} from './transaction'

export type ParsedTransaction =
	| ParsedExpenseTransaction
	| ParsedRefundTransaction
	| ParsedIncomeTransaction
	| ParsedTransferTransaction
	| ParsedDebtTransaction
	| ParsedDebtRepaymentTransaction
	| ParsedWindfallTransaction
	| ParsedGiveawayTransaction
	| ParsedUnknownTransaction

export type ParsedTransactionType = ParsedTransaction['type']
