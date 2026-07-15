-- Etapa 4 (FinanzasService): ajusta bolsillos_financieros.saldo_actual de
-- forma atómica cuando se inserta un movimiento financiero, en vez de
-- confiar en dos escrituras separadas desde el cliente. Cumple
-- 43_ANALISIS_FINANZAS.md "Reglas de negocio": nunca modificar el saldo
-- directamente, todo movimiento debe quedar registrado.
--
-- Convención de signos (no especificada explícitamente en la documentación
-- funcional, definida aquí como decisión de implementación):
--   Ingreso      -> valor se almacena positivo, incrementa el saldo.
--   Gasto        -> valor se almacena positivo (magnitud), decrementa el saldo.
--   Transferencia/Ajuste -> valor puede ser positivo o negativo; se suma tal cual
--                            (el signo indica la dirección del movimiento).
-- A diferencia de inventario, un bolsillo sí puede quedar en saldo negativo
-- (43_ANALISIS_FINANZAS.md lista "Saldo negativo" como una alerta a vigilar,
-- no como un estado prohibido).

create function adjust_bolsillo_saldo()
returns trigger
language plpgsql
as $$
begin
  if new.tipo = 'Ingreso' then
    update bolsillos_financieros set saldo_actual = saldo_actual + new.valor where id = new.bolsillo_id;
  elsif new.tipo = 'Gasto' then
    update bolsillos_financieros set saldo_actual = saldo_actual - new.valor where id = new.bolsillo_id;
  else
    update bolsillos_financieros set saldo_actual = saldo_actual + new.valor where id = new.bolsillo_id;
  end if;

  return new;
end;
$$;

create trigger adjust_bolsillo_saldo_trigger
  after insert on movimientos_financieros
  for each row execute function adjust_bolsillo_saldo();
