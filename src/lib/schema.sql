-- ================================================
-- VEYRA Database Schema
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES (extends Supabase auth.users) ──────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  email text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'seller', 'admin')),
  phone text,
  address jsonb,
  bio text,
  is_verified boolean default false,
  is_suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── SELLER STORES ────────────────────────────────────────────────
create table stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade,
  store_name text not null,
  store_slug text unique not null,
  description text,
  logo_url text,
  banner_url text,
  category text,
  is_verified boolean default false,
  is_active boolean default true,
  total_sales integer default 0,
  rating numeric(3,2) default 0,
  follower_count integer default 0,
  created_at timestamptz default now()
);

-- ── CATEGORIES ──────────────────────────────────────────────────
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null,
  icon text,
  image_url text,
  product_count integer default 0
);

insert into categories (name, slug, icon) values
  ('Streetwear', 'streetwear', '🧢'),
  ('Luxury', 'luxury', '✦'),
  ('Sneakers', 'sneakers', '👟'),
  ('Native Wear', 'native-wear', '👘'),
  ('Hoodies', 'hoodies', '🧥'),
  ('Women', 'women', '👗'),
  ('Accessories', 'accessories', '💍'),
  ('Bags', 'bags', '👜');

-- ── PRODUCTS ────────────────────────────────────────────────────
create table products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references stores(id) on delete cascade,
  seller_id uuid references profiles(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  description text,
  ai_description text,
  price numeric(12,2) not null,
  compare_price numeric(12,2),
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  stock integer default 0,
  sku text,
  tags text[] default '{}',
  is_active boolean default true,
  is_featured boolean default false,
  is_approved boolean default false,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  sold_count integer default 0,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ORDERS ──────────────────────────────────────────────────────
create table orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_id uuid references profiles(id),
  status text default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text,
  payment_reference text,
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) default 0,
  discount numeric(12,2) default 0,
  total numeric(12,2) not null,
  shipping_address jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ORDER ITEMS ──────────────────────────────────────────────────
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  store_id uuid references stores(id),
  quantity integer not null,
  size text,
  color text,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) not null
);

-- ── REVIEWS ─────────────────────────────────────────────────────
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  customer_id uuid references profiles(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  images text[] default '{}',
  is_verified_purchase boolean default false,
  created_at timestamptz default now()
);

-- ── WISHLISTS ────────────────────────────────────────────────────
create table wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ── CART ────────────────────────────────────────────────────────
create table cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity integer default 1,
  size text,
  color text,
  created_at timestamptz default now()
);

-- ── AI RECOMMENDATIONS ──────────────────────────────────────────
create table ai_recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  prompt text not null,
  recommendations jsonb,
  session_id text,
  created_at timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────────
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ── PAYOUTS ─────────────────────────────────────────────────────
create table payouts (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id),
  store_id uuid references stores(id),
  amount numeric(12,2) not null,
  status text default 'pending' check (status in ('pending','processing','paid','failed')),
  payment_method text,
  account_details jsonb,
  reference text,
  created_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────
alter table profiles enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;
alter table cart_items enable row level security;
alter table notifications enable row level security;

-- Profiles: users can read all, edit own
create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Products: anyone can view approved, sellers manage own
create policy "Anyone can view approved products" on products for select using (is_approved = true and is_active = true);
create policy "Sellers can manage own products" on products for all using (auth.uid() = seller_id);

-- Stores: public view, owner manages
create policy "Anyone can view active stores" on stores for select using (is_active = true);
create policy "Owners can manage own stores" on stores for all using (auth.uid() = owner_id);

-- Orders: customers and sellers see relevant orders
create policy "Customers see own orders" on orders for select using (auth.uid() = customer_id);
create policy "Customers create orders" on orders for insert with check (auth.uid() = customer_id);

-- Cart: users manage own cart
create policy "Users manage own cart" on cart_items for all using (auth.uid() = user_id);

-- Wishlists: users manage own
create policy "Users manage own wishlist" on wishlists for all using (auth.uid() = user_id);

-- Reviews: public view, auth users create
create policy "Anyone can view reviews" on reviews for select using (true);
create policy "Auth users can review" on reviews for insert with check (auth.uid() = customer_id);

-- Notifications: users see own
create policy "Users see own notifications" on notifications for all using (auth.uid() = user_id);

-- ── FUNCTIONS ───────────────────────────────────────────────────
-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Generate order number
create or replace function generate_order_number()
returns text as $$
begin
  return 'VYR-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));
end;
$$ language plpgsql;
