-- 1. Update profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS monthly_limit numeric DEFAULT 50000;

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. Security policies for categories
CREATE POLICY "Users can view own and default categories" ON categories
  FOR SELECT USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Storage setup for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 6. Seed default categories
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Продукты', 'shopping-cart', '#FF9F0A', 'expense', true),
('Транспорт', 'car', '#0A84FF', 'expense', true),
('Дом', 'home', '#BF5AF2', 'expense', true),
('Зарплата', 'briefcase', '#30D158', 'income', true),
('Развлечения', 'film', '#FF375F', 'expense', true),
('Здоровье', 'heart', '#FF453A', 'expense', true),
('Подарки', 'gift', '#AC8E68', 'both', true),
('Образование', 'book', '#64D2FF', 'expense', true)
ON CONFLICT DO NOTHING;
