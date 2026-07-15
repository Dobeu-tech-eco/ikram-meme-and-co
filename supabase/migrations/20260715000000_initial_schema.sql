create type fulfillment_type as enum ('original','edition','pod');
create type product_status as enum ('draft','available','reserved','sold','archived');
create type order_status as enum ('pending','paid','failed','refunded','fulfilled');

create table artists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  bio_en text,
  bio_ar text,
  photo_url text,
  instagram text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  artist_id uuid not null references artists(id),
  title_en text not null,
  title_ar text not null,
  description_en text,
  description_ar text,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'usd',
  fulfillment_type fulfillment_type not null default 'original',
  status product_status not null default 'draft',
  quantity integer not null default 1 check (quantity >= 0),
  reserved_until timestamptz,
  images jsonb not null default '[]',
  created_at timestamptz not null default now(),
  constraint originals_qty_one check (fulfillment_type <> 'original' or quantity <= 1)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status order_status not null default 'pending',
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent_id text,
  amount_total_cents integer not null default 0,
  currency text not null default 'usd',
  shipping_name text,
  shipping_address jsonb,
  tracking_number text,
  carrier text,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  title_en text not null,
  price_cents integer not null,
  quantity integer not null default 1
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  locale text not null default 'en',
  created_at timestamptz not null default now()
);

-- Race-guard functions -------------------------------------------------

create or replace function reserve_original(p_id uuid, p_minutes integer default 35)
returns boolean language plpgsql security definer as $$
begin
  update products
     set status = 'reserved',
         reserved_until = now() + make_interval(mins => p_minutes)
   where id = p_id and status = 'available' and fulfillment_type = 'original';
  return found;
end; $$;

create or replace function release_original(p_id uuid)
returns void language plpgsql security definer as $$
begin
  update products set status = 'available', reserved_until = null
   where id = p_id and status = 'reserved';
end; $$;

create or replace function mark_sold(p_id uuid)
returns void language plpgsql security definer as $$
begin
  update products set status = 'sold', reserved_until = null, quantity = 0
   where id = p_id;
end; $$;

create or replace function decrement_edition(p_id uuid)
returns boolean language plpgsql security definer as $$
begin
  update products set quantity = quantity - 1
   where id = p_id and fulfillment_type = 'edition' and quantity > 0;
  if not found then return false; end if;
  update products set status = 'sold'
   where id = p_id and quantity = 0;
  return true;
end; $$;

revoke execute on function reserve_original(uuid, integer) from public, anon, authenticated;
revoke execute on function release_original(uuid) from public, anon, authenticated;
revoke execute on function mark_sold(uuid) from public, anon, authenticated;
revoke execute on function decrement_edition(uuid) from public, anon, authenticated;

grant execute on function reserve_original(uuid, integer) to service_role;
grant execute on function release_original(uuid) to service_role;
grant execute on function mark_sold(uuid) to service_role;
grant execute on function decrement_edition(uuid) to service_role;

-- RLS -------------------------------------------------------------------

alter table artists enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscribers enable row level security;

create policy "public read artists" on artists for select using (true);
create policy "public read live products" on products for select using (status <> 'draft');
-- orders, order_items, subscribers: no anon policies; service-role only.

-- Baseline table grants ---------------------------------------------------
-- Explicit grants so the migration is portable to hosted projects regardless
-- of auto-expose provisioning defaults. RLS remains the row gate on top.
grant usage on schema public to anon, authenticated, service_role;
grant select on artists, products to anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
