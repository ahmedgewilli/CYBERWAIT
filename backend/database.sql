-- Menu Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image VARCHAR(500)
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    table_number INTEGER,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert sample menu items
INSERT INTO menu_items (name, category, price, description, image) VALUES
('Neon Sushi Roll', 'Meals', 18.50, 'Fresh salmon with electric wasabi pearls and avocado.', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400'),
('Cypher Burger', 'Meals', 15.00, 'A5 Wagyu beef with a signature digital glaze on brioche.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
('Nebula Ramen', 'Meals', 19.00, 'Midnight-blue broth with glowing bamboo shoots and soft-boiled egg.', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'),
('Binary Tacos', 'Meals', 14.50, 'One mild, one wild. Precision-balanced carnitas with neon lime.', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400'),
('Pixel Pizza', 'Meals', 17.00, 'Algorithmically placed pepperonis on a perfect square crust.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
('Zen Garden Salad', 'Meals', 12.50, 'Organic greens with micro-herbs and citrus mist dressing.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'),
('Gravity Fries', 'Meals', 7.00, 'Truffle-dusted potato wedges with a molten dipping core.', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400'),
('Quantum Espresso', 'Drinks', 6.50, 'Double shot of single-origin smart brew beans.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400'),
('Void Cola', 'Drinks', 5.00, 'Zero-sugar, deep-black sparkling refreshment with hint of vanilla.', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400'),
('Hologram Cake', 'Desserts', 12.00, 'Layers of translucent fruit jelly and Madagascar vanilla cream.', 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400'),
('Data Donuts', 'Desserts', 11.00, 'Circuit-board icing with popping candy ''code'' bits.', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400');

