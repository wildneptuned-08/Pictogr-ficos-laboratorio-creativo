-- RLS mono-usuario (V1). Ver Docs/23_SEGURIDAD_RLS.md y 52_SUPABASE_SCHEMA.md:
-- la V1 opera con una única cuenta (el propietario del negocio), sin roles.
-- No existe una tabla de usuarios ni columna de propietario por registro,
-- así que la política válida para "el usuario autenticado es el propietario
-- de la cuenta" es simplemente exigir una sesión autenticada. El soporte de
-- roles/múltiples cuentas queda fuera de alcance hasta V2.0.

alter table clientes enable row level security;
alter table categorias_producto enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table pedido_detalle enable row level security;
alter table inventario enable row level security;
alter table movimientos_inventario enable row level security;
alter table costos_producto enable row level security;
alter table bolsillos_financieros enable row level security;
alter table movimientos_financieros enable row level security;
alter table presupuesto enable row level security;
alter table historial_pedidos enable row level security;
alter table archivos_pedido enable row level security;

create policy "usuario_autenticado" on clientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on categorias_producto
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on productos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on pedidos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on pedido_detalle
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on inventario
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on movimientos_inventario
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on costos_producto
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on bolsillos_financieros
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on movimientos_financieros
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on presupuesto
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on historial_pedidos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "usuario_autenticado" on archivos_pedido
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
