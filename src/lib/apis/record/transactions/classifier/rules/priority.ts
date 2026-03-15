import type { TransactionType } from '../../types'
import type { ClassificationContext, ClassificationRule } from '../types'

const INCOME_PREFIXES = ['Compensation', 'Other Incomes']

const TRANSFER_ENTITY_TYPES = new Set([44, 45, 46])

function categoryEquals(
	ctx: ClassificationContext,
	parent: string,
	child: string
): boolean {
	return ctx.category === parent && ctx.subcategory === child
}

function hasCategory(ctx: ClassificationContext): boolean {
	return ctx.category !== '' || ctx.subcategory !== ''
}

function isTransferEntity(ctx: ClassificationContext): boolean {
	return TRANSFER_ENTITY_TYPES.has(ctx.raw.entityType)
}

function classifyTransferWithCategory(
	ctx: ClassificationContext
): TransactionType {
	if (INCOME_PREFIXES.includes(ctx.category)) return 'income'
	if (ctx.raw.entityType === 43) return 'refund'
	if (ctx.amount < 0) return 'expense'
	return 'income'
}

/** Priority 1: Category = "Other Expenses > Debt" */
export const debtRule: ClassificationRule = {
	name: 'debt',
	match: (ctx) =>
		categoryEquals(ctx, 'Other Expenses', 'Debt') ? 'debt' : null,
}

/** Priority 2: Category = "Other Incomes > Debt Repayment" */
export const debtRepaymentRule: ClassificationRule = {
	name: 'debt_repayment',
	match: (ctx) =>
		categoryEquals(ctx, 'Other Incomes', 'Debt Repayment')
			? 'debt_repayment'
			: null,
}

/** Priority 3: Category = "Other Incomes > Windfall" */
export const windfallRule: ClassificationRule = {
	name: 'windfall',
	match: (ctx) =>
		categoryEquals(ctx, 'Other Incomes', 'Windfall') ? 'windfall' : null,
}

/** Priority 4: Category = "Other Expenses > Giveaways" */
export const giveawayRule: ClassificationRule = {
	name: 'giveaway',
	match: (ctx) =>
		categoryEquals(ctx, 'Other Expenses', 'Giveaways') ? 'giveaway' : null,
}

/** Priority 5: Entity = ReconcileTransaction (42) */
export const reconcileRule: ClassificationRule = {
	name: 'reconcile',
	match: (ctx) => (ctx.raw.entityType === 42 ? 'reconcile' : null),
}

/** Priority 6: Transfer entity WITH category → classify as income/expense/refund */
export const transferWithCategoryRule: ClassificationRule = {
	name: 'transfer_with_category',
	match: (ctx) =>
		isTransferEntity(ctx) && hasCategory(ctx)
			? classifyTransferWithCategory(ctx)
			: null,
}

/** Priority 7: Transfer entity WITHOUT category → transfer */
export const transferNoCategoryRule: ClassificationRule = {
	name: 'transfer_no_category',
	match: (ctx) =>
		isTransferEntity(ctx) && !hasCategory(ctx) ? 'transfer' : null,
}

/** Priority 8: Entity = RefundTransaction (43) */
export const refundRule: ClassificationRule = {
	name: 'refund',
	match: (ctx) => (ctx.raw.entityType === 43 ? 'refund' : null),
}

/** Priority 9: Entity = InvestmentBuyTransaction (40) */
export const investmentBuyRule: ClassificationRule = {
	name: 'investment_buy',
	match: (ctx) => (ctx.raw.entityType === 40 ? 'buy' : null),
}

/** Priority 10: Entity = InvestmentSellTransaction (41) */
export const investmentSellRule: ClassificationRule = {
	name: 'investment_sell',
	match: (ctx) => (ctx.raw.entityType === 41 ? 'sell' : null),
}

/** Priority 11: Investment account + no category + amount > 0 → sell */
export const investmentAccountSellRule: ClassificationRule = {
	name: 'investment_account_sell',
	match: (ctx) =>
		ctx.accountEntityType === 15 && !hasCategory(ctx) && ctx.amount > 0
			? 'sell'
			: null,
}

/** Priority 12: Investment account + no category + amount < 0 → buy */
export const investmentAccountBuyRule: ClassificationRule = {
	name: 'investment_account_buy',
	match: (ctx) =>
		ctx.accountEntityType === 15 && !hasCategory(ctx) && ctx.amount < 0
			? 'buy'
			: null,
}

/** Priority 13: Amount > 0 AND category parent is income prefix → income */
export const incomeRule: ClassificationRule = {
	name: 'income',
	match: (ctx) =>
		ctx.amount > 0 && INCOME_PREFIXES.includes(ctx.category) ? 'income' : null,
}

/** Priority 14: Amount < 0 → expense */
export const expenseRule: ClassificationRule = {
	name: 'expense',
	match: (ctx) => (ctx.amount < 0 ? 'expense' : null),
}

/** Priority 15: Has category + parent NOT income prefix → refund */
export const refundFallbackRule: ClassificationRule = {
	name: 'refund_fallback',
	match: (ctx) =>
		hasCategory(ctx) && !INCOME_PREFIXES.includes(ctx.category)
			? 'refund'
			: null,
}

/** Priority 16: No match → unknown */
export const unknownRule: ClassificationRule = {
	name: 'unknown',
	match: () => 'unknown',
}
