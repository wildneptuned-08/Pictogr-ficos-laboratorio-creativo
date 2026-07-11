# 48_FLUJOS_NEGOCIO.md
# Flujos de Negocio

Versión: 1.0

Estado: Consolidado (parcial) — completado el 2026-07-10 uniendo exclusivamente lo ya confirmado en documentos vigentes. No incorpora información nueva del propietario del negocio.

---

# NOTA DE CONSOLIDACIÓN — FASE 0.5 (seguimiento, 2026-07-10)

Este documento estaba vacío desde la auditoría del 2026-07-09 (hallazgo crítico C6). Se completa ahora reuniendo, sin inventar nada, lo que ya está aprobado en:

- `01_VISION_DEL_NEGOCIO.md`
- `16_FLUJO_DEL_NEGOCIO.md`
- `44_ANALISIS_PEDIDO.md`
- `43_ANALISIS_FINANZAS.md`
- `45_ANALISIS_COSTOS.md`
- `47_ANALISIS_DASHBOARD.md`

Las bifurcaciones reales del negocio (cancelaciones, pedidos suspendidos, reprocesos) y la relación exacta con la máquina de estados del Pedido siguen **sin definir** — se postergaron a petición del propietario del negocio, que indicó que las personas para quienes se construye el sistema todavía no tienen una idea clara de esos casos. Se completarán cuando exista una estructura más establecida.

---

# Objetivo

Documentar, a partir de lo ya aprobado por el negocio, el flujo único de punta a punta: desde que un cliente solicita un producto hasta el cierre financiero y su reflejo en el Dashboard.

---

# Flujo maestro

```
Cliente
  │
  ▼
Contacto (WhatsApp Business)
  │
  ▼
Crear Pedido
  │
  ▼
Registrar / asociar Cliente (sin duplicar)
  │
  ▼
Seleccionar Producto(s)
  │
  ▼
Registrar Diseño
  │
  ▼
Registrar Anticipo (si aplica) → Actualiza saldo → Actualiza Dashboard
  │
  ▼
Producción
  │
  ▼
Pedido Listo
  │
  ▼
Entrega
  │
  ▼
Pago final
  │
  ▼
Cálculo de costo (Costos) → Utilidad Bruta = Venta − Costos
  │
  ▼
Distribución automática por bolsillos (Finanzas)
  │
  ▼
Actualizar Dashboard
  │
  ▼
Actualizar Reportes
```

Fuente: `01_VISION_DEL_NEGOCIO.md` (flujo principal), `16_FLUJO_DEL_NEGOCIO.md` (10 pasos), `44_ANALISIS_PEDIDO.md` (flujo del pedido) y `43_ANALISIS_FINANZAS.md` (flujo financiero) — los cuatro son consistentes entre sí y no presentaban contradicciones.

---

# Puntos de integración entre módulos (ya confirmados)

## Pedidos → Inventario
Al usar materiales en un pedido, el inventario descuenta automáticamente las unidades consumidas (44_ANALISIS_PEDIDO.md).

## Inventario → Costos
El costo de cada producto proviene del costo de sus insumos en Inventario; un cambio de costo de insumo recalcula automáticamente costo del producto, rentabilidad y utilidad estimada (45_ANALISIS_COSTOS.md).

## Pedidos → Costos
Al registrarse un pedido, el sistema calcula automáticamente costo estimado, utilidad, margen y rentabilidad (45_ANALISIS_COSTOS.md).

## Costos → Finanzas
La utilidad bruta se calcula como Venta − Costo total (43_ANALISIS_FINANZAS.md, 45_ANALISIS_COSTOS.md).

## Pedidos → Finanzas
Cuando un pedido se entrega y se paga, se crea automáticamente un ingreso, se calcula la utilidad y se distribuye entre los bolsillos financieros, sin intervención del usuario (43_ANALISIS_FINANZAS.md).

## Inventario → Finanzas
Las compras de insumos también afectan Finanzas (43_ANALISIS_FINANZAS.md, sección "Relación con otros módulos").

## Todos los módulos → Dashboard
Pedidos, Finanzas, Inventario, Costos, Presupuesto y Clientes alimentan el Dashboard en tiempo real, sin botón de actualización manual (47_ANALISIS_DASHBOARD.md).

---

# Lo que este documento NO define todavía

Por decisión explícita del propietario del negocio (2026-07-10), quedan pendientes para una siguiente iteración, cuando el negocio tenga mayor claridad:

- Cancelaciones de pedidos: en qué punto del flujo pueden ocurrir y qué automatizaciones revierten (saldo, inventario, finanzas).
- Pedidos suspendidos: causas, tratamiento y reanudación.
- Reprocesos: cuándo un pedido vuelve a producción después de haber avanzado.
- La relación detallada entre este flujo maestro y la máquina de estados del Pedido (hallazgo C5, ya resuelto a nivel de nombres de estado en `52_SUPABASE_SCHEMA.md`, pero sin las transiciones y reglas de cada cambio de estado).

Esto **no bloquea** ninguna etapa de `54_PLAN_DESARROLLO.md`: el flujo básico ya está cubierto de forma redundante en los documentos fuente citados arriba.

---

Fin del documento.
