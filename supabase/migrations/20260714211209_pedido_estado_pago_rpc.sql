-- Etapa 4 (PedidoService): "Cambiar Estado" y "Registrar Pago" también
-- tocan más de una tabla o requieren aritmética atómica, así que se
-- implementan como funciones de Postgres (mismo motivo que crear_pedido()).
--
-- Nota: la máquina de estados de pedidos (qué transiciones son válidas)
-- sigue sin definirse formalmente — Docs/48_FLUJOS_NEGOCIO.md documenta que
-- el propietario del negocio pospuso esa decisión. Por eso esta función NO
-- valida transiciones específicas; solo exige que el estado exista (ya lo
-- garantiza el ENUM) y registra el cambio en el historial.

create function cambiar_estado_pedido(
  p_pedido_id uuid,
  p_nuevo_estado estado_pedido,
  p_comentario text default null
)
returns pedidos
language plpgsql
as $$
declare
  v_estado_anterior estado_pedido;
  v_pedido pedidos;
begin
  select estado into v_estado_anterior from pedidos where id = p_pedido_id;

  if v_estado_anterior is null then
    raise exception 'pedido_no_encontrado' using errcode = 'P0004';
  end if;

  update pedidos set estado = p_nuevo_estado where id = p_pedido_id
    returning * into v_pedido;

  insert into historial_pedidos (pedido_id, estado_anterior, estado_nuevo, comentario)
  values (p_pedido_id, v_estado_anterior, p_nuevo_estado, p_comentario);

  return v_pedido;
end;
$$;

create function registrar_pago_pedido(
  p_pedido_id uuid,
  p_valor numeric
)
returns pedidos
language plpgsql
as $$
declare
  v_pedido pedidos;
begin
  if p_valor <= 0 then
    raise exception 'valor_invalido' using errcode = 'P0005';
  end if;

  update pedidos
    set anticipo = anticipo + p_valor,
        saldo_pendiente = saldo_pendiente - p_valor
    where id = p_pedido_id and saldo_pendiente >= p_valor
    returning * into v_pedido;

  if v_pedido.id is null then
    raise exception 'saldo_insuficiente' using errcode = 'P0006';
  end if;

  return v_pedido;
end;
$$;
