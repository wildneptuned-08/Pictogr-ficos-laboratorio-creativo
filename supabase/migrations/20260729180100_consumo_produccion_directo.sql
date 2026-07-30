-- Actualización Fase 1 (tercera ronda), parte 2: reescribe el consumo de
-- Producción sin el multiplicador de la receta vieja. Por cada línea del
-- pedido cuyo producto tenga un insumo vinculado (productos.insumo_id), se
-- descuenta exactamente `pedido_detalle.cantidad` — ni más ni menos — del
-- insumo correspondiente, tomando primero el lote con fecha_ingreso más
-- antigua (FIFO) hasta completar la cantidad. Los productos sin insumo
-- vinculado (insumo_id null) simplemente no descuentan nada: el INNER JOIN
-- con inventario los excluye del recorrido.
--
-- Mismas reglas ya confirmadas: se bloquea con P0014 si el stock no alcanza,
-- y solo corre la primera vez que el pedido ENTRA a Producción (lo controla
-- cambiar_estado_pedido, que no cambia en esta migración).
create or replace function consumir_insumos_produccion(p_pedido_id uuid, p_numero_pedido text)
returns void
language plpgsql
as $$
declare
  r_detalle record;
  r_lote record;
  v_necesaria numeric(12, 2);
  v_tomar numeric(12, 2);
begin
  for r_detalle in
    select pd.cantidad, i.nombre, i.categoria, i.observaciones
      from pedido_detalle pd
      join productos pr on pr.id = pd.producto_id
      join inventario i on i.id = pr.insumo_id
      where pd.pedido_id = p_pedido_id
  loop
    v_necesaria := r_detalle.cantidad;

    for r_lote in
      select id, stock_actual
        from inventario
        where activo = true
          and nombre = r_detalle.nombre
          and categoria is not distinct from r_detalle.categoria
          and observaciones is not distinct from r_detalle.observaciones
        order by fecha_ingreso asc nulls first, id asc
        for update
    loop
      exit when v_necesaria <= 0;
      if r_lote.stock_actual <= 0 then
        continue;
      end if;

      v_tomar := least(r_lote.stock_actual, v_necesaria);

      insert into movimientos_inventario (inventario_id, tipo, cantidad, motivo, pedido_id)
      values (
        r_lote.id,
        'Salida',
        v_tomar,
        'Consumo de producción — Pedido ' || coalesce(p_numero_pedido, p_pedido_id::text),
        p_pedido_id
      );

      v_necesaria := v_necesaria - v_tomar;
    end loop;

    if v_necesaria > 0 then
      raise exception 'stock_insuficiente_produccion: %', r_detalle.nombre using errcode = 'P0014';
    end if;
  end loop;
end;
$$;
