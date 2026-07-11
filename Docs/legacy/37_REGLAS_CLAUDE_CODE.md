> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **57_GUIA_CLAUDE_CODE.md**.
> Motivo: reglas para el agente de desarrollo duplicadas y parcialmente contradictorias con 57 (stack, orden de módulos, estructura de carpetas). Hallazgo de auditoría: C4.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo ni para gobernar el comportamiento del agente.
>
> ---

\# ==========================================================

\# 37\_REGLAS\_CLAUDE\_CODE.md

\# Reglas Permanentes para Claude Code

\# ==========================================================



Versión: 1.0



Estado: Activo



Este documento define las reglas obligatorias que Claude Code deberá respetar durante todo el ciclo de vida del proyecto.



Estas reglas tienen prioridad sobre cualquier sugerencia automática del modelo.



\---



\# 1. PRINCIPIO GENERAL



El objetivo principal NO es escribir más código.



El objetivo principal es desarrollar una aplicación estable, mantenible, fácil de usar y alineada con las necesidades reales del negocio.



Toda decisión deberá justificarse desde el punto de vista del negocio.



\---



\# 2. REGLA MÁS IMPORTANTE



Antes de modificar cualquier archivo, Claude Code deberá comprender:



\- Qué problema intenta resolver.

\- Qué módulos se verán afectados.

\- Qué dependencias existen.

\- Qué impacto tendrá el cambio.



Nunca realizar modificaciones masivas sin comprender el contexto.



\---



\# 3. MODIFICACIONES DE CÓDIGO



Claude Code deberá:



✅ Modificar únicamente los archivos necesarios.



✅ Conservar la estructura existente.



✅ Evitar cambios innecesarios.



✅ Mantener compatibilidad con el resto del sistema.



No deberá reescribir módulos completos cuando una modificación puntual sea suficiente.



\---



\# 4. ARQUITECTURA



Respetar siempre la arquitectura definida.



No crear nuevas carpetas sin necesidad.



No mover archivos existentes sin justificación.



No cambiar nombres de carpetas.



No cambiar nombres de módulos.



No cambiar convenciones del proyecto.



\---



\# 5. COMPONENTES



Todos los componentes deberán ser:



\- reutilizables

\- pequeños

\- fáciles de mantener

\- desacoplados



Evitar componentes gigantes.



Si un componente supera aproximadamente 300 líneas, evaluar dividirlo.



\---



\# 6. RESPONSABILIDAD ÚNICA



Cada componente deberá tener una única responsabilidad.



Ejemplos:



Un botón no consulta la base de datos.



Una tabla no calcula indicadores.



Una tarjeta KPI no modifica información.



Separar presentación y lógica.



\---



\# 7. LÓGICA DE NEGOCIO



Nunca colocar reglas de negocio dentro de componentes visuales.



Toda lógica deberá estar aislada.



Ejemplo:



Correcto



UI

↓



Servicio



↓



Supabase



Incorrecto



UI



↓



Consultas SQL



\---



\# 8. BASE DE DATOS



Toda operación deberá realizarse utilizando Supabase.



No crear múltiples fuentes de verdad.



La base de datos será el origen oficial de la información.



\---



\# 9. GOOGLE SHEETS



Google Sheets únicamente será utilizado durante la migración inicial.



No desarrollar nuevas funcionalidades dependiendo de Google Sheets.



\---



\# 10. TYPECRIPT



Todo el proyecto utilizará TypeScript.



No utilizar JavaScript plano.



Evitar el uso de "any".



Preferir tipos e interfaces bien definidos.



\---



\# 11. VALIDACIONES



Toda información ingresada por el usuario deberá validarse.



Utilizar:



\- Zod

\- React Hook Form



No confiar únicamente en validaciones visuales.



\---



\# 12. RENDIMIENTO



Evitar:



Consultas repetidas.



Renderizados innecesarios.



Componentes muy pesados.



Calcular únicamente lo necesario.



\---



\# 13. EXPERIENCIA DE USUARIO



La aplicación deberá responder rápidamente.



Siempre mostrar:



\- Loading

\- Éxito

\- Error

\- Confirmación



Nunca dejar al usuario sin retroalimentación.



\---



\# 14. INTERFAZ



El diseño deberá mantenerse consistente.



Utilizar el Design System del proyecto.



No inventar estilos diferentes para cada módulo.



Reutilizar componentes.



\---



\# 15. COLORES



Utilizar una paleta consistente.



Evitar exceso de colores.



Dar prioridad a la legibilidad.



\---



\# 16. ICONOS



Utilizar una única librería de iconos.



Mantener el mismo estilo visual.



\---



\# 17. TABLAS



Todas las tablas deberán:



Permitir búsqueda.



Permitir ordenamiento.



Permitir filtros.



Mantener paginación cuando sea necesario.



\---



\# 18. FORMULARIOS



Todos los formularios deberán:



Mostrar errores claramente.



Marcar campos obligatorios.



Validar antes de guardar.



No perder información escrita.



\---



\# 19. MENSAJES



Los mensajes deben ser claros.



Incorrecto:



"Error 500"



Correcto:



"No fue posible guardar el pedido. Inténtalo nuevamente."



\---



\# 20. MODULARIDAD



Cada módulo será independiente.



Dashboard



Pedidos



Clientes



Inventario



Finanzas



Costos



Presupuesto



Reportes



Configuración



Ningún módulo deberá depender completamente de otro.



\---



\# 21. REUTILIZACIÓN



Antes de crear un nuevo componente, verificar si ya existe uno similar.



Evitar duplicar:



Botones.



Inputs.



Modales.



Tablas.



Tarjetas.



Badges.



Alertas.



\---



\# 22. NOMENCLATURA



Utilizar nombres claros.



Correcto



CustomerTable.tsx



Incorrecto



TablaNueva2.tsx



\---



\# 23. VARIABLES



Evitar nombres genéricos.



Incorrecto



data



obj



item



Correcto



customerList



pendingOrders



inventoryStock



\---



\# 24. COMENTARIOS



Comentar únicamente cuando sea necesario explicar decisiones importantes.



No comentar código evidente.



\---



\# 25. DEPENDENCIAS



No instalar nuevas librerías sin justificar:



\- qué problema resuelven

\- ventajas

\- desventajas

\- impacto



Siempre priorizar las herramientas ya aprobadas.



\---



\# 26. SEGURIDAD



Nunca escribir:



URLs privadas.



API Keys.



Service Role Keys.



Contraseñas.



Tokens.



Todo deberá utilizar variables de entorno.



\---



\# 27. CONTROL DE CAMBIOS



Antes de modificar un módulo existente:



Explicar:



\- Qué se modificará.

\- Por qué.

\- Qué archivos cambiarán.

\- Qué impacto tendrá.



\---



\# 28. FINALIZAR UNA TAREA



Antes de considerar terminada una tarea verificar:



✓ Compila correctamente.



✓ No rompe otros módulos.



✓ Sigue las reglas del proyecto.



✓ Mantiene consistencia visual.



✓ Mantiene rendimiento.



✓ Mantiene reutilización.



✓ Mantiene accesibilidad.



\---



\# 29. SI EXISTEN DUDAS



No asumir.



Preguntar.



Es mejor solicitar una aclaración que implementar una funcionalidad incorrecta.



\---



\# 30. FILOSOFÍA FINAL



Este proyecto no busca únicamente desarrollar software.



Busca construir una herramienta que facilite la administración diaria de una empresa de artes gráficas.



Cada decisión deberá aportar simplicidad, estabilidad y valor para el negocio.



\---



Fin del documento.

