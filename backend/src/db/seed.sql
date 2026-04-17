-- Admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@namma-mane.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Products
INSERT INTO products (name, category, price, unit, description, emoji) VALUES
-- Fruits
('Apples', 'fruits', 120.00, 'kg', 'Fresh organic apples, handpicked from farms', '🍎'),
('Oranges', 'fruits', 80.00, 'kg', 'Sweet and juicy organic oranges', '🍊'),
('Grapes', 'fruits', 100.00, 'kg', 'Organic seedless grapes', '🍇'),
('Strawberries', 'fruits', 200.00, 'kg', 'Farm-fresh organic strawberries', '🍓'),
-- Vegetables
('Onions', 'vegetables', 40.00, 'kg', 'Organic red onions, freshly harvested', '🧅'),
('Tomatoes', 'vegetables', 60.00, 'kg', 'Ripe organic tomatoes', '🍅'),
('Beans', 'vegetables', 80.00, 'kg', 'Fresh green beans, organically grown', '🫛'),
('Carrots', 'vegetables', 70.00, 'kg', 'Crunchy organic carrots', '🥕'),
-- Meats
('Goat Meat', 'meats', 800.00, 'kg', 'Farm-raised organic goat meat', '🐐'),
('Chicken', 'meats', 250.00, 'kg', 'Free-range organic chicken', '🐔'),
('Country Eggs', 'meats', 120.00, 'dozen', 'Organic country eggs, farm-fresh', '🥚'),
-- Seafood
('Sea Fish', 'seafood', 400.00, 'kg', 'Fresh catch organic sea fish', '🐟')
ON CONFLICT DO NOTHING;
