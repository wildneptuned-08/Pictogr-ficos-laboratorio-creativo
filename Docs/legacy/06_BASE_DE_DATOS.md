> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **52_SUPABASE_SCHEMA.md**.
> Motivo: listado de tablas parcial e incluía "proveedores", fuera del alcance de la V1 según 55_ROADMAP_PRODUCTO.md. Hallazgo de auditoría: I6.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

# Modelo de Base de Datos

## Tablas principales

-   clientes
-   pedidos
-   productos
-   categorias_producto
-   inventario
-   movimientos_inventario
-   costos
-   finanzas
-   bolsillos
-   presupuesto
-   proveedores

## Relaciones

Un cliente puede tener muchos pedidos. Un pedido pertenece a un cliente.
Los productos consumen insumos del inventario. Los movimientos
actualizan el inventario. Las finanzas se generan desde los pedidos
entregados.
