-- Etapa B (Actualización Fase 1): edición del pedido desde su vista de detalle.
--
-- Igual que crear_pedido(), editar las líneas de un pedido toca varias tablas
-- (pedido_detalle + pedidos + historial_pedidos) y debe recalcular totales de
-- forma atómica, así que se implementa como función de Postgres.
--
-- Recalcula con la MISMA fórmula que crear_pedido():
--   subtotal       = sum(cantidad * precio_unitario)
--   valor_total    = subtotal - descuento
--   saldo_pendiente = valor_total - anticipo   (anticipo acumula lo ya pagado)
--
-- Los metadatos (fecha_entrega, prioridad, canal, observaciones, método de
-- pago) se actualizan solo si llegan con valor (COALESCE mantiene el actual).

create function actualizar_pedido_detalle(
  p_pedido_id uuid,
  p_detalle jsonb,
  p_descuento numeric default null,
  p_fecha_entrega date default null,
  p_prioridad prioridad_pedido default null,
  p_canal_ingreso canal_ingreso_pedido default null,
  p_observaciones text default null,
  p_metodo_pago metodo_pago default null
)
returns pedidos
language plpgsql
as $$
declare
  v_pedido pedidos;
  v_estado estado_pedido;
  v_anticipo numeric(12, 2);
  v_descuento numeric(12, 2);
  v_subtotal numeric(12, 2) := 0;
  v_valor_total numeric(12, 2);
  v_item jsonb;
begin
  select estado, anticipo, descuento
    into v_estado, v_anticipo, v_descuento
    from pedidos where id = p_pedido_id;

  if v_estado is null then
    raise exception 'pedido_no_encontrado' using errcode = 'P0004';
  end if;

  -- Un pedido entregado o cancelado no se edita (su utilidad ya pudo
  -- distribuirse y sus movimientos ya están registrados).
  if v_estado in ('Entregado', 'Cancelado') then
    raise exception 'pedido_no_editable' using errcode = 'P0011';
  end if;

  if p_detalle is null or jsonb_array_length(p_detalle) = 0 then
    raise exception 'pedido_sin_detalle' using errcode = 'P0002';
  end if;

  v_descuento := coalesce(p_descuento, v_descuento);

  select coalesce(sum((item->>'cantidad')::numeric * (item->>'precio_unitario')::numeric), 0)
    into v_subtotal
    from jsonb_array_elements(p_detalle) as item;

  v_valor_total := v_subtotal - v_descuento;

  if v_valor_total <= 0 then
    raise exception 'total_invalido' using errcode = 'P0003';
  end if;

  -- No permitir dejar el total por debajo de lo que el cliente ya pagó.
  if v_valor_total < v_anticipo then
    raise exception 'total_menor_que_pagado' using errcode = 'P0010';
  end if;

  -- Reemplaza todas las líneas del pedido por las nuevas.
  delete from pedido_detalle where pedido_id = p_pedido_id;

  for v_item in select * from jsonb_array_elements(p_detalle)
  loop
    insert into pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario, subtotal, observaciones)
    values (
      p_pedido_id,
      (v_item->>'producto_id')::uuid,
      (v_item->>'cantidad')::numeric,
      (v_item->>'precio_unitario')::numeric,
      (v_item->>'cantidad')::numeric * (v_item->>'precio_unitario')::numeric,
      v_item->>'observaciones'
    );
  end loop;

  update pedidos set
    subtotal = v_subtotal,
    descuento = v_descuento,
    valor_total = v_valor_total,
    saldo_pendiente = v_valor_total - v_anticipo,
    fecha_entrega = coalesce(p_fecha_entrega, fecha_entrega),
    prioridad = coalesce(p_prioridad, prioridad),
    canal_ingreso = coalesce(p_canal_ingreso, canal_ingreso),
    observaciones = coalesce(p_observaciones, observaciones),
    metodo_pago = coalesce(p_metodo_pago, metodo_pago)
  where id = p_pedido_id
  returning * into v_pedido;

  insert into historial_pedidos (pedido_id, estado_anterior, estado_nuevo, comentario)
  values (p_pedido_id, v_estado, v_estado, 'Pedido editado');

  return v_pedido;
end;
$$;
