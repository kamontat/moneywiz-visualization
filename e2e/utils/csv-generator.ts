export interface MoneyWizRecord {
	Account?: string;
	Transfers?: string;
	Description?: string;
	Payee?: string;
	Category?: string;
	Date?: string;
	Time?: string;
	Memo?: string;
	Amount?: string;
	Currency?: string;
	CheckBy?: string; // Check #
	Tags?: string;
}

export const generateCsv = (records: MoneyWizRecord[]): string => {
	const headers = [
		'Account',
		'Transfers',
		'Description',
		'Payee',
		'Category',
		'Date',
		'Time',
		'Memo',
		'Amount',
		'Currency',
		'Check #',
		'Tags'
	];

	const headerLine = headers.map((h) => `"${h}"`).join(',');
	const rows = records.map((r) => {
		return [
			r.Account ?? 'Test Account',
			r.Transfers ?? '',
			r.Description ?? 'Test Transaction',
			r.Payee ?? 'Test Payee',
			r.Category ?? 'Uncategorized',
			r.Date ?? '01/01/2026',
			r.Time ?? '12:00',
			r.Memo ?? '',
			r.Amount ?? '100.00',
			r.Currency ?? 'THB',
			r.CheckBy ?? '',
			r.Tags ?? ''
		]
			.map((v) => `"${v}"`)
			.join(',');
	});

	return `sep=,\n${headerLine}\n${rows.join('\n')}`;
};

export const defaultRecord: MoneyWizRecord = {
	Account: 'Test Account',
	Description: 'Test Transaction',
	Payee: 'Test Payee',
	Category: 'Food',
	Date: '01/01/2026',
	Time: '12:00',
	Amount: '-100.00',
	Currency: 'THB'
};
