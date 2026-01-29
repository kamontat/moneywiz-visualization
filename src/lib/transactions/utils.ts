import { DEFAULT_CURRENCY } from './constants'
import type {
	ParsedAccount,
	ParsedAccountType,
	ParsedAmount,
	ParsedCategory,
	ParsedTag,
} from './models'

/**
 * parseAccount syntax: `<name> [<extra>] (<type>)`
 * @param text input raw account name
 * @returns parsed account
 */
export const parseAccount = (text: string): ParsedAccount => {
	// TODO: implement this function
	return {} as ParsedAccount
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
	// TODO: implement this function
	return 'Unknown' as ParsedAccountType
}

/**
 * parseAmount parses the amount text and optional currency code
 * @param text input raw amount text
 * @param currency optional currency code
 * @returns parsed amount
 */
export const parseAmount = (text: string, currency: string = DEFAULT_CURRENCY): ParsedAmount => {
	// TODO: implement this function
	return {} as ParsedAmount
}

/**
 * parseCategory parses `<category> > <subcategory>` syntax
 * @param text input raw category text
 * @returns parsed category
 */
export const parseCategory = (text: string): ParsedCategory => {
	// TODO: implement this function
	return {} as ParsedCategory
}

/**
 * parseTag parses `<category>: <name>` syntax
 * @param text input raw tag text
 * @returns parsed tag
 */
export const parseTag = (text: string): ParsedTag[] => {
	// TODO: implement this function
	return []
}
