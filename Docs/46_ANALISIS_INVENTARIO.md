# 46_ANALISIS_INVENTARIO.md
# Análisis Funcional del Módulo Inventario

Versión: 0.0

Estado: **PENDIENTE — documento vacío detectado en auditoría (hallazgo crítico C6, 2026-07-09)**

---

# NOTA DE CONSOLIDACIÓN — FASE 0.5

Este documento no contiene ningún análisis funcional. Fue citado por 49 (ahora `legacy/49_DICCIONARIO_DATOS.md`, consolidado en 52_SUPABASE_SCHEMA.md) como fuente relacionada, pero nunca se completó.

Por disciplina de esta fase de consolidación (Fase 0.5), **no se ha inventado ni asumido contenido funcional aquí**: hacerlo violaría el principio de 57_GUIA_CLAUDE_CODE.md ("Nunca inventar funcionalidades", "Nunca asumir comportamientos") y el mandato explícito de esta fase de no alterar reglas de negocio.

El único análisis funcional disponible para Inventario hoy es el esqueleto mínimo de `14_MODULO_INVENTARIO.md` (6 líneas: campos y dos automatizaciones), muy por debajo del nivel de detalle que sí existe para Pedidos (44), Finanzas (43), Costos (45), Presupuesto (42) y Dashboard (47).

## Qué falta definir (requiere insumo del propietario del negocio, con el mismo método usado en 42-45/47: análisis del archivo "Ventas Picto.ods" u otra fuente equivalente)

- Flujo completo de entradas y salidas de insumos, incluyendo compras a proveedores.
- Relación exacta entre `pedido_detalle`, `productos` e `inventario` (qué insumos consume cada producto y en qué cantidad).
- Reglas de alerta de stock mínimo: umbral, frecuencia, canal de notificación.
- Tratamiento de mermas, ajustes manuales y devoluciones de insumos.
- Indicadores de inventario que debe alimentar el Dashboard (más allá de "stock crítico", ya mencionado en 47).
- Relación con Costos: cómo y cuándo un cambio de `costo_unitario` en `inventario` dispara el recálculo de `costos_producto` (42-45 lo mencionan a nivel de principio, pero no el detalle operativo).

**Bloquea:** Etapa 7 (Inventario) de 54_PLAN_DESARROLLO.md no debería iniciarse hasta completar este análisis, para evitar desarrollar sobre supuestos no validados por el negocio.

---

Fin del documento (pendiente de completar).
