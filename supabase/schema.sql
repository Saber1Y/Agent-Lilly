create extension if not exists pgcrypto;

create table if not exists public.agent_configs (
  id text primary key,
  wallet_address text not null unique,
  current_chain_id integer not null,
  position_usdc text not null,
  auto_rebalance_enabled boolean not null default false,
  min_yield_delta_pct numeric,
  min_net_gain_usd numeric,
  max_route_cost_usd numeric,
  cooldown_minutes integer,
  allowed_destination_chain_ids jsonb,
  blocked_chain_ids jsonb,
  alert_webhook_url text,
  telegram_bot_token text,
  telegram_chat_id text,
  telegram_enabled boolean default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  created_at timestamptz not null default now(),
  trigger_source text not null,
  status text not null,
  mode text not null,
  current_chain_id integer not null,
  amount_usdc text not null,
  message text not null,
  route_id text,
  tx_links jsonb not null default '[]'::jsonb,
  details jsonb not null default '{}'::jsonb,
  reasoning jsonb
);

create table if not exists public.agent_chats (
  id text not null,
  wallet_address text not null,
  title text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (wallet_address, id)
);

alter table public.agent_configs
  add column if not exists wallet_address text;

update public.agent_configs
set wallet_address = coalesce(wallet_address, nullif(id, ''), 'legacy')
where wallet_address is null;

alter table public.agent_configs
  alter column wallet_address set not null;

create unique index if not exists agent_configs_wallet_address_idx
  on public.agent_configs (wallet_address);

alter table public.agent_runs
  add column if not exists wallet_address text;

update public.agent_runs
set wallet_address = coalesce(wallet_address, 'legacy')
where wallet_address is null;

alter table public.agent_runs
  alter column wallet_address set not null;

create index if not exists agent_runs_wallet_address_created_at_idx
  on public.agent_runs (wallet_address, created_at desc);

alter table public.agent_chats
  add column if not exists wallet_address text,
  add column if not exists title text,
  add column if not exists messages jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_agent_configs_updated_at on public.agent_configs;
drop trigger if exists set_agent_chats_updated_at on public.agent_chats;

create trigger set_agent_configs_updated_at
before update on public.agent_configs
for each row
execute function public.set_updated_at();

create trigger set_agent_chats_updated_at
before update on public.agent_chats
for each row
execute function public.set_updated_at();
