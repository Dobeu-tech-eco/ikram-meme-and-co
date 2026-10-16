-- Local proof for the Stripe webhook migrations. Not a production migration.
--
--   sudo -u postgres psql -d stripe_webhook_proof -v ON_ERROR_STOP=1 \
--     -f supabase/tests/stripe_webhook_hardening.sql
--
-- Builds the tables the webhook touches, applies the branch's stripe_events
-- migration, proves service_role cannot write that table yet, then applies
-- the hardening migration twice and exercises grants, stale claims, and
-- idempotent inventory. The transaction rolls back.

\set ON_ERROR_STOP on
begin;

create type fulfillment_type as enum ('original','edition','pod');
create type product_status as enum ('draft','available','reserved','sold','archived');
create type order_status as enum ('pending','paid','failed','refunded','fulfilled');

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;

create table artists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  artist_id uuid not null references artists(id),
  title_en text not null,
  title_ar text not null,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'usd',
  fulfillment_type fulfillment_type not null default 'original',
  status product_status not null default 'draft',
  quantity integer not null default 1 check (quantity >= 0),
  reserved_until timestamptz,
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

grant all on artists, products, orders, order_items to service_role;

\ir ../migrations/20260725000000_stripe_events_idempotency.sql

set role service_role;
do $$
begin
  begin
    insert into public.stripe_events (event_id) values ('evt_before_grant');
    raise exception 'expected permission denied before the service_role grant';
  exception
    when insufficient_privilege then
      null;
  end;
end $$;
reset role;

-- Rows and orders that already exist when hardening is applied.
insert into public.stripe_events (event_id) values ('evt_legacy');

insert into artists (slug, name_en, name_ar) values ('artist', 'Artist', 'فنان');
insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity)
select 'dup-product', id, 'Dup', 'مكرر', 1000, 'pod', 'available', 1 from artists where slug = 'artist';
insert into orders (email, status, stripe_checkout_session_id)
values
  ('old@example.com', 'paid', 'cs_historical'),
  ('pending@example.com', 'pending', 'cs_pending'),
  ('dup@example.com', 'paid', 'cs_dup_items');
insert into order_items (order_id, product_id, title_en, price_cents)
select o.id, p.id, 'Dup', 1000
  from orders o
  join products p on p.slug = 'dup-product'
 where o.stripe_checkout_session_id = 'cs_dup_items';
insert into order_items (order_id, product_id, title_en, price_cents)
select o.id, p.id, 'Dup again', 1000
  from orders o
  join products p on p.slug = 'dup-product'
 where o.stripe_checkout_session_id = 'cs_dup_items';

\ir ../migrations/20261016000000_stripe_webhook_hardening.sql
\ir ../migrations/20261016000000_stripe_webhook_hardening.sql

do $$
declare
  v_status text;
  v_processed timestamptz;
  v_applied boolean;
  v_notified timestamptz;
  v_items integer;
begin
  select status, processed_at into v_status, v_processed
    from public.stripe_events where event_id = 'evt_legacy';
  if v_status <> 'processed' or v_processed is null then
    raise exception 'legacy claim was not marked processed (status %)', v_status;
  end if;

  select inventory_applied, notified_at into v_applied, v_notified
    from public.orders where stripe_checkout_session_id = 'cs_historical';
  if v_applied is not true or v_notified is null then
    raise exception 'historical paid order was not backfilled';
  end if;

  select inventory_applied, notified_at into v_applied, v_notified
    from public.orders where stripe_checkout_session_id = 'cs_pending';
  if v_applied is true or v_notified is not null then
    raise exception 'pending order was backfilled';
  end if;

  select count(*) into v_items
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
   where o.stripe_checkout_session_id = 'cs_dup_items';
  if v_items <> 1 then
    raise exception 'duplicate order items were not collapsed, count %', v_items;
  end if;
end $$;

