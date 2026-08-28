-- Permite eliminar un pedido de forma definitiva (a diferencia de
-- "Cancelar", que solo cambia el estado). Decisión de negocio confirmada
-- con el propietario: al eliminar, se borra también el rastro financiero
-- y de inventario que ese pedido generó, pero revirtiendo primero su
-- efecto en saldo_actual (bolsillos_financieros) y stock_actual
-- (inventario), para no dejar esos totales descuadrados.

-- 1) Las dependencias que no tienen sentido sin el pedido pasan de
--    RESTRICT a CASCADE.
alter table pedido_detalle drop constraint pedido_detalle_pedido_id_fkey;
alter table pedido_detalle add constraint pedido_detalle_pedido_id_fkey
  foreign key (pedido_id) references pedidos (id) on delete cascade;

alter table historial_pedidos drop constraint historial_pedidos_pedido_id_fkey;
alter table historial_pedidos add constraint historial_pedidos_pedido_id_fkey
  foreign key (pedido_id) references pedidos (id) on delete cascade;

alter table archivos_pedido drop constraint archivos_pedido_pedido_id_fkey;
alter table archivos_pedido add constraint archivos_pedido_pedido_id_fkey
  foreign key (pedido_id) references pedidos (id) on delete cascade;

-- 2) movimientos_financieros y movimientos_inventario pasaban a SET NULL
--    (quedaban huérfanos); ahora se borran también, una vez revertido su
--    efecto por eliminar_pedido().
alter table movimientos_financieros drop constraint movimientos_financieros_pedido_id_fkey;
alter table movimientos_financieros add constraint movimientos_financieros_pedido_id_fkey
  foreign key (pedido_id) references pedidos (id) on delete cascade;

alter table movimientos_inventario drop constraint movimientos_inventario_pedido_id_fkey;
alter table movimientos_inventario add constraint movimientos_inventario_pedido_id_fkey
  foreign key (pedido_id) references pedidos (id) on delete cascade;

create function eliminar_pedido(p_pedido_id uuid)
returns void
language plpgsql
as $$
declare
  v_mov record;
begin
  if not exists (select 1 from pedidos where id = p_pedido_id) then
    raise exception 'pedido_no_encontrado' using errcode = 'P0004';
  end if;

  -- Revierte cada movimiento financiero sobre su bolsillo antes de que el
  -- cascade lo borre (mismo criterio de signos que adjust_bolsillo_saldo,
  -- invertido).
  for v_mov in select * from movimientos_financieros where pedido_id = p_pedido_id loop
    if v_mov.tipo = 'Ingreso' then
      update bolsillos_financieros set saldo_actual = saldo_actual - v_mov.valor where id = v_mov.bolsillo_id;
    elsif v_mov.tipo = 'Gasto' then
      update bolsillos_financieros set saldo_actual = saldo_actual + v_mov.valor where id = v_mov.bolsillo_id;
    else
      update bolsillos_financieros set saldo_actual = saldo_actual - v_mov.valor where id = v_mov.bolsillo_id;
    end if;
  end loop;

  -- Revierte cada movimiento de inventario sobre su stock (mismo criterio
  -- que adjust_inventario_stock, invertido). Los movimientos de un pedido
  -- solo son de tipo 'Salida' en la práctica (consumir_insumos_produccion);
  -- 'Ajuste' no se revierte porque no guarda el valor anterior.
  for v_mov in select * from movimientos_inventario where pedido_id = p_pedido_id loop
    if v_mov.tipo = 'Entrada' then
      update inventario set stock_actual = stock_actual - v_mov.cantidad where id = v_mov.inventario_id;
    elsif v_mov.tipo = 'Salida' then
      update inventario set stock_actual = stock_actual + v_mov.cantidad where id = v_mov.inventario_id;
    end if;
  end loop;

  delete from pedidos where id = p_pedido_id;
end;
$$;
