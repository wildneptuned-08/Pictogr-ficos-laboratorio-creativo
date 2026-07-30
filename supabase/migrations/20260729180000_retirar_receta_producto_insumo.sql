-- Actualización Fase 1 (tercera ronda): el propietario decidió simplificar
-- el descuento de inventario. En vez de una "receta" con varios insumos y un
-- multiplicador por unidad (producto_insumo, 20260729120100), cada producto
-- se vincula directamente a UN insumo de Inventario, y al pasar el pedido a
-- Producción se descuenta EXACTAMENTE la cantidad pedida (sin multiplicar).
--
-- insumo_id es, igual que antes, la fila "ancla": el mismo insumo puede
-- repartirse en varias filas/lotes de `inventario` (una por compra, ver
-- 20260729120000), y el consumo FIFO (20260729180100) resuelve en tiempo de
-- ejecución todas las filas hermanas (misma categoria+nombre+observaciones).
drop table if exists producto_insumo;

alter table productos add column if not exists insumo_id uuid references inventario (id) on delete set null;
