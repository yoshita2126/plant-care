insert into public.plants (id, name, type, watering_interval, last_watered, notes)
values
  ('a9f532c7-8fd1-4caf-9e2f-000000000001', 'Monstera deliciosa', 'Tropical', 7, current_date, 'Bright indirect light; let the top soil dry between waterings.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000002', 'Snake Plant', 'Succulent', 14, current_date, 'Tolerates low light; allow soil to dry completely.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000003', 'Peace Lily', 'Flowering Plant', 5, current_date, 'Keep in indirect light and water when leaves begin to droop.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000004', 'Aloe Vera', 'Succulent', 14, current_date, 'Needs bright light and well-draining soil.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000005', 'Golden Pothos', 'Tropical', 7, current_date, 'Allow the top few centimeters of soil to dry.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000006', 'Spider Plant', 'Tropical', 7, current_date, 'Keep in bright indirect light; avoid waterlogging.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000007', 'ZZ Plant', 'Tropical', 14, current_date, 'Drought tolerant; water sparingly.'),
  ('a9f532c7-8fd1-4caf-9e2f-000000000008', 'Fiddle-leaf Fig', 'Tropical', 10, current_date, 'Provide bright indirect light and consistent conditions.')
on conflict (id) do nothing;
