-- Drop table_number column from orders (safe idempotent operation)
ALTER TABLE IF EXISTS orders DROP COLUMN IF EXISTS table_number;
