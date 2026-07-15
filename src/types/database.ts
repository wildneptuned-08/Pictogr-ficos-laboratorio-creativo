// Alias con nombres de entidad en PascalCase sobre el tipo generado por
// `npx supabase gen types typescript --linked` (src/types/supabase.ts),
// que es el que se regenera automáticamente desde el esquema real.
// No declarar campos aquí manualmente: evita que este archivo y
// Docs/52_SUPABASE_SCHEMA.md queden desincronizados.

import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type EstadoPedido = Enums['estado_pedido']
export type PrioridadPedido = Enums['prioridad_pedido']
export type CanalIngresoPedido = Enums['canal_ingreso_pedido']
export type MetodoPago = Enums['metodo_pago']
export type TipoMovimientoInventario = Enums['tipo_movimiento_inventario']
export type TipoMovimientoFinanciero = Enums['tipo_movimiento_financiero']

export type Cliente = Tables['clientes']['Row']
export type CategoriaProducto = Tables['categorias_producto']['Row']
export type Producto = Tables['productos']['Row']
export type Pedido = Tables['pedidos']['Row']
export type PedidoDetalle = Tables['pedido_detalle']['Row']
export type Inventario = Tables['inventario']['Row']
export type MovimientoInventario = Tables['movimientos_inventario']['Row']
export type CostoProducto = Tables['costos_producto']['Row']
export type BolsilloFinanciero = Tables['bolsillos_financieros']['Row']
export type MovimientoFinanciero = Tables['movimientos_financieros']['Row']
export type Presupuesto = Tables['presupuesto']['Row']
export type HistorialPedido = Tables['historial_pedidos']['Row']
export type ArchivoPedido = Tables['archivos_pedido']['Row']
export type Configuracion = Tables['configuracion']['Row']
