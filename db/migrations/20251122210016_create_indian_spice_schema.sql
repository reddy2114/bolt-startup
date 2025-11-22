/*
  # Indian Spice Grocery Store Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, not null)
      - `full_name` (text)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `pincode` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `slug` (text, unique)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `category_id` (uuid, references categories)
      - `name` (text, not null)
      - `description` (text)
      - `price` (numeric, not null)
      - `original_price` (numeric)
      - `image_url` (text)
      - `stock` (integer, default 0)
      - `unit` (text, e.g., "kg", "pc", "lb")
      - `rating` (numeric, default 0)
      - `review_count` (integer, default 0)
      - `is_featured` (boolean, default false)
      - `is_available` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `quantity` (integer, not null, default 1)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `order_number` (text, unique, not null)
      - `status` (text, default 'pending')
      - `total_amount` (numeric, not null)
      - `shipping_address` (text, not null)
      - `payment_method` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer, not null)
      - `price` (numeric, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to products and categories
    - Add restrictive policies for cart, orders, and profiles

  3. Important Notes
    - All monetary values stored as numeric for precision
    - Order numbers are auto-generated unique identifiers
    - Cart items are user-specific and require authentication
    - Products can be marked as featured for homepage display
    - Stock tracking included for inventory management
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  pincode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  original_price numeric CHECK (original_price >= 0),
  image_url text,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  unit text DEFAULT 'pc',
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0 CHECK (review_count >= 0),
  is_featured boolean DEFAULT false,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO public
  USING (is_available = true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  shipping_address text NOT NULL,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Spices & Masalas', 'spices-masalas', 'Authentic Indian spices and masala blends', 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg'),
  ('Rice & Grains', 'rice-grains', 'Premium quality rice and grains', 'https://images.pexels.com/photos/4022090/pexels-photo-4022090.jpeg'),
  ('Lentils & Pulses', 'lentils-pulses', 'Fresh dal and pulses', 'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg'),
  ('Snacks & Namkeen', 'snacks-namkeen', 'Traditional Indian snacks', 'https://images.pexels.com/photos/1893559/pexels-photo-1893559.jpeg'),
  ('Oils & Ghee', 'oils-ghee', 'Pure cooking oils and ghee', 'https://images.pexels.com/photos/4198170/pexels-photo-4198170.jpeg'),
  ('Fresh Vegetables', 'vegetables', 'Farm fresh vegetables', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Turmeric Powder (Haldi)',
  'Pure and premium quality turmeric powder',
  120,
  150,
  'https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg',
  100,
  '500g',
  4.5,
  342,
  true,
  true
FROM categories c WHERE c.slug = 'spices-masalas'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Red Chilli Powder',
  'Hot and spicy red chilli powder',
  100,
  120,
  'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg',
  150,
  '500g',
  4.3,
  289,
  true,
  true
FROM categories c WHERE c.slug = 'spices-masalas'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Garam Masala',
  'Authentic blend of aromatic spices',
  180,
  220,
  'https://images.pexels.com/photos/4198170/pexels-photo-4198170.jpeg',
  80,
  '100g',
  4.7,
  456,
  true,
  true
FROM categories c WHERE c.slug = 'spices-masalas'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Basmati Rice',
  'Premium aged basmati rice',
  850,
  1000,
  'https://images.pexels.com/photos/7456991/pexels-photo-7456991.jpeg',
  200,
  '5kg',
  4.8,
  1234,
  true,
  true
FROM categories c WHERE c.slug = 'rice-grains'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Toor Dal',
  'High quality pigeon peas',
  140,
  160,
  'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg',
  120,
  '1kg',
  4.4,
  567,
  false,
  true
FROM categories c WHERE c.slug = 'lentils-pulses'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Moong Dal',
  'Fresh split green gram',
  160,
  180,
  'https://images.pexels.com/photos/4750274/pexels-photo-4750274.jpeg',
  100,
  '1kg',
  4.5,
  432,
  false,
  true
FROM categories c WHERE c.slug = 'lentils-pulses'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Chakli Mix',
  'Crispy traditional chakli',
  80,
  100,
  'https://images.pexels.com/photos/1893559/pexels-photo-1893559.jpeg',
  60,
  '200g',
  4.2,
  234,
  false,
  true
FROM categories c WHERE c.slug = 'snacks-namkeen'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Pure Desi Ghee',
  '100% pure cow ghee',
  650,
  750,
  'https://images.pexels.com/photos/6489416/pexels-photo-6489416.jpeg',
  50,
  '1L',
  4.9,
  892,
  true,
  true
FROM categories c WHERE c.slug = 'oils-ghee'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Mustard Oil',
  'Cold pressed mustard oil',
  220,
  250,
  'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg',
  90,
  '1L',
  4.3,
  321,
  false,
  true
FROM categories c WHERE c.slug = 'oils-ghee'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Fresh Tomatoes',
  'Farm fresh red tomatoes',
  40,
  50,
  'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
  300,
  '1kg',
  4.1,
  678,
  false,
  true
FROM categories c WHERE c.slug = 'vegetables'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Fresh Onions',
  'Quality red onions',
  30,
  40,
  'https://images.pexels.com/photos/543509/pexels-photo-543509.jpeg',
  350,
  '1kg',
  4.0,
  543,
  false,
  true
FROM categories c WHERE c.slug = 'vegetables'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, original_price, image_url, stock, unit, rating, review_count, is_featured, is_available)
SELECT 
  c.id,
  'Green Chillies',
  'Fresh spicy green chillies',
  20,
  25,
  'https://images.pexels.com/photos/7456983/pexels-photo-7456983.jpeg',
  200,
  '250g',
  4.2,
  234,
  false,
  true
FROM categories c WHERE c.slug = 'vegetables'
ON CONFLICT DO NOTHING;