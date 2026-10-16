-- =============================================================================
-- Stripe webhook hardening (2026-10-16)
--
-- Follow-up to 20260725000000_stripe_events_idempotency.sql. That migration
-- is left unchanged so a database that already applied it does not hit a
-- checksum mismatch. This file is idempotent and safe to run after it.
--
-- 1. service_role grant. auto_expose_new_tables is unset, so new public
--    tables are not reachable by the Data API. The initial migration's
--    GRANT ALL ON ALL TABLES ran before stripe_events existed and is not
--    retroactive. Without the grant below, every claim fails with
--    permission denied and the webhook returns 500.
-- 2. Stale claims. A crash after the claim insert never reaches the
--    release path. status + claimed_at let a later delivery reclaim a
--    processing row older than 5 minutes. A clean handler failure sets
--    claimed_at to -infinity so the next retry reclaims immediately.
-- 3. Replay-safe side effects. order_items are unique per (order, product)
--    and upserted. Inventory and the customer email are each claimed once
--    inside a security-definer function, so a retry cannot double-decrement
--    stock or send a second receipt.
--
-- Deploy this migration before the webhook code that calls these functions.
-- =============================================================================

grant select, insert, update, delete on table public.stripe_events to service_role;

-- Add columns nullable first. A NOT NULL DEFAULT on existing rows would make
-- already-finished claims look like fresh 'processing' rows (constant
-- defaults are not rewritten into old tuples the way a later UPDATE is).
alter table public.stripe_events
  add column if not exists status text,
  add column if not exists claimed_at timestamptz,
  add column if not exists processed_at timestamptz;

-- Rows left by the previous claim-before-process code were deleted on
-- failure, so a row that exists at migration time was handled. Mark it
-- processed. Do not touch rows already given an explicit status.
update public.stripe_events
   set status = 'processed',
       claimed_at = coalesce(claimed_at, received_at),
       processed_at = coalesce(processed_at, received_at)
 where status is null;

alter table public.stripe_events
  alter column status set default 'processing',
  alter column status set not null,
  alter column claimed_at set default now(),
  alter column claimed_at set not null;

alter table public.stripe_events
  drop constraint if exists stripe_events_status_check;
alter table public.stripe_events
  add constraint stripe_events_status_check
  check (status in ('processing', 'processed'));

-- Claim / complete / release ------------------------------------------------

create or replace function public.claim_stripe_event(
  p_event_id text,
  p_stale_after interval default interval '5 minutes'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_claimed_at timestamptz;
begin
  if p_event_id is null or length(btrim(p_event_id)) = 0 then
    raise exception 'claim_stripe_event: event id is required';
  end if;
  if p_stale_after is null or p_stale_after <= interval '0' then
    raise exception 'claim_stripe_event: stale window must be positive';
  end if;

  insert into public.stripe_events as s (event_id, status, claimed_at)
  values (p_event_id, 'processing', now())
  on conflict (event_id) do nothing;

  if found then
    return 'claimed';
  end if;

  select s.status, s.claimed_at
    into v_status, v_claimed_at
    from public.stripe_events as s
   where s.event_id = p_event_id
   for update;

  if not found then
    insert into public.stripe_events as s (event_id, status, claimed_at)
    values (p_event_id, 'processing', now())
    on conflict (event_id) do nothing;
    if found then
      return 'claimed';
    end if;
    return 'in_progress';
  end if;

  if v_status = 'processed' then
    return 'duplicate';
  end if;

  if v_claimed_at <= now() - p_stale_after then
    update public.stripe_events
       set claimed_at = now(),
           status = 'processing'
     where event_id = p_event_id
       and status = 'processing'
       and claimed_at <= now() - p_stale_after;
    if found then
      return 'reclaimed';
    end if;
  end if;

  return 'in_progress';
end;
$$;

create or replace function public.complete_stripe_event(p_event_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stripe_events
     set status = 'processed',
         processed_at = coalesce(processed_at, now())
   where event_id = p_event_id
     and status = 'processing';

  if found then
    return;
  end if;

  if exists (
    select 1
      from public.stripe_events
     where event_id = p_event_id
       and status = 'processed'
  ) then
    return;
  end if;

  raise exception 'complete_stripe_event: no claim for %', p_event_id;
end;
$$;

-- Makes the next claim_stripe_event reclaim immediately. Does not delete the
-- row, so a crash between failure and this update still leaves a claim that
-- the stale window can pick up. Already-processed rows are left alone.
create or replace function public.release_stripe_event(p_event_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stripe_events
     set claimed_at = '-infinity'::timestamptz
   where event_id = p_event_id
     and status = 'processing';
end;
$$;

revoke all on function public.claim_stripe_event(text, interval) from public, anon, authenticated;
revoke all on function public.complete_stripe_event(text) from public, anon, authenticated;
revoke all on function public.release_stripe_event(text) from public, anon, authenticated;

grant execute on function public.claim_stripe_event(text, interval) to service_role;
grant execute on function public.complete_stripe_event(text) to service_role;
grant execute on function public.release_stripe_event(text) to service_role;

-- Order side effects --------------------------------------------------------

-- Drop duplicate line items created by the non-idempotent insert before the
-- unique key can be added. Keep one row per order and product.
delete from public.order_items as extra
 using public.order_items as keep
 where extra.order_id = keep.order_id
   and extra.product_id = keep.product_id
   and extra.ctid > keep.ctid;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'order_items_order_id_product_id_key'
       and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_order_id_product_id_key
      unique (order_id, product_id);
  end if;
end $$;

alter table public.orders
  add column if not exists inventory_applied boolean not null default false,
  add column if not exists notified_at timestamptz;

-- Orders already written by the previous webhook. A later redelivery must
-- not decrement stock again or send another receipt. Pending rows are left
-- alone so a paid retry can still apply inventory.
update public.orders
   set inventory_applied = true,
       notified_at = coalesce(notified_at, created_at)
 where inventory_applied = false
   and status in ('paid', 'fulfilled', 'refunded');

create or replace function public.apply_checkout_inventory(
  p_order_id uuid,
  p_product_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_applied boolean;
  v_type public.fulfillment_type;
begin
  select inventory_applied
    into v_applied
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    return 'order_missing';
  end if;

  select fulfillment_type
    into v_type
    from public.products
   where id = p_product_id
   for update;

  if not found then
    return 'product_missing';
  end if;

  if v_applied then
    return 'already_applied';
  end if;

  update public.orders
     set inventory_applied = true
   where id = p_order_id;

  if v_type = 'original' then
    update public.products
       set status = 'sold',
           reserved_until = null,
           quantity = 0
     where id = p_product_id;
  elsif v_type = 'edition' then
    update public.products
       set quantity = quantity - 1
     where id = p_product_id
       and fulfillment_type = 'edition'
       and quantity > 0;
    update public.products
       set status = 'sold'
     where id = p_product_id
       and fulfillment_type = 'edition'
       and quantity = 0;
  end if;

  return 'applied';
end;
$$;

create or replace function public.claim_order_notification(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
     set notified_at = now()
   where id = p_order_id
     and notified_at is null;
  return found;
end;
$$;

revoke all on function public.apply_checkout_inventory(uuid, uuid) from public, anon, authenticated;
revoke all on function public.claim_order_notification(uuid) from public, anon, authenticated;

grant execute on function public.apply_checkout_inventory(uuid, uuid) to service_role;
grant execute on function public.claim_order_notification(uuid) to service_role;
