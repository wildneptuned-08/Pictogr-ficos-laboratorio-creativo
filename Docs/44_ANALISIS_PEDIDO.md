\# ==========================================================

\# 44\_ANALISIS\_PEDIDO.md

\# Análisis Funcional del Módulo Pedidos

\# ==========================================================



Versión: 1.0



Estado: En análisis



Origen del análisis:

Archivo "Ventas Picto.ods"



> ℹ️ **NOTA DE CONSOLIDACIÓN — Fase 0.5 (2026-07-09), decisión confirmada.** Los "Estados del pedido" propuestos en este documento (11 estados, sección más abajo) fueron una de tres alternativas evaluadas para resolver el hallazgo de auditoría C5. El propietario del negocio confirmó el ENUM de 6 estados de 52\_SUPABASE\_SCHEMA.md (Nuevo, Diseño, Producción, Listo, Entregado, Cancelado); la propuesta de 11 estados de este documento queda descartada para la V1.



\---



\# Objetivo



El módulo Pedidos será el núcleo operativo del sistema.



Todo comenzará aquí.



Cada pedido representará un trabajo solicitado por un cliente y será el punto de partida para:



\- Producción

\- Finanzas

\- Dashboard

\- Reportes

\- Historial del Cliente

\- Costos

\- Inventario



Ningún módulo generará información si no existe un pedido.



\---



\# Situación actual



Actualmente los pedidos llegan por:



\- WhatsApp Business



Posteriormente la información se registra manualmente en Google Sheets.



Esto funciona correctamente, pero presenta varios riesgos.



\---



\# Problemas encontrados



Durante el análisis del archivo se identificaron los siguientes problemas.



\## Riesgo de olvidar pedidos



Si un chat queda leído y no se registra inmediatamente, el pedido puede olvidarse.



\---



\## Información distribuida



Los datos del pedido terminan relacionados con varias hojas.



Aunque Google Sheets funciona, la trazabilidad depende de fórmulas.



\---



\## Seguimiento manual



El estado del pedido depende completamente del usuario.



No existen recordatorios.



No existen alertas.



\---



\## Sin historial



No existe un historial detallado de cambios.



No puede conocerse:



\- quién modificó

\- cuándo modificó

\- qué modificó



\---



\# Objetivo del nuevo módulo



Registrar absolutamente todos los pedidos.



Desde el primer contacto del cliente hasta la entrega final.



\---



\# Flujo del negocio



Cliente



↓



WhatsApp



↓



Crear Pedido



↓



Registrar Cliente



↓



Seleccionar Producto



↓



Registrar Diseño



↓



Registrar Anticipo



↓



Producción



↓



Pedido Listo



↓



Entrega



↓



Pago Final



↓



Actualizar Finanzas



↓



Actualizar Dashboard



↓



Actualizar Reportes



\---



\# Información observada



Durante el análisis del archivo se identificó que actualmente se registra información como:



Cliente



Celular



Producto



Cantidad



Dimensiones



Observaciones



Fecha del pedido



Fecha de entrega



Estado



Precio



Abonos



Saldo



Método de pago



Esta estructura servirá como base para la aplicación.



\---



\# Información adicional propuesta



La aplicación incorporará nuevos campos.



Número de pedido



Código interno



Prioridad



Responsable



Canal de ingreso



Tiempo estimado



Tiempo real



Fecha de inicio



Fecha de finalización



Archivos del diseño



Fotografía del producto terminado



Notas internas



\---



\# Estados del pedido



Se propone el siguiente flujo.



Nuevo



↓



Pendiente de Diseño



↓



Diseño Aprobado



↓



En Producción



↓



Control de Calidad



↓



Listo para Entrega



↓



Entregado



↓



Finalizado



\---



Estados especiales



Cancelado



Suspendido



En espera de información



\---



\# Prioridades



Cada pedido podrá clasificarse como:



Alta



Media



Baja



Urgente



Esto permitirá organizar la producción.



\---



\# Cliente



Si el cliente no existe.



El sistema deberá crearlo automáticamente.



Si ya existe.



