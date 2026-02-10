import type {
	ParsedBuyTransaction,
	ParsedDebtRepaymentTransaction,
	ParsedDebtTransaction,
	ParsedExpenseTransaction,
	ParsedGiveawayTransaction,
	ParsedIncomeTransaction,
	ParsedNewBalanceTransaction,
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
	| ParsedNewBalanceTransaction
	| ParsedTransferTransaction
	| ParsedDebtTransaction
	| ParsedDebtRepaymentTransaction
	| ParsedWindfallTransaction
	| ParsedGiveawayTransaction
	| ParsedUnknownTransaction

export type ParsedTransactionType = ParsedTransaction['type']
