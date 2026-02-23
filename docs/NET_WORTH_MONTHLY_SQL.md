# Net Worth Monthly SQL (Raw MoneyWiz SQLite)

This document defines SQL for monthly net worth with these requirements:

1. Ignore current month (incomplete month)
2. Output `start_balance`, `changed`, `end_balance`
3. Provide two statements:
   - Total net worth
   - Specific account

Investment behavior:

- Buy/Sell in investment accounts is cash <-> asset conversion, not direct
  net worth gain/loss.
- Investment balance should come from
  `ZINVESTMENTACCOUNTTOTALVALUE` (`cash + holdings`), not Buy/Sell sums.

## Shared Rules

- Account rows: `ZSYNCOBJECT` with `Z_ENT BETWEEN 10 AND 16`
- Non-investment accounts: `Z_ENT != 15`
- Investment accounts: `Z_ENT = 15`
- Loan accounts are excluded from net worth: `Z_ENT != 14`
- Transaction datetime conversion:
  `datetime(core_data_seconds + 978307200, 'unixepoch')`
- Month bucket:
  `date(..., 'start of month', '+1 month', '-1 day')`
- Current month ignored using:
  `date('now', 'start of month', '-1 day')`

## 1) SQL: Total Net Worth per Month

Output columns per month:

- `month_end`
- `start_balance` (total net worth at start of month)
- `changed` (net change in month)
- `end_balance` (total net worth at end of month)

