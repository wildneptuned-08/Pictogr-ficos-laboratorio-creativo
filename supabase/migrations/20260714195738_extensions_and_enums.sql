-- Esquema oficial: Docs/52_SUPABASE_SCHEMA.md
-- Extensiones y tipos ENUM usados por las tablas del sistema.

create extension if not exists "pgcrypto";

-- pedidos.estado — ENUM de 6 valores confirmado por el propietario del negocio (2026-07-09).
-- Ver 52_SUPABASE_SCHEMA.md, "NOTA DE CONSOLIDACIÓN — DECISIÓN DEL NEGOCIO CONFIRMADA".
create type estado_pedido as enum (
  'Nuevo',
  'Diseño',
  'Producción',
  'Listo',
  'Entregado',
  'Cancelado'
);

create type prioridad_pedido as enum (
  'Baja',
  'Media',
  'Alta',
  'Urgente'
);

create type canal_ingreso_pedido as enum (
  'WhatsApp',
  'Instagram',
  'Facebook',
  'Tienda',
  'Otro'
);

create type metodo_pago as enum (
  'Efectivo',
  'Transferencia',
  'Nequi',
  'Daviplata',
  'Tarjeta',
  'Otro'
);

create type tipo_movimiento_inventario as enum (
  'Entrada',
  'Salida',
  'Ajuste'
);

create type tipo_movimiento_financiero as enum (
  'Ingreso',
  'Gasto',
  'Transferencia',
  'Ajuste'
);
