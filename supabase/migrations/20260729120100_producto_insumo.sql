-- Actualización Fase 1 (segunda ronda), parte 2 de 3: receta de insumos por
-- producto (BOM), confirmada con el propietario: un producto puede consumir
-- varios insumos distintos, cada uno en su propia cantidad por unidad.
--
-- inventario_id es el insumo "ancla": como el mismo insumo puede repartirse
-- en varias filas de `inventario` (una por lote/compra, ver
-- 20260729120000), la receta apunta a una fila representativa y el consumo
-- FIFO (20260729120200) resuelve en tiempo de ejecución todas las filas
-- hermanas (misma categoria+nombre+observaciones) — así la receta no se
-- rompe cuando llega un lote nuevo con otro id.
create table producto_insumo (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos (id) on delete cascade,
  inventario_id uuid not null references inventario (id) on delete restrict,
  cantidad_por_unidad numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (producto_id, inventario_id)
);

alter table producto_insumo enable row level security;

create policy "usuario_autenticado" on producto_insumo
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create trigger set_updated_at before update on producto_insumo
  for each row execute function set_updated_at();
