-- Esquema oficial: Docs/52_SUPABASE_SCHEMA.md
-- Tablas de la Versión 1. Todas incluyen id/created_at/updated_at
-- ("CAMPOS OBLIGATORIOS EN TODAS LAS TABLAS"), aunque alguna sección
-- particular del documento no los repita explícitamente.

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(150) not null,
  telefono varchar(30) not null unique,
  correo varchar(150),
  direccion text,
  ciudad varchar(80),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categorias_producto (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(100) not null,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias_producto (id) on delete restrict,
  nombre varchar(120) not null,
  descripcion text,
  precio_base numeric(12, 2) not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pedidos (
  id uuid primary key default gen_random_uuid(),
  numero_pedido varchar(30) not null unique,
  cliente_id uuid not null references clientes (id) on delete restrict,
  fecha_pedido timestamptz not null default now(),
  fecha_entrega date,
  estado estado_pedido not null default 'Nuevo',
  prioridad prioridad_pedido not null default 'Media',
  canal_ingreso canal_ingreso_pedido not null,
  observaciones text,
  subtotal numeric(12, 2) not null default 0,
  descuento numeric(12, 2) not null default 0,
  valor_total numeric(12, 2) not null default 0,
  anticipo numeric(12, 2) not null default 0,
  saldo_pendiente numeric(12, 2) not null default 0,
  metodo_pago metodo_pago,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pedido_detalle (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete restrict,
  producto_id uuid not null references productos (id) on delete restrict,
  cantidad integer not null,
  precio_unitario numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventario (
  id uuid primary key default gen_random_uuid(),
  codigo varchar(50) not null unique,
  nombre varchar(150) not null,
  categoria varchar(80),
  unidad_medida varchar(40) not null,
  stock_actual numeric(12, 2) not null default 0,
  stock_minimo numeric(12, 2) not null default 0,
  costo_unitario numeric(12, 2) not null default 0,
  proveedor varchar(120),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table movimientos_inventario (
  id uuid primary key default gen_random_uuid(),
  inventario_id uuid not null references inventario (id) on delete restrict,
  tipo tipo_movimiento_inventario not null,
  cantidad numeric(12, 2) not null,
  motivo text,
  pedido_id uuid references pedidos (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table costos_producto (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos (id) on delete restrict,
  costo_material numeric(12, 2) not null default 0,
  costo_impresion numeric(12, 2) not null default 0,
  costo_empaque numeric(12, 2) not null default 0,
  otros_costos numeric(12, 2) not null default 0,
  costo_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bolsillos_financieros (
  id uuid primary key default gen_random_uuid(),
  nombre varchar(80) not null,
  porcentaje numeric(5, 2) not null,
  saldo_actual numeric(12, 2) not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table movimientos_financieros (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos (id) on delete set null,
  bolsillo_id uuid not null references bolsillos_financieros (id) on delete restrict,
  tipo tipo_movimiento_financiero not null,
  categoria varchar(100),
  valor numeric(12, 2) not null,
  descripcion text,
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table presupuesto (
  id uuid primary key default gen_random_uuid(),
  anio integer not null,
  mes integer not null,
  meta_mensual numeric(12, 2) not null default 0,
  meta_quincenal numeric(12, 2) not null default 0,
  meta_semanal numeric(12, 2) not null default 0,
  meta_diaria numeric(12, 2) not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (anio, mes)
);

create table historial_pedidos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete restrict,
  estado_anterior varchar,
  estado_nuevo varchar,
  usuario varchar,
  fecha timestamptz not null default now(),
  comentario text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table archivos_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete restrict,
  nombre_archivo varchar not null,
  url_storage text not null,
  tipo_archivo varchar,
  tamano integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
