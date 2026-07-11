> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **52_SUPABASE_SCHEMA.md**.
> Motivo: modelo narrativo sin tipos de datos ni restricciones SQL; su contenido conceptual queda incorporado en el diccionario oficial. Hallazgo de auditoría: I6.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

\# ==========================================================

\# 41\_MODELO\_DATOS.md

\# Modelo de Datos del Sistema

\# ==========================================================



Versión: 1.0



Estado: Activo



Este documento define el modelo de datos oficial del Sistema Administrativo para la Empresa de Artes Gráficas.



Toda la información almacenada en Supabase deberá respetar esta estructura.



\---



\# OBJETIVO



Diseñar una base de datos:



\- sencilla

\- consistente

\- normalizada

\- fácil de consultar

\- fácil de mantener



La base de datos será la única fuente oficial de información del sistema.



\---



\# PRINCIPIOS



Toda tabla deberá:



✓ Tener un identificador único.



✓ Registrar fecha de creación.



✓ Registrar fecha de actualización.



✓ Tener nombres claros.



✓ Evitar información duplicada.



\---



\# TABLAS PRINCIPALES



El sistema estará compuesto por las siguientes entidades.



\## Clientes



Representa cada cliente del negocio.



Relaciones



Cliente



↓



Pedidos



\---



\## Pedidos



Representa cada venta realizada.



Relaciones



Pedido



↓



Cliente



↓



Producto



↓



Pagos



↓



Movimientos Financieros



\---



\## Productos



Catálogo de productos que vende la empresa.



Ejemplos



\- Mug

\- Camiseta

\- Llavero

\- Cuadro

\- Sticker

\- Logo

\- Carta Menú



\---



\## Categorías



Permite organizar los productos.



Ejemplo



Sublimación



↓



Mug



↓



Mug Mágico



↓



Mug Blanco



\---



\## Inventario



Representa cada insumo.



Ejemplos



\- Mug blanco

\- Tinta

\- Papel

\- Caja

\- Cinta térmica

\- Vinilo



\---



\## Movimientos de Inventario



Toda entrada o salida de inventario.



Nunca modificar directamente el stock.



Todo cambio deberá generar un movimiento.



\---



\## Costos



Contiene los costos promedio utilizados para calcular la utilidad.



Ejemplo



Costo del Mug



Costo de impresión



Costo caja



Costo cinta



Costo papel



\---



\## Finanzas



Registro de ingresos y gastos.



Nunca eliminar movimientos.



Solo anular.



\---



\## Bolsillos



Representa las cuentas internas del negocio.



Ejemplos



\- Reinversión



\- Emergencias



\- Mantenimiento



\- Disponible para mí



Cada bolsillo tendrá un porcentaje configurable.



\---



\## Presupuesto



Contiene las metas del negocio.



Diaria



Semanal



Quincenal



Mensual



\---



\## Reportes



No almacenará información.



Será construido mediante consultas.



\---



\# RELACIONES



Cliente



↓



Pedidos



↓



Pagos



↓



Finanzas



↓



Dashboard



\---



Productos



↓



Inventario



↓



Costos



↓



Rentabilidad



\---



\# PRINCIPIOS DE NORMALIZACIÓN



No duplicar información.



Ejemplo



Incorrecto



Guardar el nombre del cliente dentro de todos los pedidos.



Correcto



Guardar únicamente el ID del cliente.



\---



\# ELIMINACIONES



No eliminar registros importantes.



Preferir:



Activo



Inactivo



Cancelado



Anulado



\---



\# HISTORIAL



Todo movimiento importante deberá poder rastrearse.



Especialmente:



Pedidos



Finanzas



Inventario



\---



\# ÍNDICES



Crear índices sobre:



\- cliente\_id



\- pedido\_id



\- fecha



\- estado



\- producto\_id



\- telefono



\- nombre



\---



\# AUDITORÍA



Toda modificación importante deberá registrar:



Fecha



Usuario



Acción



Registro afectado



\---



\# BACKUPS



La información deberá respaldarse periódicamente.



Nunca asumir que la información podrá recuperarse.



\---



\# ESCALABILIDAD



El modelo deberá permitir agregar nuevas tablas sin afectar las existentes.



Ejemplos futuros



\- Producción



\- Compras



\- Proveedores



\- Facturación



\- CRM



\- Agenda



\- Empleados



\---



\# REGLA FINAL



Antes de crear una nueva tabla, responder:



¿Realmente es necesaria?



¿Puede resolverse con una relación?



¿Duplica información existente?



Si la respuesta es sí, replantear el diseño.



\---



Fin del documento.

