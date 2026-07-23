-- Etapa D (Actualización Fase 1), parte 1 de 2: nuevo estado de pedido.
--
-- "Venta con pérdida" cubre el pedido que no se pudo entregar por un error
-- de producción: el taller ya gastó los insumos, pero no hay venta.
--
-- Va en su propia migración porque Postgres no permite REFERENCIAR un valor
-- de enum recién agregado dentro de la misma transacción que lo crea. Las
-- funciones que lo usan viven en 20260723100100.

alter type estado_pedido add value if not exists 'Venta con pérdida';