set role anon;
do $$
begin
  begin
    perform public.claim_stripe_event('evt_anon', interval '5 minutes');
    raise exception 'anon was able to claim a stripe event';
  exception
    when insufficient_privilege then
      null;
  end;
end $$;
reset role;

set role service_role;

insert into public.stripe_events (event_id) values ('evt_direct_grant');
delete from public.stripe_events where event_id = 'evt_direct_grant';

do $$
declare
  v text;
  v_claimed timestamptz;
  v_qty integer;
  v_status product_status;
  v_hold_cleared boolean;
  v_applied boolean;
  v_notified timestamptz;
  v_artist uuid;
  v_edition uuid;
  v_original uuid;
  v_pod uuid;
  v_order uuid;
  v_items integer;
begin
  v := public.claim_stripe_event('evt_legacy', interval '5 minutes');
  if v <> 'duplicate' then
    raise exception 'legacy event was not a duplicate, got %', v;
  end if;

  v := public.claim_stripe_event('evt_new', interval '5 minutes');
  if v <> 'claimed' then
    raise exception 'expected claimed, got %', v;
  end if;

  v := public.claim_stripe_event('evt_new', interval '5 minutes');
  if v <> 'in_progress' then
    raise exception 'expected in_progress, got %', v;
  end if;

  perform public.complete_stripe_event('evt_new');
  perform public.complete_stripe_event('evt_new');
  v := public.claim_stripe_event('evt_new', interval '5 minutes');
  if v <> 'duplicate' then
    raise exception 'expected duplicate, got %', v;
  end if;

  v := public.claim_stripe_event('evt_fail', interval '5 minutes');
  if v <> 'claimed' then
    raise exception 'expected claimed for evt_fail, got %', v;
  end if;
  perform public.release_stripe_event('evt_fail');
  v := public.claim_stripe_event('evt_fail', interval '5 minutes');
  if v <> 'reclaimed' then
    raise exception 'expected immediate reclaim after release, got %', v;
  end if;

  insert into public.stripe_events (event_id, status, claimed_at)
  values ('evt_stale', 'processing', now() - interval '6 minutes');
  v := public.claim_stripe_event('evt_stale', interval '5 minutes');
  if v <> 'reclaimed' then
    raise exception 'expected stale reclaim, got %', v;
  end if;
  select claimed_at into v_claimed from public.stripe_events where event_id = 'evt_stale';
  if v_claimed < now() - interval '1 minute' then
    raise exception 'stale reclaim did not refresh claimed_at';
  end if;
  v := public.claim_stripe_event('evt_stale', interval '5 minutes');
  if v <> 'in_progress' then
    raise exception 'expected in_progress after stale reclaim, got %', v;
  end if;

  insert into public.stripe_events (event_id, status, claimed_at)
  values ('evt_fresh', 'processing', now() - interval '1 minute');
  v := public.claim_stripe_event('evt_fresh', interval '5 minutes');
  if v <> 'in_progress' then
    raise exception 'fresh processing claim was not held, got %', v;
  end if;

  select id into v_artist from artists where slug = 'artist';

  insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity)
  values ('edition', v_artist, 'Edition', 'طبعة', 1000, 'edition', 'available', 2)
  returning id into v_edition;
  insert into orders (email, status, stripe_checkout_session_id, inventory_applied)
  values ('buyer@example.com', 'paid', 'cs_edition', false)
  returning id into v_order;

  if public.apply_checkout_inventory(v_order, v_edition) <> 'applied' then
    raise exception 'expected first inventory apply to apply';
  end if;
  select quantity, status into v_qty, v_status from products where id = v_edition;
  if v_qty <> 1 or v_status <> 'available' then
    raise exception 'edition decrement mismatch: qty % status %', v_qty, v_status;
  end if;
  if public.apply_checkout_inventory(v_order, v_edition) <> 'already_applied' then
    raise exception 'expected second inventory apply to no-op';
  end if;
  select quantity into v_qty from products where id = v_edition;
  if v_qty <> 1 then
    raise exception 'replay decremented edition stock to %', v_qty;
  end if;

  insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity)
  values ('last-edition', v_artist, 'Last', 'أخير', 1000, 'edition', 'available', 1)
  returning id into v_edition;
  insert into orders (email, status, stripe_checkout_session_id, inventory_applied)
  values ('buyer@example.com', 'paid', 'cs_last', false)
  returning id into v_order;
  perform public.apply_checkout_inventory(v_order, v_edition);
  select quantity, status into v_qty, v_status from products where id = v_edition;
  if v_qty <> 0 or v_status <> 'sold' then
    raise exception 'last edition should be sold, got qty % status %', v_qty, v_status;
  end if;

  insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity, reserved_until)
  values ('original', v_artist, 'Original', 'أصلي', 2000, 'original', 'reserved', 1, now())
  returning id into v_original;
  insert into orders (email, status, stripe_checkout_session_id, inventory_applied)
  values ('buyer@example.com', 'paid', 'cs_original', false)
  returning id into v_order;
  if public.apply_checkout_inventory(v_order, v_original) <> 'applied' then
    raise exception 'expected original inventory to apply';
  end if;
  select quantity, status, reserved_until is null
    into v_qty, v_status, v_hold_cleared
    from products where id = v_original;
  if v_qty <> 0 or v_status <> 'sold' or v_hold_cleared is not true then
    raise exception 'original was not marked sold';
  end if;
  if public.apply_checkout_inventory(v_order, v_original) <> 'already_applied' then
    raise exception 'original replay was not a no-op';
  end if;

  insert into products (slug, artist_id, title_en, title_ar, price_cents, fulfillment_type, status, quantity)
  values ('pod', v_artist, 'Pod', 'طباعة', 1500, 'pod', 'available', 1)
  returning id into v_pod;
  insert into orders (email, status, stripe_checkout_session_id, inventory_applied)
  values ('buyer@example.com', 'paid', 'cs_pod', false)
  returning id into v_order;
  if public.apply_checkout_inventory(v_order, v_pod) <> 'applied' then
    raise exception 'expected pod inventory claim';
  end if;
  select quantity into v_qty from products where id = v_pod;
  if v_qty <> 1 then
    raise exception 'pod quantity changed to %', v_qty;
  end if;

  insert into orders (email, status, stripe_checkout_session_id, inventory_applied)
  values ('buyer@example.com', 'paid', 'cs_missing_product', false)
  returning id into v_order;
  if public.apply_checkout_inventory(v_order, gen_random_uuid()) <> 'product_missing' then
    raise exception 'expected product_missing';
  end if;
  select inventory_applied into v_applied from orders where id = v_order;
  if v_applied then
    raise exception 'product_missing flipped inventory_applied';
  end if;
  if public.apply_checkout_inventory(gen_random_uuid(), v_pod) <> 'order_missing' then
    raise exception 'expected order_missing';
  end if;

  insert into order_items (order_id, product_id, title_en, price_cents)
  values (v_order, v_pod, 'Pod', 1500);
  insert into order_items (order_id, product_id, title_en, price_cents)
  values (v_order, v_pod, 'Pod', 1500)
  on conflict (order_id, product_id) do nothing;
  select count(*) into v_items from order_items where order_id = v_order and product_id = v_pod;
  if v_items <> 1 then
    raise exception 'order item replay inserted % rows', v_items;
  end if;

  if public.claim_order_notification(v_order) is not true then
    raise exception 'expected to claim notification';
  end if;
  select notified_at into v_notified from orders where id = v_order;
  if v_notified is null then
    raise exception 'notification claim did not set notified_at';
  end if;
  if public.claim_order_notification(v_order) is not false then
    raise exception 'notification replay was not a no-op';
  end if;
  update orders set notified_at = null where id = v_order;
  if public.claim_order_notification(v_order) is not true then
    raise exception 'expected notification reclaim after reset';
  end if;
end $$;

reset role;
select 'stripe webhook hardening ok' as result;
rollback;
