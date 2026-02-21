-- Consolidated Migration File for FinTrack PWA
-- Includes Profiles, Categories, Transactions, and Storage setup

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  currency text DEFAULT 'RUB',
  theme text DEFAULT 'dark',
  avatar_url text,
  monthly_limit numeric DEFAULT 50000,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. CATEGORIES
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

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and default categories" ON categories
  FOR SELECT USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- 3. TRANSACTIONS (Added based on store.tsx usage)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'RUB',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date timestamptz DEFAULT now(),
  title text,
  description text,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  synced boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- 4. STORAGE (Avatars)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 5. SEED DATA (Default Categories)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Продукты', 'shopping-cart', '#FF9F0A', 'expense', true),
('Транспорт', 'car', '#0A84FF', 'expense', true),
('Жилье', 'home', '#BF5AF2', 'expense', true),
('Кафе', 'coffee', '#FF453A', 'expense', true),
('Здоровье', 'heart', '#FF375F', 'expense', true),
('Одежда', 'shopping-bag', '#5E5CE6', 'expense', true),
('Связь', 'smartphone', '#64D2FF', 'expense', true),
('Спорт', 'activity', '#30D158', 'expense', true),
('Авто', 'tool', '#AC8E68', 'expense', true),
('Питомцы', 'github', '#FFD60A', 'expense', true),
('Образование', 'book', '#FF9F0A', 'expense', true),
('Подарки', 'gift', '#FF2D55', 'expense', true),
('Путешествия', 'map', '#0A84FF', 'expense', true),
('Красота', 'sun', '#BF5AF2', 'expense', true),
('Техника', 'monitor', '#64D2FF', 'expense', true),
('Зарплата', 'briefcase', '#30D158', 'income', true),
('Фриланс', 'laptop', '#64D2FF', 'income', true),
('Инвестиции', 'trending-up', '#30D158', 'income', true),
('Кэшбэк', 'percent', '#FF9F0A', 'income', true)
ON CONFLICT DO NOTHING;
