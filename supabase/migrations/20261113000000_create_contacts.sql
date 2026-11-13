create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 2),
  email text not null,
  phone text not null default '',
  company text not null default '',
  status text not null default 'lead'
    check (status in ('lead', 'prospect', 'customer', 'churned')),
  value numeric(12, 2) not null default 0 check (value >= 0),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

create index contacts_created_at_idx on public.contacts (created_at desc);

-- The app only talks to this table from the server with the secret key,
-- which bypasses RLS. With RLS on and no policies, the publishable/anon
-- key cannot read or write contacts.
alter table public.contacts enable row level security;
