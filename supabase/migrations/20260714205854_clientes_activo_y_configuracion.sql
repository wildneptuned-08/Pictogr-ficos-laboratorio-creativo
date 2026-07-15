-- Etapa 4: resuelve dos contradicciones entre 53_API_CONTRACT.md y el
-- esquema oficial (52_SUPABASE_SCHEMA.md), confirmadas con el propietario
-- del negocio (2026-07-15):
--   1) ClienteService.desactivar necesitaba una columna `activo` en clientes.
--   2) ConfiguracionService.actualizarEmpresa/actualizarPreferencias
--      necesitaba una tabla que no existía.

alter table clientes add column activo boolean not null default true;

create table configuracion (
  id uuid primary key default gen_random_uuid(),
  nombre_empresa varchar(150),
  correo_contacto varchar(150),
  telefono_contacto varchar(30),
  dias_habiles_mes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on configuracion
  for each row execute function set_updated_at();

alter table configuracion enable row level security;

create policy "usuario_autenticado" on configuracion
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
