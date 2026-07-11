\# ==========================================================

\# 43\_ANALISIS\_FINANZAS.md

\# Análisis Funcional del Módulo Finanzas

\# ==========================================================



Versión: 1.0



Estado: En análisis



Origen del análisis:

Archivo "Ventas Picto.ods"



\---



\# Objetivo del módulo



El módulo de Finanzas será el centro del control económico de la empresa.



Su función principal será transformar cada venta realizada en información financiera útil para la toma de decisiones.



No se trata únicamente de registrar ingresos y gastos.



El objetivo es conocer en todo momento:



\- cuánto dinero realmente pertenece al negocio;

\- cuánto debe reservarse para el futuro;

\- cuánto puede utilizar el propietario;

\- cuánto dinero existe disponible para invertir.



\---



\# Filosofía financiera del negocio



La empresa NO administrará su dinero utilizando únicamente el saldo de una cuenta bancaria.



El sistema implementará una metodología basada en "bolsillos financieros".



Cada venta realizada será distribuida automáticamente entre diferentes fondos previamente definidos.



Esta metodología permite que el crecimiento del negocio sea sostenible y evita utilizar dinero destinado a otros fines.



\---



\# Flujo financiero



Cliente



↓



Pedido



↓



Pago



↓



Cálculo del costo



↓



Utilidad Bruta



↓



Distribución automática



↓



Actualización Dashboard



\---



\# Conceptos principales



\## Venta



Valor total pagado por el cliente.



No representa la utilidad.



\---



\## Costos



Valor invertido para fabricar el producto.



Incluye:



\- materia prima

\- impresión

\- empaques

\- otros costos asociados



\---



\## Utilidad Bruta



Representa el dinero disponible para distribuir.



Fórmula



Venta



\-



Costos



=



Utilidad Bruta



\---



\# Bolsillos financieros



La utilidad bruta será distribuida automáticamente.



\## Reinversión



Objetivo



Comprar nuevos insumos.



Ejemplos



\- Mugs

\- Papel

\- Vinilo

\- Tintas

\- Cajas

\- Camisetas



Nunca deberá utilizarse para gastos personales.



\---



\## Mantenimiento



Destinado exclusivamente al mantenimiento preventivo y correctivo de los equipos.



Ejemplos



\- Impresora

\- Plotter

\- Plancha

\- Computador



\---



\## Fondo de Emergencia



Reserva financiera.



Solo deberá utilizarse cuando exista una situación extraordinaria.



Ejemplos



\- Daño inesperado

\- Baja en ventas

\- Compra urgente



\---



\## Disponible para mí



Representa el dinero que realmente puede retirar el propietario.



Este valor será el indicador principal del negocio.



Toda la planificación financiera girará alrededor de este bolsillo.



\---



\# Distribución porcentual



Cada bolsillo tendrá un porcentaje configurable.



Ejemplo



Reinversión



30%



Mantenimiento



10%



Emergencia



15%



Disponible para mí



45%



Los porcentajes podrán modificarse desde Configuración.



No será necesario modificar el código.



> ℹ️ **NOTA DE CONSOLIDACIÓN — Fase 0.5 (2026-07-09), decisión confirmada.** Los porcentajes de este ejemplo (30/10/15/45%) quedan como no vinculantes. El propietario del negocio confirmó los valores semilla reales en 52_SUPABASE_SCHEMA.md: Reinversión 20% · Mantenimiento 10% · Fondo de Emergencia 10% · Disponible para mí 60%.



\---



\# Gastos



El sistema permitirá registrar gastos.



Cada gasto deberá indicar:



\- Fecha

\- Categoría

\- Valor

\- Descripción

\- Bolsillo afectado

\- Responsable



\---



\# Ejemplo



Compra de tintas



↓



Bolsillo



Reinversión



↓



Saldo del bolsillo disminuye



↓



Dashboard actualizado



\---



\# Otro ejemplo



Cambio de resistencia de la plancha



↓



Bolsillo



Mantenimiento



↓



Actualizar saldo



↓



Registrar movimiento



\---



\# Reglas de negocio



Nunca modificar directamente el saldo de un bolsillo.



Todo movimiento deberá quedar registrado.



No eliminar movimientos financieros.



Solo permitir anulaciones.



Registrar fecha y usuario.



\---



\# Movimientos



Cada movimiento financiero tendrá:



\- ID

\- Fecha

\- Tipo

\- Categoría

\- Pedido relacionado (opcional)

\- Bolsillo

\- Valor

\- Observaciones

\- Usuario



\---



\# Indicadores



El Dashboard mostrará:



Saldo Reinversión



Saldo Emergencias



Saldo Mantenimiento



Disponible para mí



Utilidad del mes



Ingresos



Gastos



Rentabilidad



\---



\# Automatizaciones



Cuando un pedido sea entregado y pagado:



Crear automáticamente un ingreso.



Calcular utilidad.



Distribuir utilidad.



Actualizar bolsillos.



Actualizar Dashboard.



Actualizar reportes.



Todo sin intervención del usuario.



\---



\# Relación con otros módulos



Pedidos



↓



Costos



↓



Finanzas



↓



Dashboard



↓



Reportes



Inventario también afectará Finanzas cuando se registren compras de insumos.



\---



\# Problemas encontrados en Google Sheets



Actualmente:



Los movimientos quedan registrados.



Sin embargo:



No existe historial de auditoría.



No existen permisos.



Las fórmulas pueden modificarse accidentalmente.



No existe trazabilidad completa.



No existe conciliación bancaria.



\---



\# Mejoras para la aplicación



Se incorporarán nuevas funcionalidades.



\## Historial completo



Cada movimiento podrá consultarse posteriormente.



\---



\## Filtros



Por fecha.



Por bolsillo.



Por categoría.



Por responsable.



\---



\## Gráficos



Ingresos mensuales.



Gastos mensuales.



Utilidad.



Distribución.



Comparativos.



\---



\## Alertas



Saldo bajo en Reinversión.



Saldo bajo en Emergencias.



Saldo negativo.



Gastos elevados.



\---



\# Información que enviará al Dashboard



Ingresos



Gastos



Utilidad



Disponible para mí



Saldo de bolsillos



Rentabilidad



Comparativos



\---



\# Futuras mejoras (No incluir en V1)



Conciliación bancaria.



Manejo de varias cuentas bancarias.



Centros de costos.



Flujo de caja proyectado.



Facturación electrónica.



Integración con bancos.



\---



\# Criterios de aceptación



El módulo estará completo cuando:



✔ Registre todos los ingresos.



✔ Registre todos los gastos.



✔ Distribuya automáticamente la utilidad.



✔ Actualice los bolsillos.



✔ Permita consultar el historial.



✔ Alimente correctamente el Dashboard.



✔ No requiera cálculos manuales.



\---



\# Observación del análisis



Después de revisar el archivo "Ventas Picto.ods", considero que este módulo representa el mayor valor agregado del sistema.



La lógica de distribución por bolsillos no solo organiza las finanzas, sino que fomenta una administración disciplinada del negocio.



Por esta razón, esta funcionalidad debe mantenerse como uno de los pilares del sistema y será implementada de forma automática, transparente y auditable.



\---



Fin del documento.

