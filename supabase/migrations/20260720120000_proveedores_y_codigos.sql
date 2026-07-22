-- Etapa A (Actualización Fase 1): tabla `proveedores` y códigos únicos de
-- producto/insumo ligados al proveedor.
--
-- Requerimiento del propietario:
--   - `proveedores` con esquema mínimo: id, nombre, prefijo_id (único).
--   - Cada producto (catálogo) e insumo (inventario) recibe un código único
--     aleatorio con el prefijo del proveedor: PREFIJO-XXXX.
--   - En Costos/Productos se elige el proveedor y el código se muestra junto
--     al nombre.
--
-- Se mantienen created_at/updated_at por ser CAMPOS OBLIGATORIOS EN TODAS LAS
-- TABLAS (52_SUPABASE_SCHEMA.md); no se agrega ningún otro campo a proveedores.

-- 1. Tabla proveedores -------------------------------------------------------
create table proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(150) not null,
  prefijo_id varchar(20) not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table proveedores enable row level security;

create policy "usuario_autenticado" on proveedores
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create trigger set_updated_at before update on proveedores
  for each row execute function set_updated_at();

-- 2. Relación proveedor -> productos / inventario ----------------------------
-- on delete set null: borrar un proveedor no rompe productos/insumos; solo
-- pierden la referencia (el código ya generado se conserva).
alter table productos
  add column proveedor_id uuid references proveedores (id) on delete set null,
  add column codigo varchar(50) unique;

alter table inventario
  add column proveedor_id uuid references proveedores (id) on delete set null;

-- 3. Generación de código único ---------------------------------------------
-- Genera PREFIJO-XXXX verificando que no exista ni en productos ni en
-- inventario (los códigos son globalmente únicos entre ambos catálogos).
create function generar_codigo_unico(p_prefijo text)
returns text
language plpgsql
as $$
declare
  v_prefijo text := upper(coalesce(nullif(trim(p_prefijo), ''), 'GEN'));
  v_codigo text;
  v_intentos int := 0;
begin
  loop
    v_codigo := v_prefijo || '-' ||
      upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

    exit when not exists (select 1 from productos where codigo = v_codigo)
          and not exists (select 1 from inventario where codigo = v_codigo);

    v_intentos := v_intentos + 1;
    -- Si hay demasiada colisión con 4 caracteres, amplía a 6 y sale.
    if v_intentos > 50 then
      v_codigo := v_prefijo || '-' ||
        upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      exit;
    end if;
  end loop;

  return v_codigo;
end;
$$;

-- Trigger BEFORE INSERT: si no viene un código explícito, lo genera a partir
-- del prefijo del proveedor (o del prefijo por defecto que recibe por TG_ARGV).
-- Al ser BEFORE INSERT, funciona incluso con inventario.codigo NOT NULL.
create function asignar_codigo_producto()
returns trigger
language plpgsql
as $$
declare
  v_prefijo text;
begin
  if new.codigo is not null and trim(new.codigo) <> '' then
    return new;
  end if;

  if new.proveedor_id is not null then
    select prefijo_id into v_prefijo from proveedores where id = new.proveedor_id;
  end if;

  new.codigo := generar_codigo_unico(coalesce(v_prefijo, TG_ARGV[0]));
  return new;
end;
$$;

create trigger asignar_codigo_producto_trigger
  before insert on productos
  for each row execute function asignar_codigo_producto('PRD');

create trigger asignar_codigo_inventario_trigger
  before insert on inventario
  for each row execute function asignar_codigo_producto('INV');

-- 4. Backfill de códigos para productos ya existentes ------------------------
-- (inventario.codigo ya es NOT NULL, así que todos los insumos ya tienen uno).
-- Se hace fila por fila para que cada UPDATE vea los códigos generados antes.
do $$
declare
  r record;
begin
  for r in select id from productos where codigo is null loop
    update productos set codigo = generar_codigo_unico('PRD') where id = r.id;
  end loop;
end $$;
