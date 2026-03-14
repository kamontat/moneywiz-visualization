import type {
	ParsedAccount,
	ParsedCategory,
	ParsedTag,
} from '$lib/transactions/models'
import type { TagCategoryGroup } from '$lib/transactions/models/tag'
import { SPECIAL_CATEGORIES } from '$lib/transactions/constants'

export const getCategoryFullName = (category: ParsedCategory): string => {
	if (!category.subcategory) return category.category
	return `${category.category} > ${category.subcategory}`
}

export const extractTagCategories = (
	transactions: { tags: ParsedTag[] }[]
): TagCategoryGroup[] => {
	const categoryMap = new Map<string, Set<string>>()

	for (const trx of transactions) {
		for (const tag of trx.tags) {
			if (!tag.category || !tag.name) continue
			if (!categoryMap.has(tag.category)) {
				categoryMap.set(tag.category, new Set())
			}
			categoryMap.get(tag.category)!.add(tag.name)
		}
	}

	return Array.from(categoryMap.entries())
		.map(([category, tags]) => ({
			category,
			tags: Array.from(tags).sort(),
		}))
		.sort((a, b) => a.category.localeCompare(b.category))
}

export const extractPayees = (transactions: { payee?: string }[]): string[] => {
	const payeeSet = new Set<string>()
	for (const trx of transactions) {
		if (trx.payee !== undefined && trx.payee !== '') {
			payeeSet.add(trx.payee)
		}
	}
	return Array.from(payeeSet).sort((a, b) => a.localeCompare(b))
}

export const extractCategories = (
	transactions: { category?: ParsedCategory }[]
): ParsedCategory[] => {
	const categoryMap = new Map<string, ParsedCategory>()

	for (const trx of transactions) {
		if (!trx.category) continue
		const category = trx.category
		const fullName = getCategoryFullName(category)
		categoryMap.set(fullName, category)
		categoryMap.set(category.category, {
			category: category.category,
			subcategory: '',
		})
	}

	return Array.from(categoryMap.values()).sort((a, b) => {
		return getCategoryFullName(a).localeCompare(getCategoryFullName(b))
	})
}

export const extractAccounts = (
	transactions: { account?: ParsedAccount }[]
): string[] => {
	const accountSet = new Set<string>()
	for (const trx of transactions) {
		if (trx.account !== undefined && trx.account.name !== '') {
			accountSet.add(trx.account.name)
		}
	}
	return Array.from(accountSet).sort((a, b) => a.localeCompare(b))
}

export const isSpecialCategory = (category: ParsedCategory): boolean => {
	const fullName = getCategoryFullName(category)
	const allSpecial = Object.values(SPECIAL_CATEGORIES)
	return allSpecial.includes(fullName as (typeof allSpecial)[number])
}

export const isDebtCategory = (category: ParsedCategory): boolean => {
	const fullName = getCategoryFullName(category)
	return fullName === SPECIAL_CATEGORIES.DEBT
}

export const isDebtRepaymentCategory = (category: ParsedCategory): boolean => {
	const fullName = getCategoryFullName(category)
	return fullName === SPECIAL_CATEGORIES.DEBT_REPAYMENT
}

export const isWindfallCategory = (category: ParsedCategory): boolean => {
	const fullName = getCategoryFullName(category)
	return fullName === SPECIAL_CATEGORIES.WINDFALL
}

export const isGiveawayCategory = (category: ParsedCategory): boolean => {
	const fullName = getCategoryFullName(category)
	return fullName === SPECIAL_CATEGORIES.GIVEAWAYS
}

export const isGiftCategory = (category: ParsedCategory): boolean => {
	return isWindfallCategory(category) || isGiveawayCategory(category)
}
