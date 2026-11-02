create table if not exists public.plants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  type text not null check (char_length(btrim(type)) between 1 and 80),
  watering_interval integer not null check (watering_interval between 1 and 3650),
  last_watered date not null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_logs (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  plant_name text not null,
  action text not null check (action = 'Watered'),
  date date not null default (timezone('utc', now()))::date
);

create index if not exists care_logs_plant_date_idx on public.care_logs (plant_id, date desc);
create index if not exists plants_created_at_idx on public.plants (created_at desc);

alter table public.plants enable row level security;
alter table public.care_logs enable row level security;

drop policy if exists "Public plant access" on public.plants;
create policy "Public plant access" on public.plants
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "Public care log access" on public.care_logs;
create policy "Public care log access" on public.care_logs
  for all to anon, authenticated using (true) with check (true);

create or replace function public.water_plant(plant_uuid uuid)
returns setof public.plants
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_plant public.plants%rowtype;
  watered_on date := (timezone('utc', now()))::date;
begin
  update public.plants
  set last_watered = watered_on, updated_at = now()
  where id = plant_uuid
  returning * into updated_plant;

  if not found then
    return;
  end if;

  insert into public.care_logs (plant_id, plant_name, action, date)
  values (updated_plant.id, updated_plant.name, 'Watered', watered_on);

  return next updated_plant;
end;
$$;

grant select, insert, update, delete on public.plants to anon, authenticated;
grant select, insert, update, delete on public.care_logs to anon, authenticated;
grant execute on function public.water_plant(uuid) to anon, authenticated;
