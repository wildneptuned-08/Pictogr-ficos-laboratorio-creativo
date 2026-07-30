-- Actualización Fase 1 (ronda 3): plantilla editable del mensaje de
-- WhatsApp que hoy está fija en código (whatsapp.ts). `estado` guarda el
-- valor literal de estado_pedido (ej. 'Producción') como texto, no el enum,
-- para no acoplar esta tabla a ese tipo ni bloquear a futuro un valor
-- especial tipo 'general' si se necesita una plantilla no ligada a un
-- estado. Una fila por estado; si no existe, el código usa el mensaje por
-- defecto (ver PLANTILLA_POR_DEFECTO_PRODUCCION en whatsapp.ts).
create table configuracion_mensajes (
  id uuid primary key default gen_random_uuid(),
  estado varchar(30) not null unique,
  plantilla text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table configuracion_mensajes enable row level security;

create policy "usuario_autenticado" on configuracion_mensajes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create trigger set_updated_at before update on configuracion_mensajes
  for each row execute function set_updated_at();
