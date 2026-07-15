-- Etapa 4 (InventarioService): ajusta inventario.stock_actual de forma
-- atómica cuando se inserta un movimiento, y bloquea a nivel de base de
-- datos cualquier operación que deje stock negativo (52_SUPABASE_SCHEMA.md
-- "REGLAS GENERALES" y 53_API_CONTRACT.md "INVENTARIOSERVICE / Validaciones").
-- Evita la condición de carrera de hacer el ajuste en dos pasos desde el
-- cliente (insertar movimiento + actualizar stock por separado).

create function adjust_inventario_stock()
returns trigger
language plpgsql
as $$
declare
  nuevo_stock numeric(12, 2);
begin
  if new.tipo = 'Entrada' then
    nuevo_stock := (select stock_actual from inventario where id = new.inventario_id) + new.cantidad;
  elsif new.tipo = 'Salida' then
    nuevo_stock := (select stock_actual from inventario where id = new.inventario_id) - new.cantidad;
  else
    -- Ajuste: la cantidad representa el nuevo stock absoluto.
    nuevo_stock := new.cantidad;
  end if;

  if nuevo_stock < 0 then
    raise exception 'stock_insuficiente' using errcode = 'P0001';
  end if;

  update inventario set stock_actual = nuevo_stock where id = new.inventario_id;

  return new;
end;
$$;

create trigger adjust_inventario_stock_trigger
  after insert on movimientos_inventario
  for each row execute function adjust_inventario_stock();