```sql
WITH RECURSIVE
params AS (
	SELECT date('now', 'start of month', '-1 day') AS last_complete_month_end
),
accounts AS (
	SELECT
		a.Z_PK AS account_id,
		a.Z_ENT AS account_ent,
		COALESCE(
			a.ZNAME, a.ZNAME1, a.ZNAME2, a.ZNAME3, a.ZNAME4, a.ZNAME5, a.ZNAME6,
			'Account #' || a.Z_PK
		) AS account_name,
		COALESCE(a.ZOPENINGBALANCE, a.ZOPENINGBALANCE1, 0) AS opening_balance
	FROM ZSYNCOBJECT a
	WHERE a.Z_ENT BETWEEN 10 AND 16
		AND a.Z_ENT != 14
),
transaction_rows AS (
	SELECT
		COALESCE(t.ZDATE1, t.ZDATE) AS tx_coredata_sec,
		COALESCE(t.ZAMOUNT1, t.ZAMOUNT, 0) AS tx_amount,
		COALESCE(t.ZACCOUNT2, t.ZACCOUNT1, t.ZACCOUNT) AS account_id,
		COALESCE(t.ZSENDERACCOUNT, t.Z9_SENDERACCOUNT) AS sender_account_id,
		COALESCE(
			t.ZRECIPIENTACCOUNT1,
			t.ZRECIPIENTACCOUNT,
			t.Z9_RECIPIENTACCOUNT1,
			t.Z9_RECIPIENTACCOUNT
		) AS recipient_account_id
	FROM ZSYNCOBJECT t
	JOIN Z_PRIMARYKEY pk ON pk.Z_ENT = t.Z_ENT
	WHERE pk.Z_NAME LIKE '%Transaction'
		AND pk.Z_NAME NOT LIKE 'Scheduled%'
		AND COALESCE(t.ZDATE1, t.ZDATE) IS NOT NULL
),
transaction_legs AS (
	SELECT
		date(
			datetime(tx_coredata_sec + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		sender_account_id AS account_id,
		-abs(tx_amount) AS signed_amount
	FROM transaction_rows
	WHERE sender_account_id IS NOT NULL
		AND recipient_account_id IS NOT NULL

	UNION ALL

	SELECT
		date(
			datetime(tx_coredata_sec + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		recipient_account_id AS account_id,
		abs(tx_amount) AS signed_amount
	FROM transaction_rows
	WHERE sender_account_id IS NOT NULL
		AND recipient_account_id IS NOT NULL

	UNION ALL

	SELECT
		date(
			datetime(tx_coredata_sec + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		account_id,
		tx_amount AS signed_amount
	FROM transaction_rows
	WHERE NOT (sender_account_id IS NOT NULL AND recipient_account_id IS NOT NULL)
		AND account_id IS NOT NULL
),
non_investment_monthly_change AS (
	SELECT
		l.month_end,
		l.account_id,
		SUM(l.signed_amount) AS changed
	FROM transaction_legs l
	JOIN accounts a ON a.account_id = l.account_id
	WHERE a.account_ent != 15
	GROUP BY l.month_end, l.account_id
),
investment_snapshot_base AS (
	SELECT
		date(
			datetime(v.ZDATE + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		COALESCE(v.ZINVESTMENTACCOUNT, v.Z15_INVESTMENTACCOUNT) AS account_id,
		COALESCE(v.ZCASHVALUE, 0) + COALESCE(v.ZHOLDINGSVALUE, 0) AS total_value,
		datetime(v.ZDATE + 978307200, 'unixepoch') AS snapshot_ts
	FROM ZINVESTMENTACCOUNTTOTALVALUE v
	WHERE COALESCE(v.ZINVESTMENTACCOUNT, v.Z15_INVESTMENTACCOUNT) IS NOT NULL
		AND v.ZDATE IS NOT NULL
),
investment_snapshot_monthly AS (
	SELECT
		b.month_end,
		b.account_id,
		b.total_value
	FROM investment_snapshot_base b
	JOIN (
		SELECT month_end, account_id, MAX(snapshot_ts) AS max_snapshot_ts
		FROM investment_snapshot_base
		GROUP BY month_end, account_id
	) picked
		ON picked.month_end = b.month_end
		AND picked.account_id = b.account_id
		AND picked.max_snapshot_ts = b.snapshot_ts
),
min_month_source AS (
	SELECT MIN(month_end) AS min_month_end
	FROM (
		SELECT month_end FROM non_investment_monthly_change
		UNION ALL
		SELECT month_end FROM investment_snapshot_monthly
	)
),
months(month_end) AS (
	SELECT min_month_end FROM min_month_source
	UNION ALL
	SELECT date(month_end, 'start of month', '+2 month', '-1 day')
	FROM months, params
	WHERE month_end < params.last_complete_month_end
),
account_month_grid AS (
	SELECT
		m.month_end,
		a.account_id,
		a.account_ent,
		a.account_name,
		a.opening_balance
	FROM months m
	CROSS JOIN accounts a
	JOIN params p ON 1 = 1
	WHERE m.month_end <= p.last_complete_month_end
),
non_investment_balances AS (
	SELECT
		g.month_end,
		g.account_id,
		g.account_name,
		COALESCE(
			g.opening_balance + SUM(COALESCE(c.changed, 0)) OVER (
				PARTITION BY g.account_id
				ORDER BY g.month_end
				ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
			),
			g.opening_balance
		) AS start_balance,
		COALESCE(c.changed, 0) AS changed,
		g.opening_balance + SUM(COALESCE(c.changed, 0)) OVER (
			PARTITION BY g.account_id
			ORDER BY g.month_end
			ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
		) AS end_balance
	FROM account_month_grid g
	LEFT JOIN non_investment_monthly_change c
		ON c.account_id = g.account_id
		AND c.month_end = g.month_end
	WHERE g.account_ent != 15
),
investment_balances AS (
	SELECT
		g.month_end,
		g.account_id,
		g.account_name,
		LAG(
			COALESCE((
				SELECT s.total_value
				FROM investment_snapshot_monthly s
				WHERE s.account_id = g.account_id
					AND s.month_end <= g.month_end
				ORDER BY s.month_end DESC
				LIMIT 1
			), g.opening_balance),
			1,
			g.opening_balance
		) OVER (
			PARTITION BY g.account_id
			ORDER BY g.month_end
		) AS start_balance,
		COALESCE((
			SELECT s.total_value
			FROM investment_snapshot_monthly s
			WHERE s.account_id = g.account_id
				AND s.month_end <= g.month_end
			ORDER BY s.month_end DESC
			LIMIT 1
		), g.opening_balance)
		- LAG(
			COALESCE((
				SELECT s2.total_value
				FROM investment_snapshot_monthly s2
				WHERE s2.account_id = g.account_id
					AND s2.month_end <= g.month_end
				ORDER BY s2.month_end DESC
				LIMIT 1
			), g.opening_balance),
			1,
			g.opening_balance
		) OVER (
			PARTITION BY g.account_id
			ORDER BY g.month_end
		) AS changed,
		COALESCE((
			SELECT s.total_value
			FROM investment_snapshot_monthly s
			WHERE s.account_id = g.account_id
				AND s.month_end <= g.month_end
			ORDER BY s.month_end DESC
			LIMIT 1
		), g.opening_balance) AS end_balance
	FROM account_month_grid g
	WHERE g.account_ent = 15
),
all_account_balances AS (
	SELECT month_end, account_id, account_name, start_balance, changed, end_balance
	FROM non_investment_balances
	UNION ALL
	SELECT month_end, account_id, account_name, start_balance, changed, end_balance
	FROM investment_balances
)
SELECT
	month_end,
	ROUND(SUM(start_balance), 2) AS start_balance,
	ROUND(SUM(changed), 2) AS changed,
	ROUND(SUM(end_balance), 2) AS end_balance
FROM all_account_balances
GROUP BY month_end
ORDER BY month_end
```

