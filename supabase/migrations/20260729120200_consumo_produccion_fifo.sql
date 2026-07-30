-- Actualización Fase 1 (segunda ronda), parte 3 de 3: al marcar un pedido
-- como "Producción" por primera vez, se descuentan automáticamente los
-- insumos que consume cada producto (receta en `producto_insumo`, ver
-- 20260729120100), tomando primero el lote más antiguo por fecha_ingreso
-- (FIFO, ver 20260729120000). Confirmado con el propietario:
--   - Si el stock disponible no alcanza, se bloquea el cambio de estado
--     (mismo patrón que P0008 con saldo pendiente) — no se deja stock
--     negativo ni se consume a medias (todo el chequeo ocurre antes del
--     `update pedidos`, así que un error revierte toda la transacción).
--   - El descuento solo ocurre la primera vez que el pedido ENTRA a
--     Producción: si ya estaba en ese estado, o si sale y no ha vuelto a
--     entrar, no se repite.
--   - Si el pedido sale de Producción después (a otro estado o Cancelado),
--     el inventario NO se devuelve automáticamente: se asume que el insumo
--     ya se usó físicamente. Una corrección se hace con un Ajuste manual en
--     Inventario, igual que cualquier otra corrección de stock.
--
-- Cada salida queda registrada en `movimientos_inventario` (tipo 'Salida',
-- con pedido_id), reutilizando el trigger `adjust_inventario_stock` ya
-- existente (20260714210439) para el descuento y su bloqueo de stock
-- negativo (P0001) como segunda barrera de seguridad.

create function consumir_insumos_produccion(p_pedido_id uuid, p_numero_pedido text)
returns void
language plpgsql
as $$
declare
  r_detalle record;
  r_receta record;
  r_lote record;
  v_necesaria numeric(12, 2);
  v_tomar numeric(12, 2);
begin
  for r_detalle in
    select producto_id, cantidad from pedido_detalle where pedido_id = p_pedido_id
  loop
    for r_receta in
      select pi.cantidad_por_unidad, i.nombre, i.categoria, i.observaciones
        from producto_insumo pi
        join inventario i on i.id = pi.inventario_id
        where pi.producto_id = r_detalle.producto_id
    loop
      v_necesaria := r_receta.cantidad_por_unidad * r_detalle.cantidad;

      for r_lote in
        select id, stock_actual
          from inventario
          where activo = true
            and nombre = r_receta.nombre
            and categoria is not distinct from r_receta.categoria
            and observaciones is not distinct from r_receta.observaciones
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
        raise exception 'stock_insuficiente_produccion: %', r_receta.nombre using errcode = 'P0014';
      end if;
    end loop;
  end loop;
end;
$$;

create or replace function cambiar_estado_pedido(
  p_pedido_id uuid,
  p_nuevo_estado estado_pedido,
  p_comentario text default null
)
returns pedidos
language plpgsql
as $$
declare
  v_estado_anterior estado_pedido;
  v_saldo_pendiente numeric(12, 2);
  v_numero_pedido varchar(30);
  v_pedido pedidos;
begin
  select estado, saldo_pendiente, numero_pedido
    into v_estado_anterior, v_saldo_pendiente, v_numero_pedido
    from pedidos where id = p_pedido_id;

  if v_estado_anterior is null then
    raise exception 'pedido_no_encontrado' using errcode = 'P0004';
  end if;

  if v_estado_anterior = 'Entregado' and p_nuevo_estado = 'Nuevo' then
    raise exception 'no_revertir_entregado' using errcode = 'P0007';
  end if;

  if p_nuevo_estado = 'Entregado' and v_saldo_pendiente > 0 then
    raise exception 'saldo_pendiente_impide_entrega' using errcode = 'P0008';
  end if;

  if v_estado_anterior = 'Entregado' and p_nuevo_estado = 'Venta con pérdida' then
    raise exception 'entregado_no_es_perdida' using errcode = 'P0012';
  end if;

  if v_estado_anterior = 'Venta con pérdida' and p_nuevo_estado <> 'Venta con pérdida' then
    raise exception 'perdida_es_estado_final' using errcode = 'P0013';
  end if;

  if p_nuevo_estado = 'Producción' and v_estado_anterior <> 'Producción' then
    perform consumir_insumos_produccion(p_pedido_id, v_numero_pedido);
  end if;

  update pedidos set estado = p_nuevo_estado where id = p_pedido_id
    returning * into v_pedido;

  insert into historial_pedidos (pedido_id, estado_anterior, estado_nuevo, comentario)
  values (p_pedido_id, v_estado_anterior, p_nuevo_estado, p_comentario);

  return v_pedido;
end;
$$;
