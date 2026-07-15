-- Agrega valores por defecto a los parámetros opcionales de crear_pedido()
-- para que el generador de tipos de Supabase los marque como opcionales
-- (evita forzar `null` contra un tipo `string` no-nulo desde el cliente).
-- Cambia también el orden de los parámetros (los opcionales deben ir al
-- final), lo que en Postgres es una firma distinta: hay que eliminar la
-- función original antes de crear la nueva con el mismo nombre.

drop function if exists crear_pedido(
  uuid, date, prioridad_pedido, canal_ingreso_pedido, text, numeric, numeric, metodo_pago, jsonb
);

create function crear_pedido(
  p_cliente_id uuid,
  p_canal_ingreso canal_ingreso_pedido,
  p_detalle jsonb,
  p_fecha_entrega date default null,
  p_prioridad prioridad_pedido default 'Media',
  p_observaciones text default null,
  p_descuento numeric default 0,
  p_anticipo numeric default 0,
  p_metodo_pago metodo_pago default null
)
returns pedidos
language plpgsql
as $$
declare
  v_pedido pedidos;
  v_subtotal numeric(12, 2) := 0;
  v_valor_total numeric(12, 2);
  v_item jsonb;
begin
  if p_detalle is null or jsonb_array_length(p_detalle) = 0 then
    raise exception 'pedido_sin_detalle' using errcode = 'P0002';
  end if;

  select coalesce(sum((item->>'cantidad')::numeric * (item->>'precio_unitario')::numeric), 0)
    into v_subtotal
    from jsonb_array_elements(p_detalle) as item;

  v_valor_total := v_subtotal - coalesce(p_descuento, 0);

  if v_valor_total <= 0 then
    raise exception 'total_invalido' using errcode = 'P0003';
  end if;

  insert into pedidos (
    numero_pedido, cliente_id, fecha_entrega, prioridad, canal_ingreso,
    observaciones, subtotal, descuento, valor_total, anticipo, saldo_pendiente, metodo_pago
  ) values (
    '', p_cliente_id, p_fecha_entrega, p_prioridad, p_canal_ingreso,
    p_observaciones, v_subtotal, coalesce(p_descuento, 0), v_valor_total,
    coalesce(p_anticipo, 0), v_valor_total - coalesce(p_anticipo, 0), p_metodo_pago
  ) returning * into v_pedido;

  for v_item in select * from jsonb_array_elements(p_detalle)
  loop
    insert into pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario, subtotal, observaciones)
    values (
      v_pedido.id,
      (v_item->>'producto_id')::uuid,
      (v_item->>'cantidad')::numeric,
      (v_item->>'precio_unitario')::numeric,
      (v_item->>'cantidad')::numeric * (v_item->>'precio_unitario')::numeric,
      v_item->>'observaciones'
    );
  end loop;

  insert into historial_pedidos (pedido_id, estado_anterior, estado_nuevo, comentario)
  values (v_pedido.id, null, 'Nuevo', 'Pedido creado');

  return v_pedido;
end;
$$;
