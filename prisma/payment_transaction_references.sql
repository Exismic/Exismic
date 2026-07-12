ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS transaction_reference TEXT;

UPDATE payment_transactions
SET transaction_reference = 'EXM-' ||
  CASE
    WHEN kind ILIKE '%credit%' THEN 'CR'
    ELSE 'PRO'
  END || '-' ||
  TO_CHAR(created_at, 'YYMM') || '-' ||
  UPPER(SUBSTRING(MD5(id || provider_payment_id || created_at::text), 1, 8))
WHERE transaction_reference IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_transactions_transaction_reference_key
  ON payment_transactions(transaction_reference)
  WHERE transaction_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS payment_transactions_user_kind_created_at_idx
  ON payment_transactions(user_id, kind, created_at DESC);
