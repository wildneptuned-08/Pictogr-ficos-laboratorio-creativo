\# ==========================================================

\# 42\_ANALISIS\_PRESUPUESTO.md

\# Análisis Funcional del Módulo Presupuesto

\# ==========================================================



Versión: 1.0



Estado: En análisis



Origen del análisis:

Archivo "Ventas Picto.ods"



\---



\# Objetivo del módulo



El módulo Presupuesto tiene como finalidad definir las metas económicas del negocio y servir como punto de referencia para medir el desempeño de las ventas.



No es un módulo financiero.



Es un módulo de planificación.



Todas las métricas del Dashboard dependerán de esta información.



\---



\# Objetivos del negocio



Este módulo busca responder preguntas como:



¿Cuánto dinero debe generar el negocio este mes?



¿Cuánto dinero debe generar diariamente?



¿Qué porcentaje de la meta ya fue alcanzado?



¿Cuánto falta para cumplir el objetivo?



¿Cuál debería ser el ritmo de ventas para cumplir el presupuesto?



\---



\# Información observada



Actualmente la hoja contiene la planificación financiera del negocio.



Esta información sirve como base para:



\- Dashboard

\- Finanzas

\- Indicadores

\- Cumplimiento de metas



\---



\# Problema actual



Google Sheets cumple la función.



Sin embargo:



\- No existe historial de cambios.

\- No existen validaciones.

\- Las fórmulas pueden modificarse accidentalmente.

\- No existe trazabilidad.

\- No hay indicadores visuales modernos.



\---



\# Objetivo de la migración



Convertir esta hoja en un módulo inteligente.



No solamente almacenar metas.



También generar indicadores automáticamente.



\---



\# Información que administrará



\## Presupuesto mensual



Representa el objetivo principal del negocio.



Ejemplo



Disponible para mí



$2.500.000



\---



\## Meta semanal



Se calculará automáticamente.



Ejemplo



Meta mensual



↓



Número de semanas



↓



Meta semanal



\---



\## Meta quincenal



Derivada del presupuesto mensual.



\---



\## Meta diaria



La aplicación calculará automáticamente la meta diaria considerando:



\- Días del mes

\- Días hábiles (configurable)

\- Ventas acumuladas



\---



\# Indicadores derivados



A partir del presupuesto el sistema calculará automáticamente:



\## Cumplimiento mensual



Ejemplo



Meta



$2.500.000



Ventas actuales



$1.650.000



Cumplimiento



66%



\---



\## Valor pendiente



Ejemplo



Meta



2.500.000



Actual



1.650.000



Faltan



850.000



\---



\## Promedio diario requerido



El sistema calculará automáticamente cuánto debe venderse diariamente para cumplir la meta.



\---



\## Proyección de cierre



Basándose en el comportamiento actual.



Ejemplo



Si continúa el ritmo actual...



Proyección



2.980.000



Meta cumplida



119%



\---



\# Relación con otros módulos



Este módulo alimentará directamente:



Dashboard



↓



Indicadores



↓



Reportes



↓



Finanzas



No debe depender de Inventario.



No debe depender de Costos.



\---



\# Automatizaciones



Cuando se registre un nuevo pedido entregado y pagado:



Actualizar automáticamente:



\- Ventas acumuladas

\- Cumplimiento

\- Valor restante

\- Promedio diario

\- Proyección mensual



Sin intervención del usuario.



\---



\# Datos que deberán almacenarse



Cada presupuesto deberá registrar:



\- Año

\- Mes

\- Meta mensual

\- Meta quincenal

\- Meta semanal

\- Meta diaria

\- Observaciones

\- Fecha de creación

\- Fecha de actualización



\---



\# Reglas de negocio



Solo puede existir un presupuesto activo por mes.



No eliminar presupuestos antiguos.



Permitir consultar años anteriores.



Registrar historial de modificaciones.



\---



\# Mejoras propuestas



Actualmente el presupuesto es un valor estático.



La aplicación agregará:



✔ Comparativos mensuales.



✔ Comparativos anuales.



✔ Evolución histórica.



✔ Tendencias.



✔ Alertas cuando el cumplimiento sea inferior al esperado.



✔ Indicadores visuales.



✔ Barras de progreso.



✔ Tarjetas KPI.



✔ Proyecciones automáticas.



\---



\# Información para el Dashboard



Este módulo enviará al Dashboard:



\- Meta mensual

\- Ventas actuales

\- Cumplimiento

\- Valor restante

\- Promedio diario

\- Proyección

\- Estado de la meta



\---



\# Beneficios esperados



El propietario podrá conocer en segundos:



\- Si el negocio va bien.

\- Si debe vender más.

\- Cuánto falta para cumplir el objetivo.

\- Cuál debe ser el esfuerzo diario.

\- Si la proyección mensual es positiva.



\---



\# Futuras mejoras (No incluir en la V1)



\- Múltiples presupuestos por línea de negocio.

\- Presupuesto por categoría.

\- Presupuesto por producto.

\- Presupuesto por temporada.

\- Inteligencia artificial para predicción de ventas.



\---



\# Criterios de aceptación



El módulo estará completo cuando:



✔ Permita registrar el presupuesto mensual.



✔ Calcule automáticamente todas las metas derivadas.



✔ Actualice los indicadores al registrar ventas.



✔ Alimente correctamente el Dashboard.



✔ Permita consultar presupuestos históricos.



✔ No requiera cálculos manuales.



\---



Fin del documento.

