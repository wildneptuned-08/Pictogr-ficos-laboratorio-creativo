-- Función y triggers genéricos para mantener updated_at.

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on clientes
  for each row execute function set_updated_at();

create trigger set_updated_at before update on categorias_producto
  for each row execute function set_updated_at();

create trigger set_updated_at before update on productos
  for each row execute function set_updated_at();

create trigger set_updated_at before update on pedidos
  for each row execute function set_updated_at();

create trigger set_updated_at before update on pedido_detalle
  for each row execute function set_updated_at();

create trigger set_updated_at before update on inventario
  for each row execute function set_updated_at();

create trigger set_updated_at before update on movimientos_inventario
  for each row execute function set_updated_at();

create trigger set_updated_at before update on costos_producto
  for each row execute function set_updated_at();

create trigger set_updated_at before update on bolsillos_financieros
  for each row execute function set_updated_at();

create trigger set_updated_at before update on movimientos_financieros
  for each row execute function set_updated_at();

create trigger set_updated_at before update on presupuesto
  for each row execute function set_updated_at();

create trigger set_updated_at before update on historial_pedidos
  for each row execute function set_updated_at();

create trigger set_updated_at before update on archivos_pedido
  for each row execute function set_updated_at();
