-- Включить расширения, если еще не включены
create extension if not exists "uuid-ossp";

-- 1. Таблица профилей пользователей
-- Создается автоматически или вручную, связана с auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  currency text default 'RUB',
  theme text default 'dark',
  monthly_budget numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включить RLS для профилей
alter table public.profiles enable row level security;

create policy "Пользователи могут смотреть свой профиль"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Пользователи могут обновлять свой профиль"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Пользователи могут создавать свой профиль"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- 2. Таблица транзакций
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id text not null, -- ID категории (храним как строку для гибкости или связываем с таблицей категорий)
  amount numeric not null,
  currency text default 'RUB',
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  description text,
  type text check (type in ('income', 'expense')) not null,
  synced boolean default true, -- Служебное поле
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Индексы для ускорения работы
create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_date_idx on public.transactions (date);

-- Включить RLS для транзакций
alter table public.transactions enable row level security;

create policy "Пользователи видят только свои транзакции"
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Пользователи могут добавлять свои транзакции"
  on public.transactions for insert
  with check ( auth.uid() = user_id );

create policy "Пользователи могут обновлять свои транзакции"
  on public.transactions for update
  using ( auth.uid() = user_id );

create policy "Пользователи могут удалять свои транзакции"
  on public.transactions for delete
  using ( auth.uid() = user_id );

-- 3. Триггер для автоматического создания профиля при регистрации (Опционально, но рекомендуется)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, currency)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'RUB');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
