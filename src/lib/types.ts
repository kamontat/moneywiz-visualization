export type AccountType = 'A' | 'C' | 'D' | 'L' | 'I' | 'CT';

export interface ParsedAccount {
	name: string;
	extra: string;
	type: AccountType | 'Unknown';
}

export interface ParsedTag {
	group: string;
	name: string;
}

export interface ParsedCategory {
	root: string;
	sub: string;
}

export interface MoneyWizTransaction {
	account: ParsedAccount;
	transfers: ParsedAccount | null;
	description: string;
	payee: string;
	category: ParsedCategory | null;
	date: Date;
	memo: string;
	amount: number;
	currency: string;
	checkNumber: string;
	tags: ParsedTag[];
}
