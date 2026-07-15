-- Etapa 4 (PedidoService): "Crear Pedido" toca 3 tablas (pedidos,
-- pedido_detalle, historial_pedidos) y Docs/53_API_CONTRACT.md exige que
-- esta operación se ejecute como una única operación lógica consistente
-- ("TRANSACCIONES"). El cliente de Supabase no soporta transacciones
-- multi-tabla, así que se implementa como una función de Postgres.

create sequence pedido_numero_seq;

create function set_numero_pedido()
returns trigger
language plpgsql
as $$
begin
  if new.numero_pedido is null or new.numero_pedido = '' then
    new.numero_pedido := 'PED-' || lpad(nextval('pedido_numero_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger set_numero_pedido_trigger
  before insert on pedidos
  for each row execute function set_numero_pedido();

-- p_detalle: jsonb array de {producto_id, cantidad, precio_unitario, observaciones}
create function crear_pedido(
  p_cliente_id uuid,
  p_fecha_entrega date,
  p_prioridad prioridad_pedido,
  p_canal_ingreso canal_ingreso_pedido,
  p_observaciones text,
  p_descuento numeric,
  p_anticipo numeric,
  p_metodo_pago metodo_pago,
  p_detalle jsonb
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
