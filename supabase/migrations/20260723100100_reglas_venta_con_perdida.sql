-- Etapa D (Actualización Fase 1), parte 2 de 2: reglas del estado
-- "Venta con pérdida" (el valor de enum se agrega en 20260723100000).
--
-- Reglas confirmadas:
--   - Un pedido ya Entregado no puede pasar a "Venta con pérdida": su
--     utilidad ya se distribuyó entre los bolsillos (P0012).
--   - "Venta con pérdida" es un estado FINAL: al marcarlo se registra el
--     gasto de producción contra los bolsillos, y salir de él dejaría ese
--     movimiento huérfano (P0013). Para corregir un error se registra un
--     ajuste financiero, no se revierte el estado.
--   - Un pedido en "Venta con pérdida" tampoco se edita.

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
  v_pedido pedidos;
begin
  select estado, saldo_pendiente into v_estado_anterior, v_saldo_pendiente
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

  update pedidos set estado = p_nuevo_estado where id = p_pedido_id
    returning * into v_pedido;

  insert into historial_pedidos (pedido_id, estado_anterior, estado_nuevo, comentario)
  values (p_pedido_id, v_estado_anterior, p_nuevo_estado, p_comentario);

  return v_pedido;
end;
$$;

-- Misma función de 20260720120500, sumando "Venta con pérdida" a los estados
-- no editables (su gasto de producción ya quedó registrado).
create or replace function actualizar_pedido_detalle(
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

  if v_estado in ('Entregado', 'Cancelado', 'Venta con pérdida') then
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

  if v_valor_total < v_anticipo then
    raise exception 'total_menor_que_pagado' using errcode = 'P0010';
  end if;

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
