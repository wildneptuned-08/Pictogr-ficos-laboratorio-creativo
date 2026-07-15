-- Corrige una restricción de la Etapa 2 que contradecía una regla de
-- negocio documentada: 42_ANALISIS_PRESUPUESTO.md exige conservar
-- revisiones históricas del presupuesto ("No eliminar presupuestos
-- antiguos... Registrar historial de modificaciones"), pero la tabla
-- tenía un UNIQUE(anio, mes) que impedía tener más de una fila por mes.
--
-- La regla real es "solo puede existir un presupuesto ACTIVO por mes",
-- lo cual se expresa con un índice único parcial en vez de un UNIQUE pleno.

alter table presupuesto drop constraint presupuesto_anio_mes_key;

create unique index presupuesto_unico_activo_por_mes
  on presupuesto (anio, mes)
  where activo;
