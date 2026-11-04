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
  action text not null default 'watered',
  date timestamptz not null default now()
);

create index if not exists care_logs_plant_id_date_idx
  on public.care_logs (plant_id, date desc);

alter table public.plants enable row level security;
alter table public.care_logs enable row level security;

grant all on public.plants, public.care_logs to service_role;

create or replace function public.water_plant(p_plant_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  plant_row public.plants%rowtype;
  log_row public.care_logs%rowtype;
begin
  update public.plants
  set last_watered = current_date,
      updated_at = now()
  where id = p_plant_id
  returning * into plant_row;

  if not found then
    raise exception 'Plant not found' using errcode = 'P0002';
  end if;

  insert into public.care_logs (plant_id, plant_name, action)
  values (plant_row.id, plant_row.name, 'watered')
  returning * into log_row;

  return jsonb_build_object(
    'plant', to_jsonb(plant_row),
    'log', to_jsonb(log_row)
  );
end;
$$;

grant execute on function public.water_plant(uuid) to service_role;
