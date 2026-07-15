-- Índices sobre llaves foráneas y campos de consulta frecuente.

create index idx_productos_categoria_id on productos (categoria_id);

create index idx_pedidos_cliente_id on pedidos (cliente_id);
create index idx_pedidos_estado on pedidos (estado);
create index idx_pedidos_fecha_pedido on pedidos (fecha_pedido);

create index idx_pedido_detalle_pedido_id on pedido_detalle (pedido_id);
create index idx_pedido_detalle_producto_id on pedido_detalle (producto_id);

create index idx_inventario_codigo on inventario (codigo);

create index idx_movimientos_inventario_inventario_id on movimientos_inventario (inventario_id);
create index idx_movimientos_inventario_pedido_id on movimientos_inventario (pedido_id);

create index idx_costos_producto_producto_id on costos_producto (producto_id);

create index idx_movimientos_financieros_pedido_id on movimientos_financieros (pedido_id);
create index idx_movimientos_financieros_bolsillo_id on movimientos_financieros (bolsillo_id);
create index idx_movimientos_financieros_fecha on movimientos_financieros (fecha);

create index idx_presupuesto_anio_mes on presupuesto (anio, mes);

create index idx_historial_pedidos_pedido_id on historial_pedidos (pedido_id);

create index idx_archivos_pedido_pedido_id on archivos_pedido (pedido_id);
