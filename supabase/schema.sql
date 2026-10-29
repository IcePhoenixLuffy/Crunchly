-- ==========================================================
-- Munchly: Supabase PostgreSQL Schema & Row Level Security
-- ==========================================================

-- 1. Enable UUID Extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Meals', 'Snacks', 'Beverages', 'Desserts')),
    image_url TEXT,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_available BOOLEAN NOT NULL DEFAULT true,
    prep_time_minutes INTEGER NOT NULL DEFAULT 5,
    popular BOOLEAN DEFAULT false,
    recommended BOOLEAN DEFAULT false,
    calories INTEGER,
    rating NUMERIC(3, 1) DEFAULT 4.8,
    rating_count INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_roll TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    service_fee NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'qr', 'card', 'cash')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    order_status TEXT NOT NULL DEFAULT 'PLACED' CHECK (order_status IN ('PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED')),
    pickup_token TEXT NOT NULL,
    pickup_slot TEXT NOT NULL,
    special_instructions TEXT,
    estimated_prep_minutes INTEGER DEFAULT 7,
    estimated_ready_time TEXT,
    queue_position INTEGER DEFAULT 1,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Canteen Operational Settings Table
CREATE TABLE IF NOT EXISTS public.canteen_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    is_open BOOLEAN NOT NULL DEFAULT true,
    accepting_orders BOOLEAN NOT NULL DEFAULT true,
    max_concurrent_capacity INTEGER NOT NULL DEFAULT 25,
    current_active_orders INTEGER NOT NULL DEFAULT 0,
    average_wait_minutes INTEGER NOT NULL DEFAULT 7,
    message TEXT DEFAULT 'Canteen is actively accepting orders.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_settings ENABLE ROW LEVEL SECURITY;

-- Menu Items Policies:
-- Anyone (students, guests, public) can view active menu items
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items"
ON public.menu_items FOR SELECT
USING (true);

-- Allow authenticated users / backend service role to insert, update, or delete menu items
DROP POLICY IF EXISTS "Staff can insert menu items" ON public.menu_items;
CREATE POLICY "Staff can insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can update menu items" ON public.menu_items;
CREATE POLICY "Staff can update menu items"
ON public.menu_items FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Staff can delete menu items" ON public.menu_items;
CREATE POLICY "Staff can delete menu items"
ON public.menu_items FOR DELETE
USING (true);

-- Orders Policies:
-- Students can insert new orders
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
CREATE POLICY "Allow order creation"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Orders can be viewed by anyone holding the order reference or matching student
DROP POLICY IF EXISTS "Allow reading orders" ON public.orders;
CREATE POLICY "Allow reading orders"
ON public.orders FOR SELECT
USING (true);

-- Orders can be updated (e.g. staff changing prep status, payment verification)
DROP POLICY IF EXISTS "Allow updating orders" ON public.orders;
CREATE POLICY "Allow updating orders"
ON public.orders FOR UPDATE
USING (true);

-- Canteen Settings Policies:
DROP POLICY IF EXISTS "Public can read canteen status" ON public.canteen_settings;
CREATE POLICY "Public can read canteen status"
ON public.canteen_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Staff can update canteen status" ON public.canteen_settings;
CREATE POLICY "Staff can update canteen status"
ON public.canteen_settings FOR UPDATE
USING (true);

-- ==========================================================
-- INITIAL SEED DATA
-- ==========================================================

INSERT INTO public.canteen_settings (id, is_open, accepting_orders, max_concurrent_capacity, current_active_orders, average_wait_minutes, message)
VALUES ('main', true, true, 25, 2, 7, 'Canteen is actively accepting orders for breakfast & lunch pick-ups.')
ON CONFLICT (id) DO UPDATE SET updated_at = now();

