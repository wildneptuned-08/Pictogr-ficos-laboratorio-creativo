-- Etapa 6: refuerza dos reglas de negocio confirmadas (no formaban parte
-- de la máquina de estados pospuesta por el propietario del negocio):
--   - 17_REGLAS_DE_NEGOCIO.md: "Un pedido entregado no puede volver a
--     estado Nuevo."
--   - 10_MODULO_PEDIDOS.md ("Validaciones"): "No cerrar con saldo
--     pendiente" — no se puede marcar Entregado si aún debe dinero.

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

  update pedidos set estado = p_nuevo_estado where id = p_pedido_id
    returning * into v_pedido;

  insert into historial_pedidos (pedido_id, estado_anterior, estado_nuevo, comentario)
  values (p_pedido_id, v_estado_anterior, p_nuevo_estado, p_comentario);

  return v_pedido;
end;
$$;
