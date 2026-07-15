-- Valores semilla de bolsillos_financieros confirmados por el propietario
-- del negocio (2026-07-09). Ver 52_SUPABASE_SCHEMA.md.

insert into bolsillos_financieros (nombre, porcentaje, saldo_actual, activo)
values
  ('Reinversión', 20.00, 0, true),
  ('Mantenimiento', 10.00, 0, true),
  ('Fondo de Emergencia', 10.00, 0, true),
  ('Disponible para mí', 60.00, 0, true);
