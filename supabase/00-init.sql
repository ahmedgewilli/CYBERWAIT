-- supabase/00-init.sql
-- Idempotent migration for Supabase/Postgres
-- Creates extensions, tables, RLS policies and seeds sample menu items
-- Run in Supabase SQL editor (Project → SQL Editor → New Query) or via psql
-- NOTE: Do NOT commit any service_role keys. Revoke any temporary keys after use.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- MENU
CREATE TABLE IF NOT EXISTS menu (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT REFERENCES menu(id),
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);

-- Enable RLS on sensitive tables (idempotent)
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent). These make sense for real auth where profile_id = auth.uid().
-- Service role key bypasses RLS; policies help normal auth flows.
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Orders: owner' AND tablename = 'orders') THEN
    EXECUTE $$
      CREATE POLICY "Orders: owner" ON orders
        FOR ALL
        USING (profile_id = auth.uid())
        WITH CHECK (profile_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'OrderItems: owners' AND tablename = 'order_items') THEN
    EXECUTE $$
      CREATE POLICY "OrderItems: owners" ON order_items
        FOR ALL
        USING (exists (select 1 from orders o where o.id = order_items.order_id AND o.profile_id = auth.uid()))
        WITH CHECK (exists (select 1 from orders o where o.id = order_items.order_id AND o.profile_id = auth.uid()));
    $$;
  END IF;
END
$do$;

-- Seed menu items (idempotent)
INSERT INTO menu (name, category, price, description, image)
SELECT m.name, m.category, m.price, m.description, m.image FROM (VALUES
  ('Neon Sushi Roll','Meals',18.50,'Fresh salmon with electric wasabi pearls and avocado.','https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400'),
  ('Cypher Burger','Meals',15.00,'A5 Wagyu beef with a signature digital glaze on brioche.','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
  ('Nebula Ramen','Meals',19.00,'Midnight-blue broth with glowing bamboo shoots and soft-boiled egg.','https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'),
  ('Binary Tacos','Meals',14.50,'One mild, one wild. Precision-balanced carnitas with neon lime.','https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400'),
  ('Pixel Pizza','Meals',17.00,'Algorithmically placed pepperonis on a perfect square crust.','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
  ('Zen Garden Salad','Meals',12.50,'Organic greens with micro-herbs and citrus mist dressing.','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'),
  ('Quantum Espresso','Drinks',6.50,'Double shot of single-origin smart brew beans.','https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400'),
  ('Void Cola','Drinks',5.00,'Zero-sugar, deep-black sparkling refreshment with hint of vanilla.','https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400'),
  ('Hologram Cake','Desserts',12.00,'Layers of translucent fruit jelly and Madagascar vanilla cream.','https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400'),
  ('Data Donuts','Desserts',11.00,'Circuit-board icing with popping candy "code" bits.','https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400'),
  ('Gravity Fries','Meals',7.00,'Truffle-dusted potato wedges with a molten dipping core.','https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400')
) as m(name, category, price, description, image)
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE name = m.name AND price = m.price);

-- Simple verification queries (run manually to inspect results):
-- SELECT COUNT(*) FROM menu;
-- SELECT * FROM menu LIMIT 10;
-- SELECT COUNT(*) FROM orders;
-- SELECT COUNT(*) FROM profiles;

-- Done.
