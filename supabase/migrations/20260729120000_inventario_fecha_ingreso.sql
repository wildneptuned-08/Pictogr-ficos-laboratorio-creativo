-- Actualización Fase 1 (segunda ronda), parte 1 de 3: fecha de ingreso manual
-- del insumo al inventario (la de la factura de compra al proveedor, no la
-- de creación del registro). Es nullable porque los insumos ya existentes no
-- la tienen, y se llena a mano desde el formulario o desde el Excel.
--
-- Esta columna es la que ordena el consumo FIFO (20260729120200): el mismo
-- insumo (misma categoria+nombre+observaciones) puede repetirse en varias
-- filas, una por cada compra/lote, cada una con su propia fecha_ingreso.
alter table inventario add column if not exists fecha_ingreso date;
