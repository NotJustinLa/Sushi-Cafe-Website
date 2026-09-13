-- gen_random_bytes() (used for table codes) comes from pgcrypto. Supabase keeps
-- extensions in the `extensions` schema; this is a no-op if it's already on.
create extension if not exists pgcrypto with schema extensions;

create type order_status as enum ('received', 'preparing', 'ready', 'served', 'cancelled');

-- ── Tables ───────────────────────────────────────────────────────────

-- One row per physical table. `code` is printed in the QR (/t/<code>).
-- It's random, so nobody can guess another table's link. Rotate a code by updating it and reprinting that QR.
create table dining_tables (
  table_number  int  primary key check (table_number between 1 and 99),
  code          text not null unique default encode(extensions.gen_random_bytes(6), 'hex'),
  active        boolean not null default true
);

insert into dining_tables (table_number) select generate_series(1, 9);  -- the cafe has 9 tables

-- ── Table sessions ───────────────────────────────────────────────────

-- Staff open a session when a group sits down, and close it when they pay.
-- Orders are only accepted while the table's session is open.
create table table_sessions (
  id            uuid primary key default gen_random_uuid(),
  table_number  int  not null references dining_tables (table_number),
  opened_at     timestamptz not null default now(),
  closed_at     timestamptz                        -- null = still open
);

-- At most one open session per table.
create unique index one_open_session_per_table
  on table_sessions (table_number) where closed_at is null;

-- ── Orders ───────────────────────────────────────────────────────────

create table orders (
  order_number  bigint generated always as identity primary key,  -- #1, #2, #3 … counts up forever
  table_number  int  not null references dining_tables (table_number),
  session_id    uuid not null references table_sessions (id),
  items         jsonb not null,                                   -- snapshot: name, size, unit price, qty
  total_cents   int  not null check (total_cents >= 0),
  note          text check (char_length(note) <= 200),
  status        order_status not null default 'received',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),               -- the API sets this on every status change
  ready_at      timestamptz                                       -- the API sets this when status becomes 'ready'
);

create index orders_session_idx on orders (session_id);
create index orders_status_idx  on orders (status);

-- Lock everything down: no public access. Only the server's service role key can read or write.
alter table dining_tables  enable row level security;
alter table table_sessions enable row level security;
alter table orders         enable row level security;