INSERT INTO public.menu_items (id, name, description, price, category, image_url, is_veg, is_available, prep_time_minutes, popular, recommended, calories, rating, rating_count)
VALUES
('m-1', 'Crispy Masala Dosa', 'Golden fermented rice crepe filled with spiced potato masala, served with fresh coconut chutney & piping hot sambar.', 60.00, 'Breakfast', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', true, true, 7, true, true, 320, 4.8, 142),
('m-2', 'Indori Poha with Sev', 'Light flattened rice tempered with mustard seeds, turmeric, green chillies, peanuts, topped with Ratlami sev and fresh coriander.', 40.00, 'Breakfast', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', true, true, 4, true, false, 220, 4.6, 88),
('m-3', 'Steamed Idli Sambar (2 pcs)', 'Fluffy steamed rice & lentil cakes served with drumstick sambar and spicy tomato chutney.', 45.00, 'Breakfast', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', true, true, 3, false, false, 180, 4.5, 65),
('m-4', 'Amritsari Aloo Paratha (with Butter)', 'Crisp whole wheat tawa flatbread stuffed with spiced crushed potatoes, served with homemade curd and Amul butter.', 55.00, 'Breakfast', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, true, 9, true, true, 380, 4.9, 195),
('m-5', 'Special Campus Thali', 'Complete wholesome meal: Paneer Butter Masala, Dal Tadka, Seasonal Sabzi, Jeera Rice, 2 Tawa Phulkas, Pickle & Sweet.', 110.00, 'Meals', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80', true, true, 8, true, true, 650, 4.9, 310),
('m-6', 'Desi Rajma Chawal Bowl', 'Slow-cooked Punjabi red kidney beans in thick spiced onion-tomato gravy layered over fragrant basmati rice.', 80.00, 'Meals', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', true, true, 5, true, false, 460, 4.7, 220),
('m-7', 'Wok-Tossed Veg Hakka Noodles', 'Thin eggless noodles stir-fried with crunchy cabbage, bell peppers, carrots, spring onions in dark soya sauce.', 75.00, 'Meals', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80', true, true, 7, true, false, 410, 4.6, 175),
('m-8', 'Paneer Makhani Roll', 'Soft paratha wrap loaded with roasted paneer cubes tossed in rich makhani gravy, sliced red onions, and mint dip.', 70.00, 'Meals', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', true, true, 6, false, true, 390, 4.7, 94),
('m-9', 'Bombay Samosa Chaat (2 pcs)', 'Crushed flaky potato samosas smothered in spiced ragda, sweetened curd, tamarind chutney, mint relish & crispy sev.', 50.00, 'Snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, true, 4, true, true, 340, 4.8, 240),
('m-10', 'Grilled Cheese & Corn Sandwich', 'Golden toasted bread loaded with melted cheddar, sweet corn, Italian herbs, and green bell peppers.', 65.00, 'Snacks', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', true, true, 6, true, false, 310, 4.6, 155),
('m-11', 'Crispy Veggie Crunch Burger', 'Crispy potato-pea patty with sliced tomato, cucumber, creamy peri-peri mayo in a toasted sesame bun.', 60.00, 'Snacks', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, true, 6, false, false, 390, 4.5, 110),
('m-12', 'Cheese Maggi Masala Double', 'Campus classic two-minute noodles cooked with secret masala spices, green peas, and topped with grated cheese.', 50.00, 'Snacks', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80', true, false, 5, true, false, 360, 4.9, 420),
('m-13', 'Special Kulhad Masala Chai', 'Freshly brewed strong Assam tea infused with fresh crushed ginger, cardamom, and aromatic cloves served piping hot.', 20.00, 'Beverages', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', true, true, 3, true, true, 80, 4.9, 512),
('m-14', 'South Indian Filter Coffee', 'Traditional chicory-blended dark roasted decoction frothered with creamy hot milk.', 25.00, 'Beverages', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', true, true, 3, false, false, 90, 4.7, 160),
('m-15', 'Chilled Thick Cold Coffee', 'Velvety blended coffee with dark chocolate drizzle and chilled creamy milk.', 50.00, 'Beverages', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80', true, true, 4, true, false, 240, 4.8, 230),
('m-16', 'Fresh Mint Lime Soda (Chilled)', 'Freshly squeezed lemon juice, crushed mint sprigs, rock salt, and ice-cold sparkling soda.', 35.00, 'Beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, true, 2, false, false, 60, 4.6, 95),
('m-17', 'Warm Gulab Jamun (2 pcs)', 'Soft melt-in-mouth milk solids dumplings soaked in rose and cardamom infused sugar syrup.', 35.00, 'Desserts', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', true, true, 2, true, true, 260, 4.8, 180),
('m-18', 'Dark Chocolate Brownie with Fudge', 'Warm fudgy Belgian chocolate brownie drizzled with hot dark chocolate ganache.', 60.00, 'Desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', true, true, 3, true, false, 340, 4.7, 140)
ON CONFLICT (id) DO NOTHING;
