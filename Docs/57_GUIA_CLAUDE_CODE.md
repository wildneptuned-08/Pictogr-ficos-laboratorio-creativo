\# ==========================================================

\# 57\_GUIA\_CLAUDE\_CODE.md

\# Guía Oficial para Claude Code

\# PictoGráficos Laboratorio Creativo

\# ==========================================================



Versión: 1.0



Estado: Oficial



Este documento define las reglas que Claude Code deberá seguir durante todo el desarrollo del sistema.



Es el primer documento que deberá consultarse antes de comenzar cualquier implementación.



Todas las decisiones técnicas deberán respetar la documentación existente.



\---



\# MISIÓN



Construir una aplicación profesional, moderna, estable y fácil de mantener.



El objetivo NO es escribir código rápidamente.



El objetivo es construir correctamente desde la primera vez.



\---



\# OBJETIVO PRINCIPAL



Toda implementación deberá respetar:



La arquitectura.



La documentación.



Las reglas del negocio.



El Design System.



Los estándares de desarrollo.



La experiencia del usuario.



\---



\# ORDEN OBLIGATORIO DE LECTURA



Antes de comenzar cualquier desarrollo, Claude Code deberá leer la documentación en el siguiente orden:



1\. 57\_GUIA\_CLAUDE\_CODE.md



2\. 50\_FILOSOFIA\_DEL\_SISTEMA.md



3\. 54\_PLAN\_DESARROLLO.md



4\. 56\_ESTANDARES\_DESARROLLO.md



5\. 08\_DESIGN\_SYSTEM.md



6\. 51\_COMPONENTES\_UI.md



7\. 52\_SUPABASE\_SCHEMA.md



8\. 53\_API\_CONTRACT.md



9\. Todos los documentos funcionales correspondientes al módulo que se desarrollará.



Nunca comenzar un módulo sin haber leído previamente toda la documentación relacionada.



\---



\# JERARQUÍA DE DOCUMENTOS



En caso de conflicto entre documentos, la prioridad será:



1\. Filosofía del Sistema



2\. Arquitectura General (ver README.md, sección "Arquitectura". El documento dedicado 04\_ARQUITECTURA\_GENERAL.md fue archivado en `legacy/` durante la Fase 0.5 de Consolidación Documental por describir un stack no oficial — Next.js — contradictorio con el stack vigente. No debe consultarse.)



3\. Plan de Desarrollo



4\. Estándares de Desarrollo



5\. Design System



6\. Componentes UI



7\. Supabase Schema



8\. API Contract



9\. Documentación Funcional



10\. README



Siempre prevalecerá el documento de mayor jerarquía.



\---



\# PRINCIPIO FUNDAMENTAL



La documentación es la fuente oficial de verdad.



Nunca asumir reglas de negocio.



Nunca inventar funcionalidades.



Nunca modificar la arquitectura por iniciativa propia.



\---



\# ANTES DE ESCRIBIR CÓDIGO



Claude Code deberá verificar:



✔ Qué problema se está resolviendo.



✔ Qué documentos aplican.



✔ Qué componentes ya existen.



✔ Qué servicios ya existen.



✔ Qué tablas ya existen.



✔ Qué reglas del negocio existen.



Si existe información suficiente:



Implementar.



Si existe información contradictoria:



Detenerse y solicitar aclaración.



\---



\# DURANTE EL DESARROLLO



Siempre reutilizar:



Componentes.



Hooks.



Servicios.



Tipos.



Utilidades.



Nunca duplicar código.



\---



\# MODIFICACIONES



Antes de modificar un archivo existente:



Analizar su impacto.



Verificar dependencias.



Confirmar que no rompe otros módulos.



Mantener compatibilidad.



\---



\# PROHIBICIONES



Nunca:



Cambiar la arquitectura.



Renombrar tablas.



Renombrar componentes.



Cambiar nombres de servicios.



Modificar reglas de negocio.



Eliminar documentación.



Crear dependencias innecesarias.



Crear componentes duplicados.



Agregar librerías sin justificación.



\---



\# REGLAS DE DISEÑO



Toda interfaz deberá respetar:



08\_DESIGN\_SYSTEM.md



51\_COMPONENTES\_UI.md



No crear estilos nuevos cuando exista un componente reutilizable.



\---



\# REGLAS DE BASE DE DATOS



Toda modificación deberá respetar:



52\_SUPABASE\_SCHEMA.md



Nunca modificar la base de datos manualmente.



Toda modificación deberá realizarse mediante migraciones.



\---



\# REGLAS DE NEGOCIO



Toda regla funcional deberá provenir exclusivamente de la documentación funcional.



Nunca inferir procesos.



Nunca asumir comportamientos.



\---



\# REUTILIZACIÓN



Antes de crear cualquier elemento responder:



¿Existe ya?



Si la respuesta es SI.



Reutilizar.



Si la respuesta es NO.



Crear siguiendo los estándares.



\---



\# IMPLEMENTACIÓN



Desarrollar únicamente el módulo solicitado.



No adelantarse a módulos futuros.



No agregar funcionalidades no solicitadas.



\---



\# COMUNICACIÓN



Cuando una implementación esté terminada:



Explicar:



Qué se desarrolló.



Qué archivos fueron modificados.



Qué decisiones técnicas se tomaron.



Qué quedó pendiente.



\---



\# VALIDACIONES



Antes de finalizar cualquier tarea verificar:



✔ Sin errores TypeScript.



✔ Sin errores ESLint.



✔ Sin errores de compilación.



✔ Responsive.



✔ Accesibilidad.



✔ Servicios funcionando.



✔ Componentes reutilizados.



✔ Sin código duplicado.



✔ Sin console.log.



✔ Sin archivos temporales.



\---



\# SI EXISTE UNA DUDA



Nunca asumir.



Solicitar aclaración.



Esperar respuesta.



Continuar únicamente cuando exista información suficiente.



\---



\# OPTIMIZACIÓN



No optimizar prematuramente.



Primero:



Funcionalidad.



Luego:



Legibilidad.



Finalmente:



Rendimiento.



\---



\# DOCUMENTACIÓN



Si una decisión modifica el funcionamiento del sistema:



Actualizar primero el documento correspondiente.



Después actualizar el código.



La documentación siempre tendrá prioridad.



\---



\# CRITERIOS DE ÉXITO



Cada módulo desarrollado deberá cumplir:



Respeta la arquitectura.



Respeta la documentación.



Respeta el Design System.



Respeta los estándares.



No rompe funcionalidades existentes.



Es reutilizable.



Es fácil de mantener.



\---



\# FILOSOFÍA FINAL



Construir menos.



Construir mejor.



Una funcionalidad completamente terminada tiene mayor valor que varias funcionalidades incompletas.



La calidad siempre tendrá prioridad sobre la velocidad.



\---



\# MENSAJE PARA CLAUDE CODE



Este proyecto representa la operación diaria de una empresa real.



Cada decisión de desarrollo impactará directamente en la administración del negocio.



Por esta razón, toda implementación deberá realizarse con el mismo nivel de calidad que un software comercial.



No eres únicamente un generador de código.



Eres el arquitecto encargado de construir una herramienta que deberá ser utilizada todos los días.



La documentación existente constituye el contrato oficial del proyecto y deberá respetarse en todo momento.



\---



Fin del documento.

