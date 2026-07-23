-- Etapa E (Actualización Fase 1): la vista de inventario replica la pestaña
-- "Inventario" del Excel del negocio, cuyas columnas son:
--   CATEGORIA | PRODUCTO | PROVEEDOR | CANTIDAD | COSTO UNITARIO |
--   COSTO TOTAL | STOCK MÍNIMO | OBSERVACIONES
--
-- Todas existen ya en la tabla (nombre, categoria, proveedor_id, stock_actual,
-- costo_unitario, stock_minimo) salvo OBSERVACIONES, que además es la que
-- distingue insumos con el mismo nombre (p. ej. la talla de una camiseta).
-- COSTO TOTAL no se guarda: es cantidad x costo unitario y almacenarlo
-- permitiría que quedara descuadrado respecto a sus factores.
alter table inventario add column if not exists observaciones text;

-- El Excel no maneja unidad de medida y todo se cuenta por unidades sueltas.
-- Con default deja de ser obligatoria al insertar (sigue siendo not null).
alter table inventario alter column unidad_medida set default 'Unidad';
