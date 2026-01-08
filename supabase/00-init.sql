-- Create policies safely: only if tables exist, ignore "already exists" errors
DO $do$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    BEGIN
      CREATE POLICY "Orders: owner" ON orders
        FOR ALL
        USING (profile_id = auth.uid())
        WITH CHECK (profile_id = auth.uid());
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  IF to_regclass('public.order_items') IS NOT NULL THEN
    BEGIN
      CREATE POLICY "OrderItems: owners" ON order_items
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
              AND o.profile_id = auth.uid()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
              AND o.profile_id = auth.uid()
          )
        );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$do$;

-- Ensure backend payment fields exist (idempotent)
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS card_expiry VARCHAR(10);