## 2) SQL: Monthly Balance for One Specific Account

Set `target_account` to your account id.

Output columns:

- `month_end`
- `account_id`
- `account_name`
- `start_balance`
- `changed`
- `end_balance`

```sql
WITH RECURSIVE
params AS (
	SELECT
		date('now', 'start of month', '-1 day') AS last_complete_month_end,
		751 AS target_account
),
account_pick AS (
	SELECT
		a.Z_PK AS account_id,
		a.Z_ENT AS account_ent,
		COALESCE(
			a.ZNAME, a.ZNAME1, a.ZNAME2, a.ZNAME3, a.ZNAME4, a.ZNAME5, a.ZNAME6,
			'Account #' || a.Z_PK
		) AS account_name,
		COALESCE(a.ZOPENINGBALANCE, a.ZOPENINGBALANCE1, 0) AS opening_balance
	FROM ZSYNCOBJECT a
	JOIN params p ON p.target_account = a.Z_PK
	WHERE a.Z_ENT BETWEEN 10 AND 16
		AND a.Z_ENT != 14
),
transaction_rows AS (
	SELECT
		COALESCE(t.ZDATE1, t.ZDATE) AS tx_coredata_sec,
		COALESCE(t.ZAMOUNT1, t.ZAMOUNT, 0) AS tx_amount,
		COALESCE(t.ZACCOUNT2, t.ZACCOUNT1, t.ZACCOUNT) AS account_id,
		COALESCE(t.ZSENDERACCOUNT, t.Z9_SENDERACCOUNT) AS sender_account_id,
		COALESCE(
			t.ZRECIPIENTACCOUNT1,
			t.ZRECIPIENTACCOUNT,
			t.Z9_RECIPIENTACCOUNT1,
			t.Z9_RECIPIENTACCOUNT
		) AS recipient_account_id
	FROM ZSYNCOBJECT t
	JOIN Z_PRIMARYKEY pk ON pk.Z_ENT = t.Z_ENT
	WHERE pk.Z_NAME LIKE '%Transaction'
		AND pk.Z_NAME NOT LIKE 'Scheduled%'
		AND COALESCE(t.ZDATE1, t.ZDATE) IS NOT NULL
),
transaction_legs AS (
	SELECT
		date(
			datetime(tx_coredata_sec + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		sender_account_id AS account_id,
		-abs(tx_amount) AS signed_amount
	FROM transaction_rows
	WHERE sender_account_id IS NOT NULL
		AND recipient_account_id IS NOT NULL

	UNION ALL

	SELECT
		date(
			datetime(tx_coredata_sec + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		recipient_account_id AS account_id,
		abs(tx_amount) AS signed_amount
	FROM transaction_rows
	WHERE sender_account_id IS NOT NULL
		AND recipient_account_id IS NOT NULL

	UNION ALL

	SELECT
		date(
			datetime(tx_coredata_sec + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		account_id,
		tx_amount AS signed_amount
	FROM transaction_rows
	WHERE NOT (sender_account_id IS NOT NULL AND recipient_account_id IS NOT NULL)
		AND account_id IS NOT NULL
),
monthly_change AS (
	SELECT
		l.month_end,
		SUM(l.signed_amount) AS changed
	FROM transaction_legs l
	JOIN account_pick a ON a.account_id = l.account_id
	WHERE a.account_ent != 15
	GROUP BY l.month_end
),
investment_snapshot_base AS (
	SELECT
		date(
			datetime(v.ZDATE + 978307200, 'unixepoch'),
			'start of month', '+1 month', '-1 day'
		) AS month_end,
		COALESCE(v.ZINVESTMENTACCOUNT, v.Z15_INVESTMENTACCOUNT) AS account_id,
		COALESCE(v.ZCASHVALUE, 0) + COALESCE(v.ZHOLDINGSVALUE, 0) AS total_value,
		datetime(v.ZDATE + 978307200, 'unixepoch') AS snapshot_ts
	FROM ZINVESTMENTACCOUNTTOTALVALUE v
	WHERE COALESCE(v.ZINVESTMENTACCOUNT, v.Z15_INVESTMENTACCOUNT) IS NOT NULL
		AND v.ZDATE IS NOT NULL
),
investment_snapshot_monthly AS (
	SELECT
		b.month_end,
		b.account_id,
		b.total_value
	FROM investment_snapshot_base b
	JOIN (
		SELECT month_end, account_id, MAX(snapshot_ts) AS max_snapshot_ts
		FROM investment_snapshot_base
		GROUP BY month_end, account_id
	) picked
		ON picked.month_end = b.month_end
		AND picked.account_id = b.account_id
		AND picked.max_snapshot_ts = b.snapshot_ts
),
min_month_source AS (
	SELECT MIN(month_end) AS min_month_end
	FROM (
		SELECT month_end FROM monthly_change
		UNION ALL
		SELECT month_end
		FROM investment_snapshot_monthly s
		JOIN account_pick a ON a.account_id = s.account_id
	)
),
months(month_end) AS (
	SELECT min_month_end FROM min_month_source
	UNION ALL
	SELECT date(month_end, 'start of month', '+2 month', '-1 day')
	FROM months, params
	WHERE month_end < params.last_complete_month_end
)
SELECT
	m.month_end,
	a.account_id,
	a.account_name,
	ROUND(
		CASE
			WHEN a.account_ent = 15 THEN LAG(
				COALESCE((
					SELECT s.total_value
					FROM investment_snapshot_monthly s
					WHERE s.account_id = a.account_id
						AND s.month_end <= m.month_end
					ORDER BY s.month_end DESC
					LIMIT 1
				), a.opening_balance),
				1,
				a.opening_balance
			) OVER (ORDER BY m.month_end)
			ELSE COALESCE(
				a.opening_balance + SUM(COALESCE(c.changed, 0)) OVER (
					ORDER BY m.month_end
					ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
				),
				a.opening_balance
			)
		END,
		2
	) AS start_balance,
	ROUND(
		CASE
			WHEN a.account_ent = 15 THEN COALESCE((
				SELECT s.total_value
				FROM investment_snapshot_monthly s
				WHERE s.account_id = a.account_id
					AND s.month_end <= m.month_end
				ORDER BY s.month_end DESC
				LIMIT 1
			), a.opening_balance) - LAG(
				COALESCE((
					SELECT s2.total_value
					FROM investment_snapshot_monthly s2
					WHERE s2.account_id = a.account_id
						AND s2.month_end <= m.month_end
					ORDER BY s2.month_end DESC
					LIMIT 1
				), a.opening_balance),
				1,
				a.opening_balance
			) OVER (ORDER BY m.month_end)
			ELSE COALESCE(c.changed, 0)
		END,
		2
	) AS changed,
	ROUND(
		CASE
			WHEN a.account_ent = 15 THEN COALESCE((
				SELECT s.total_value
				FROM investment_snapshot_monthly s
				WHERE s.account_id = a.account_id
					AND s.month_end <= m.month_end
				ORDER BY s.month_end DESC
				LIMIT 1
			), a.opening_balance)
			ELSE a.opening_balance + SUM(COALESCE(c.changed, 0)) OVER (
				ORDER BY m.month_end
				ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
			)
		END,
		2
	) AS end_balance
FROM months m
CROSS JOIN account_pick a
LEFT JOIN monthly_change c ON c.month_end = m.month_end
JOIN params p ON 1 = 1
WHERE m.month_end <= p.last_complete_month_end
ORDER BY m.month_end
```

## Notes

- If `ZINVESTMENTACCOUNTTOTALVALUE` has no rows, investment account output
  falls back to opening balance carry-forward.
- Replace `751` in `target_account` with the account id you want.
- If `target_account` is a loan account (`Z_ENT = 14`), the query returns no
  rows because loans are excluded from net worth.