Solo se asociará al pedido.



No duplicar clientes.



\---



\# Productos



Cada pedido podrá contener uno o varios productos.



Ejemplo



Pedido



↓



2 Mugs



↓



1 Camiseta



↓



1 Llavero



Todo dentro del mismo pedido.



\---



\# Archivos



Cada pedido podrá almacenar.



Imagen enviada por el cliente.



Logo.



Diseño editable.



PDF.



PNG.



JPG.



Mockup.



Estos archivos se almacenarán en Supabase Storage.



\---



\# Pagos



Cada pedido podrá registrar.



Anticipo.



Segundo pago.



Pago final.



Saldo pendiente.



Método de pago.



Fecha del pago.



Comprobante.



\---



\# Producción



El pedido permitirá registrar.



Inicio de producción.



Finalización.



Responsable.



Observaciones.



Tiempo empleado.



\---



\# Entrega



Registrar.



Fecha prometida.



Fecha real.



Tipo de entrega.



Recogido.



Enviado.



Domicilio.



Observaciones.



\---



\# Automatizaciones



Al crear el pedido.



Generar número consecutivo.



Registrar fecha.



Registrar hora.



Crear historial.



\---



Al registrar el anticipo.



Actualizar saldo.



Actualizar Dashboard.



\---



Al finalizar el pedido.



Actualizar Finanzas.



Actualizar Inventario.



Actualizar Costos.



Actualizar Dashboard.



Actualizar Reportes.



Actualizar historial del cliente.



Todo automáticamente.



\---



\# Integración con Inventario



Cuando un pedido utilice materiales.



El sistema descontará automáticamente.



Ejemplo



Pedido



↓



2 mugs



↓



Inventario



\-2 mugs



\---



\# Integración con Costos



Cada pedido calculará automáticamente.



Costo de materiales.



Costo de impresión.



Costo total.



Utilidad.



Rentabilidad.



\---



\# Integración con Finanzas



Al recibir pagos.



Crear movimiento financiero.



Actualizar ingresos.



Actualizar bolsillos.



\---



\# Integración con Dashboard



Actualizar.



Ventas.



Pedidos pendientes.



Pedidos entregados.



Pedidos del día.



Clientes nuevos.



Utilidad.



\---



\# Búsquedas



Buscar por.



Número de pedido.



Cliente.



Teléfono.



Producto.



Estado.



Fecha.



Responsable.



\---



\# Filtros



Hoy.



Esta semana.



Este mes.



Pendientes.



Entregados.



Urgentes.



Cancelados.



\---



\# Indicadores



Total pedidos.



Pedidos pendientes.



Pedidos entregados.



Tiempo promedio de entrega.



Ventas generadas.



Productos más vendidos.



\---



\# Problemas resueltos



Con este módulo desaparecerán.



Pedidos olvidados.



Duplicidad.



Errores manuales.



Desorganización.



Pérdida de información.



\---



\# Futuras mejoras



No implementar en la V1.



Seguimiento por WhatsApp.



Firma digital.



Notificaciones automáticas.



Recordatorios.



Calendario de producción.



Agenda.



Código QR.



Portal para clientes.



\---



\# Criterios de aceptación



El módulo estará completo cuando.



✔ Sea posible registrar un pedido en menos de dos minutos.



✔ Toda la información quede centralizada.



✔ El Dashboard se actualice automáticamente.



✔ Finanzas se actualice automáticamente.



✔ Inventario se actualice automáticamente.



✔ Costos se actualicen automáticamente.



✔ El historial del cliente se actualice automáticamente.



✔ No existan pedidos perdidos.



\---



\# Conclusiones del análisis



Después de analizar la hoja "Pedidos" del archivo Ventas Picto.ods, se concluye que este módulo representa el proceso central del negocio.



Todos los demás módulos dependerán directa o indirectamente de la información generada aquí.



Por este motivo, el desarrollo deberá comenzar por este módulo y asegurar que todas sus reglas de negocio queden correctamente implementadas antes de desarrollar funcionalidades adicionales.



\---



Fin del documento.

