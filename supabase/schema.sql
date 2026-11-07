-- Rode no Supabase: SQL Editor. Troque 'SEU_SEGREDO' pelo mesmo valor de MENTORIA_DB_SECRET.
create table if not exists public.mentoria_orders (
  id bigserial primary key,
  reference text unique not null,
  public_id text,
  track text, plan_id text, amount_cents int,
  status text default 'CREATED',
  customer_name text, customer_email text, customer_cpf text, customer_phone text,
  created_at timestamptz default now(), paid_at timestamptz
);
alter table public.mentoria_orders enable row level security;

create or replace function public.mentoria_create_order(
  p_secret text, p_reference text, p_track text, p_plan_id text, p_amount_cents int,
  p_customer_name text, p_customer_email text, p_customer_cpf text, p_customer_phone text)
returns void language plpgsql security definer as $$
begin
  if p_secret <> 'SEU_SEGREDO' then raise exception 'forbidden'; end if;
  insert into public.mentoria_orders(reference, track, plan_id, amount_cents, customer_name, customer_email, customer_cpf, customer_phone)
  values (p_reference, p_track, p_plan_id, p_amount_cents, p_customer_name, p_customer_email, p_customer_cpf, p_customer_phone);
end $$;

create or replace function public.mentoria_update_order(p_secret text, p_reference text, p_public_id text, p_status text)
returns void language plpgsql security definer as $$
begin
  if p_secret <> 'SEU_SEGREDO' then raise exception 'forbidden'; end if;
  update public.mentoria_orders set public_id = coalesce(p_public_id, public_id), status = coalesce(p_status, status) where reference = p_reference;
end $$;

create or replace function public.mentoria_update_order_public(p_secret text, p_public_id text, p_status text)
returns void language plpgsql security definer as $$
begin
  if p_secret <> 'SEU_SEGREDO' then raise exception 'forbidden'; end if;
  update public.mentoria_orders set status = coalesce(p_status, status),
    paid_at = case when p_status = 'SETTLED' then coalesce(paid_at, now()) else paid_at end
  where public_id = p_public_id;
end $$;
grant execute on function public.mentoria_create_order, public.mentoria_update_order, public.mentoria_update_order_public to anon;