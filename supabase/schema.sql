-- รันไฟล์นี้ใน Supabase → SQL Editor

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz default now()
);

create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  name text not null,
  species text default 'dog',
  breed text,
  note text,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  pet_id uuid not null references pets(id) on delete cascade,
  booking_date date not null,
  booking_time text not null,
  services text[] not null,
  style text,
  brief text,
  photo_url text,
  total numeric not null default 0,
  status text not null default 'booked' check (status in ('booked','grooming','done','closed')),
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  discount numeric not null default 0,
  total numeric not null,
  method text not null,
  paid_at timestamptz default now()
);

-- Storage สำหรับรูป Reference
insert into storage.buckets (id, name, public) values ('references', 'references', true)
on conflict (id) do nothing;

-- RLS: เวอร์ชันนี้ไม่มีระบบล็อกอิน จึงเปิดให้ anon key อ่าน/เขียนได้
-- ก่อนใช้งานจริงควรเพิ่ม Supabase Auth แล้วจำกัดสิทธิ์
alter table customers enable row level security;
alter table pets enable row level security;
alter table bookings enable row level security;
alter table notifications enable row level security;
alter table payments enable row level security;

create policy "open customers" on customers for all using (true) with check (true);
create policy "open pets" on pets for all using (true) with check (true);
create policy "open bookings" on bookings for all using (true) with check (true);
create policy "open notifications" on notifications for all using (true) with check (true);
create policy "open payments" on payments for all using (true) with check (true);

create policy "read references" on storage.objects for select using (bucket_id = 'references');
create policy "upload references" on storage.objects for insert with check (bucket_id = 'references');
