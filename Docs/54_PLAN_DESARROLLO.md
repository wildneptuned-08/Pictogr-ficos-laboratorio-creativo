\# ==========================================================

\# 54\_PLAN\_DESARROLLO.md

\# Plan Maestro de Desarrollo

\# PictoGráficos Laboratorio Creativo

\# ==========================================================



Versión: 1.0



Estado: Oficial



Este documento define el orden obligatorio para el desarrollo del sistema.



Claude Code deberá respetar la secuencia aquí establecida.



No se desarrollarán módulos cuyas dependencias no hayan sido implementadas previamente.



\---



\# OBJETIVO



Construir el sistema de forma ordenada, minimizando retrabajos y garantizando que cada módulo se apoye sobre una base sólida.



\---



\# FILOSOFÍA



Desarrollar primero la infraestructura.



Luego la lógica.



Después los módulos.



Finalmente las optimizaciones.



Nunca desarrollar pantallas aisladas.



\---



\# TECNOLOGÍAS



Frontend



React



TypeScript



Vite



TailwindCSS



Shadcn/UI



React Hook Form



TanStack Query



React Router



Lucide React



Backend



Supabase



PostgreSQL



Supabase Auth



Supabase Storage



Despliegue



Vercel



Repositorio



GitHub



\---



\# ETAPA 1



\## Infraestructura Base



Objetivo



Preparar el entorno de desarrollo.



Actividades



\- Crear repositorio GitHub.

\- Crear proyecto React.

\- Configurar TypeScript.

\- Configurar Vite.

\- Configurar TailwindCSS.

\- Configurar Shadcn/UI.

\- Configurar React Router.

\- Configurar estructura de carpetas.

\- Configurar variables de entorno.

\- Configurar ESLint.

\- Configurar Prettier.

\- Configurar alias de importación.



Criterios de aceptación



✔ Proyecto inicia correctamente.



✔ No existen errores de compilación.



✔ Navegación funcionando.



\---



\# ETAPA 2



\## Supabase



Objetivo



Preparar toda la infraestructura backend.



Actividades



\- Crear proyecto Supabase.

\- Crear tablas.

\- Crear relaciones.

\- Configurar Storage.

\- Configurar Auth.

\- Configurar RLS.

\- Crear índices.

\- Crear funciones SQL.

\- Crear triggers.

\- Crear migraciones.



Criterios



✔ Base de datos completamente funcional.



\---



\# ETAPA 3



\## Arquitectura Frontend



Objetivo



Construir la estructura general.



Actividades



Crear:



AppShell



Sidebar



TopBar



PageHeader



Sistema de navegación



Sistema de rutas



Layouts



Componentes base



Criterios



✔ Aplicación navegable.



✔ Layout responsive.



\---



\# ETAPA 4



\## Servicios



Objetivo



Implementar la capa de negocio.



Actividades



ClienteService



PedidoService



ProductoService



InventarioService



CostoService



FinanzasService



DashboardService



ArchivoService



ConfiguracionService



PresupuestoService



ReporteService



Nota de consolidación (Fase 0.5, 2026-07-09): PresupuestoService y ReporteService estaban definidos en 53_API_CONTRACT.md pero ausentes de esta lista (hallazgo de auditoría I5). Su implementación completa podrá finalizarse en las Etapas 9 y 11 respectivamente, pero deben quedar creados como servicio desde esta etapa para evitar lógica de negocio dispersa fuera de la capa de servicios.



Criterios



✔ Todos los servicios funcionando.



✔ Tipado completo.



\---



\# ETAPA 5



\## Catálogos



Construir:



Clientes



Productos



Servicios



Categorías



Configuración



Objetivo



Preparar la información base.



\---



\# ETAPA 6



\## Pedidos



Implementar:



Registro



Edición



Consulta



Historial



Estados



Pagos



Archivos



Objetivo



Gestionar completamente el ciclo de vida del pedido.



\---



\# ETAPA 7



\## Inventario



Implementar:



Entradas



Salidas



Stock



Alertas



Historial



Stock mínimo



Objetivo



Control total de insumos.



\---



\# ETAPA 8



\## Costos



Implementar:



Costos de materiales



Costos de producción



Rentabilidad



Costo unitario



Recalcular costos



Objetivo



Calcular automáticamente el costo de productos y servicios.



\---



\# ETAPA 9



\## Finanzas



Implementar:



Ingresos



Gastos



Bolsillos



Utilidad



Movimientos



Flujo de caja



Objetivo



Administrar la información financiera.



\---



\# ETAPA 10



\## Dashboard



Construir:



KPIs



Gráficos



Indicadores



Metas



Alertas



Resumen Ejecutivo



Objetivo



Mostrar el estado del negocio en tiempo real.



\---



\# ETAPA 11



\## Reportes



Implementar



Ventas



Pedidos



Inventario



Clientes



Finanzas



Costos



Dashboard



Exportaciones PDF



Exportaciones Excel



(V2)



\---



\# ETAPA 12



\## Optimización



Revisar



Consultas



Componentes



Rendimiento



Responsive



Accesibilidad



SEO básico



Carga diferida



\---



\# ETAPA 13



\## Pruebas



Validar



Pedidos



Inventario



Finanzas



Dashboard



Servicios



Reportes



Integridad de datos



\---



\# ETAPA 14



\## Despliegue



Actividades



Publicar en Vercel.



Configurar dominio.



Configurar variables de entorno.



Pruebas finales.



Documentación.



\---



\# ORDEN OBLIGATORIO



Nunca implementar:



Dashboard



Antes de



Pedidos.



Nunca implementar:



Finanzas



Antes de



Pedidos.



Nunca implementar:



Inventario



Antes de



Productos.



Nunca implementar:



Reportes



Antes de



Dashboard.



\---



\# REGLAS



No saltar etapas.



No desarrollar módulos incompletos.



Cada etapa deberá quedar completamente terminada antes de iniciar la siguiente.



\---



\# CONTROL DE CALIDAD



Cada módulo deberá cumplir:



Responsive.



Tipado TypeScript.



Accesibilidad.



Diseño consistente.



Validaciones.



Mensajes claros.



Código reutilizable.



Sin errores de consola.



\---



\# ENTREGABLES



Cada etapa deberá incluir:



Código.



Pruebas.



Documentación actualizada.



Commits descriptivos.



\---



\# GESTIÓN DE GIT



Rama principal



main



Desarrollo



develop



Cada módulo importante podrá desarrollarse en una rama feature.



Ejemplo



feature/pedidos



feature/inventario



feature/dashboard



Una vez validado:



Merge hacia develop.



Finalmente:



Merge hacia main.



\---



\# CRITERIOS DE FINALIZACIÓN



La Versión 1 estará terminada cuando:



✔ Todos los módulos funcionen.



✔ La información sea consistente.



✔ El Dashboard refleje datos reales.



✔ No existan errores críticos.



✔ El sistema esté desplegado.



✔ La documentación esté actualizada.



\---



\# CONCLUSIÓN



Este documento define el orden oficial de construcción del sistema.



Seguir esta planificación garantizará un desarrollo organizado, reduciendo retrabajos y permitiendo que cada módulo se apoye sobre una base técnica estable.



Ninguna etapa deberá omitirse ni alterarse sin una justificación técnica y funcional.



\---



Fin del documento.

