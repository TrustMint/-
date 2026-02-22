-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  currency text default 'RUB',
  theme text default 'dark',
  avatar_url text,
  monthly_limit numeric default 50000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Trigger for new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, currency, monthly_limit)
  values (new.id, new.email, split_part(new.email, '@', 1), 'RUB', 50000);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Categories Table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text not null,
  color text not null,
  type text check (type in ('income', 'expense', 'both')) not null,
  user_id uuid references auth.users on delete cascade,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists categories_default_name_type_idx on public.categories (name, type) where is_default = true;

alter table public.categories enable row level security;

drop policy if exists "Users can view their categories and defaults" on public.categories;
create policy "Users can view their categories and defaults" on public.categories for select 
using (auth.uid() = user_id or is_default = true);

drop policy if exists "Users can insert their own categories" on public.categories;
create policy "Users can insert their own categories" on public.categories for insert 
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories" on public.categories for update 
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories" on public.categories for delete 
using (auth.uid() = user_id);

-- Insert Default Categories
INSERT INTO public.categories (name, icon, color, type, is_default) VALUES
('Продукты', 'shopping-cart', '#FF9F0A', 'expense', true),
('Транспорт', 'car', '#0A84FF', 'expense', true),
('Жилье', 'home', '#BF5AF2', 'expense', true),
('Кафе', 'coffee', '#FF453A', 'expense', true),
('Здоровье', 'heart', '#FF375F', 'expense', true),
('Одежда', 'shopping-bag', '#5E5CE6', 'expense', true),
('Связь', 'smartphone', '#64D2FF', 'expense', true),
('Спорт', 'activity', '#30D158', 'expense', true),
('Авто', 'tool', '#AC8E68', 'expense', true),
('Питомцы', 'github', '#E0A800', 'expense', true),
('Образование', 'book', '#FF9500', 'expense', true),
('Подарки', 'gift', '#FF2D55', 'expense', true),
('Путешествия', 'map', '#40C8E0', 'expense', true),
('Красота', 'sun', '#D188CF', 'expense', true),
('Техника', 'monitor', '#8E8E93', 'expense', true),
('Развлечения', 'music', '#FF2D55', 'expense', true),
('Семья', 'user', '#BF5AF2', 'expense', true),
('Подписки', 'credit-card', '#5E5CE6', 'expense', true),
('Разное', 'list', '#8E8E93', 'expense', true),
('Зарплата', 'briefcase', '#32D74B', 'income', true),
('Фриланс', 'laptop', '#64D2FF', 'income', true),
('Инвестиции', 'trending-up', '#30B0C7', 'income', true),
('Подарки', 'gift', '#FFD60A', 'income', true),
('Кэшбэк', 'percent', '#FF9F0A', 'income', true),
('Бизнес', 'briefcase', '#BF5AF2', 'income', true),
('Аренда', 'home', '#0A84FF', 'income', true),
('Продажа', 'tag', '#FF375F', 'income', true),
('Пособия', 'shield', '#5E5CE6', 'income', true),
('Разное', 'list', '#8E8E93', 'income', true)
ON CONFLICT (name, type) WHERE is_default = true DO NOTHING;

-- 3. Transactions Table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id text not null,
  amount numeric not null,
  currency text default 'RUB',
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  description text,
  type text check (type in ('income', 'expense')) not null,
  synced boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_date_idx on public.transactions (date);

alter table public.transactions enable row level security;

drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own transactions" on public.transactions;
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own transactions" on public.transactions;
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- 4. Storage for Avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar." on storage.objects for insert with check (bucket_id = 'avatars');

drop policy if exists "Anyone can update an avatar." on storage.objects;
create policy "Anyone can update an avatar." on storage.objects for update with check (bucket_id = 'avatars');
