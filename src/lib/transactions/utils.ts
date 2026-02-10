import type {
	ParsedAccount,
	ParsedAccountType,
	ParsedAmount,
	ParsedCategory,
	ParsedTag,
} from './models'
import type { TagCategoryGroup } from './models/tag'
import {
	DEFAULT_CURRENCY,
	INCOME_CATEGORY_PREFIXES,
	SPECIAL_CATEGORIES,
} from './constants'

const noNaN = (val: number) => (isNaN(val) ? 0 : val)

/**
 * parseAccount syntax: `<name> [<extra>] (<type>)`
 * @param text input raw account name
 * @returns parsed account
 */
export const parseAccount = (text: string): ParsedAccount => {
	const typeRegex = /\(([^)]+)\)$/
	const extraRegex = /\[([^\]]+)\]$/

	let name = text.trim()
	let type: ParsedAccountType = 'Unknown'
	let extra: string | null = null

	const typeMatch = text.match(typeRegex)
	if (typeMatch) {
		type = parseAccountType(typeMatch[1])
		name = text.replace(typeMatch[0], '').trim()
	}

	const extraMatch = name.match(extraRegex)
	if (extraMatch) {
		extra = extraMatch[1]
		name = name.replace(extraMatch[0], '').trim()
	}

	return { type, name, extra }
}

/**
 * parseAccountType as following:
 *   1. A => 'Checking'
 *   2. C => 'CreditCard'
 *   3. D => 'DebitCard'
 *   4. I => 'Investment'
 *   5. L => 'Loan'
 *   6. W => 'Wallet'
 *   7. OW => 'OnlineWallet'
 *   8. CT => 'Cryptocurrency'
 *   9. otherwise => 'Unknown'
 * @param text input raw account type
 * @returns parsed account type
 */
export const parseAccountType = (text: string): ParsedAccountType => {
	switch (text) {
		case 'A':
			return 'Checking'
		case 'C':
			return 'CreditCard'
		case 'D':
			return 'DebitCard'
		case 'I':
			return 'Investment'
		case 'L':
			return 'Loan'
		case 'W':
			return 'Wallet'
		case 'OW':
			return 'OnlineWallet'
		case 'CT':
			return 'Cryptocurrency'
		default:
			return 'Unknown'
	}
}

/**
 * parseAmount parses the amount text and optional currency code
 * @param text input raw amount text
 * @param currency optional currency code
 * @returns parsed amount
 */
export const parseAmount = (
	text: string,
	currency: string | undefined | null
): ParsedAmount => {
	const sanitized = text.replace(/,/g, '').trim()
	const value = parseFloat(sanitized)

	return {
		value: noNaN(value),
		currency: currency || DEFAULT_CURRENCY,
		format: undefined,
	}
}

/**
 * parseCategory parses `<category> > <subcategory>` or `<category> ► <subcategory>` syntax
 * MoneyWiz exports use different separators:
 * - ">" (greater-than) in some exports
 * - "►" (U+25BA, filled right-pointing triangle) in other exports
 * @param text input raw category text
 * @returns parsed category
 */
export const parseCategory = (text: string): ParsedCategory => {
	// Match both ">" and "►" (U+25BA) as category separators
	const parts = text.split(/\s*[>►]\s*/, 2)
	if (parts.length === 2) {
		return { category: parts[0].trim(), subcategory: parts[1].trim() }
	}

	return { category: text.trim(), subcategory: '' }
}

/**
 * parseTag parses `<category>: <name>` syntax
 * @param text input raw tag text
 * @returns parsed tag
 */
export const parseTag = (text: string): ParsedTag[] => {
	if (!text) return []

	const categoryMap = (name: string) => {
		switch (name) {
			case 'Zvent':
				return 'Event'
			default:
				return name
		}
	}

	return text
		.split(';')
		.map((tag) => {
			const trimmed = tag.trim()
			if (!trimmed) return null

			const parts = trimmed.split(/\s*:\s*/, 2)
			if (parts.length === 2) {
				const name = parts[1].trim()
				if (!name) return null
				return {
					category: categoryMap(parts[0].trim()),
					name,
				}
			}
			return { category: '', name: trimmed }
		})
		.filter((tag): tag is ParsedTag => tag !== null)
}

/**
 * parseDate parses date and optional time text (DD/MM/YYYY and HH:MM)
 * @param text input raw date text
 * @param time input raw time text
 * @returns parsed Date
 */
export const parseDate = (
	text: string,
	time: string | undefined | null
): Date => {
	if (!text) return new Date(0)

	// Format: DD/MM/YYYY
	const [day, month, year] = text
		.split('/', 3)
		.map((v) => Number.parseInt(v, 10))
	// Format: HH:MM
	const [hours, minutes] = time
		?.split(':')
		.map((v) => Number.parseInt(v, 10)) ?? [0, 0]

	// Create date (month is 0-indexed)
	return new Date(year, month - 1, day, noNaN(hours), noNaN(minutes))
}

export const isNewBalanceDescription = (description: string): boolean => {
	return description.trim().toLowerCase() === 'new balance'
}

export const isIncomeCategory = (category: ParsedCategory): boolean => {
	return INCOME_CATEGORY_PREFIXES.some((prefix) => category.category === prefix)
}

export const getCategoryFullName = (category: ParsedCategory): string => {
	if (!category.subcategory) return category.category
	return `${category.category} > ${category.subcategory}`
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
