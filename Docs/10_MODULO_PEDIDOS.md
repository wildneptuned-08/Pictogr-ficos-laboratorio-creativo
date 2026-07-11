# 10_MODULO_PEDIDOS

> ℹ️ **NOTA DE CONSOLIDACIÓN — Fase 0.5 (2026-07-09), decisión confirmada.** Los "Estados" listados más abajo (6 estados, nombres distintos) fueron una de tres alternativas evaluadas para el hallazgo de auditoría C5. El propietario del negocio confirmó el ENUM de 52_SUPABASE_SCHEMA.md (Nuevo, Diseño, Producción, Listo, Entregado, Cancelado) como vigente; los nombres alternativos de este documento no se usan.

## Objetivo
El módulo de Pedidos será el núcleo del sistema.

## Flujo
1. Cliente contacta.
2. Registrar pedido.
3. Registrar producto.
4. Registrar anticipo.
5. Producción.
6. Entrega.
7. Pago final.
8. Cierre.

## Estados
- Nuevo
- Pendiente de Diseño
- En Producción
- Listo
- Entregado
- Cancelado

## Campos
- Número (autogenerado)
- Fecha
- Cliente
- Teléfono
- Producto
- Cantidad
- Observaciones
- Valor total
- Anticipo
- Saldo pendiente
- Medio de pago
- Fecha entrega

## Validaciones
- Cliente obligatorio.
- Anticipo <= valor total.
- No cerrar con saldo pendiente.

## Automatizaciones
- Consecutivo automático.
- Recalcular saldo.
- Actualizar Dashboard.
- Crear movimiento financiero.

## Criterios
Registrar pedidos rápidamente y mantener trazabilidad completa.
