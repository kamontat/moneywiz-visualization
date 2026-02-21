import type {
	ParsedBuyTransaction,
	ParsedDebtRepaymentTransaction,
	ParsedDebtTransaction,
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedReconcileTransaction,
	ParsedRefundTransaction,
	ParsedSellTransaction,
	ParsedTransferTransaction,
	ParsedUnknownTransaction,
	ParsedWindfallTransaction,
} from './transaction'

export type ParsedTransaction =
	| ParsedBuyTransaction
	| ParsedExpenseTransaction
	| ParsedRefundTransaction
	| ParsedIncomeTransaction
	| ParsedSellTransaction
	| ParsedReconcileTransaction
	| ParsedTransferTransaction
	| ParsedDebtTransaction
	| ParsedDebtRepaymentTransaction
	| ParsedWindfallTransaction
	| ParsedGiveawayTransaction
	| ParsedUnknownTransaction

export type ParsedTransactionType = ParsedTransaction['type']
