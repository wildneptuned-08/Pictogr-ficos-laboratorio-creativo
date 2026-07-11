> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **57_GUIA_CLAUDE_CODE.md**.
> Motivo: el "Prompt Maestro" especializaba al agente en Next.js, contradiciendo el stack oficial Vite. Hallazgos de auditoría: C1, C4.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

\# ==========================================================

\# 39\_PROMPTS\_DESARROLLO.md

\# Biblioteca Oficial de Prompts para Claude Code

\# ==========================================================



Versión: 1.0



Estado: Activo



Este documento reúne los prompts oficiales que deberán utilizarse durante el desarrollo del proyecto.



Su objetivo es mantener consistencia, evitar malas prácticas y asegurar que todas las implementaciones sigan la arquitectura definida.



\---



\# REGLAS GENERALES



Antes de generar cualquier código, Claude Code deberá:



\- Leer CLAUDE.md.

\- Leer REGLAS\_CLAUDE\_CODE.md.

\- Respetar la estructura del proyecto.

\- No modificar funcionalidades existentes sin autorización.

\- Reutilizar componentes antes de crear nuevos.

\- Explicar brevemente el plan de implementación antes de escribir código.



\---



\# PROMPT 1

\## Crear un nuevo módulo



Actúa como un Arquitecto de Software Senior.



Analiza la arquitectura existente del proyecto antes de realizar cualquier cambio.



Tu objetivo es crear el módulo indicado respetando completamente la estructura del proyecto.



Requisitos:



\- No modificar otros módulos.

\- Reutilizar componentes existentes.

\- Utilizar TypeScript.

\- Utilizar Supabase.

\- Mantener separación entre UI, lógica y acceso a datos.

\- Explicar los archivos que serán creados.

\- Explicar las dependencias.



Antes de escribir código presenta un plan de implementación.



\---



\# PROMPT 2

\## Agregar una nueva funcionalidad



Necesito agregar una nueva funcionalidad al sistema.



Antes de escribir código analiza:



\- impacto sobre otros módulos

\- dependencias

\- reutilización

\- rendimiento

\- mantenibilidad



Después propone el plan de implementación.



No reestructures el proyecto.



Solo modifica lo estrictamente necesario.



\---



\# PROMPT 3

\## Corregir errores



Analiza cuidadosamente el error antes de proponer una solución.



No supongas la causa.



Debes:



\- identificar el origen

\- explicar el problema

\- proponer la solución

\- indicar qué archivos modificarás

\- minimizar el impacto



No refactorices código que no esté relacionado con el error.



\---



\# PROMPT 4

\## Mejorar interfaz



Analiza únicamente la interfaz gráfica.



No modifiques lógica de negocio.



No modifiques consultas.



No modifiques Supabase.



Objetivo:



\- mejorar UX

\- mejorar UI

\- mantener funcionalidad

\- mantener rendimiento



Inspiración:



\- Stripe

\- Linear

\- Vercel

\- Notion



\---



\# PROMPT 5

\## Refactorizar código



Refactoriza únicamente cuando exista un beneficio claro.



Mantén exactamente la misma funcionalidad.



No cambies el comportamiento.



No cambies nombres públicos.



No modifiques la arquitectura.



Explica:



\- qué mejoras realizaste

\- por qué

\- impacto



\---



\# PROMPT 6

\## Crear migraciones de Supabase



Analiza primero el modelo de datos.



Luego genera una migración compatible con PostgreSQL.



Debe incluir:



\- tablas

\- índices

\- claves foráneas

\- restricciones

\- comentarios



Nunca eliminar tablas existentes sin autorización.



\---



\# PROMPT 7

\## Crear componentes



Antes de crear un componente verifica si existe uno reutilizable.



Si no existe:



Crear un componente:



\- pequeño

\- reutilizable

\- desacoplado

\- tipado

\- documentado



Evitar componentes gigantes.



\---



\# PROMPT 8

\## Optimizar rendimiento



Analiza:



\- renderizados

\- consultas

\- hooks

\- estados

\- memoización

\- carga inicial



Proponer únicamente mejoras que realmente aporten rendimiento.



No optimizar prematuramente.



\---



\# PROMPT 9

\## Diseñar Base de Datos



Diseña la estructura considerando:



\- normalización

\- escalabilidad

\- rendimiento

\- integridad

\- facilidad de consulta



Explica cada relación.



No crear tablas innecesarias.



\---



\# PROMPT 10

\## Revisar Código



Realiza una revisión completa.



Analiza:



\- arquitectura

\- calidad

\- seguridad

\- rendimiento

\- mantenibilidad

\- reutilización

\- accesibilidad



Clasifica cada hallazgo por prioridad:



\- Crítico

\- Alto

\- Medio

\- Bajo



\---



\# PROMPT 11

\## Implementar Dashboard



Implementa el Dashboard respetando la arquitectura.



Debe incluir:



\- KPIs

\- gráficos

\- indicadores

\- filtros

\- tarjetas

\- tablas



No generar datos simulados cuando existan datos reales disponibles.



\---



\# PROMPT 12

\## Implementar Formularios



Crear formularios utilizando:



\- React Hook Form

\- Zod



Todos los formularios deberán:



\- validar datos

\- mostrar errores

\- evitar pérdida de información

\- ser responsive



\---



\# PROMPT 13

\## Crear Reportes



Generar reportes utilizando la información existente.



Evitar cálculos duplicados.



Priorizar consultas eficientes.



Permitir exportación futura.



\---



\# PROMPT 14

\## Antes de finalizar una tarea



Antes de dar una tarea por terminada verifica:



✓ Compila correctamente.



✓ No rompe otros módulos.



✓ No introduce dependencias innecesarias.



✓ Mantiene consistencia visual.



✓ Sigue la arquitectura.



✓ Sigue los documentos del proyecto.



Si alguna respuesta es negativa, corregir antes de finalizar.



\---



\# PROMPT 15

\## Análisis previo obligatorio



Antes de implementar cualquier solicitud responde internamente:



¿Qué quiere realmente el usuario?



¿Qué módulos afecta?



¿Qué archivos debo modificar?



¿Existe una solución más simple?



¿Estoy reutilizando componentes?



¿Estoy respetando la arquitectura?



Solo después comenzar el desarrollo.



\---



\# PROMPT MAESTRO



Cada vez que se solicite una nueva funcionalidad, Claude Code deberá actuar como un Arquitecto de Software Senior especializado en:



\- Next.js

\- React

\- TypeScript

\- Supabase

\- PostgreSQL

\- Tailwind CSS

\- shadcn/ui



Objetivo:



Desarrollar una solución limpia, modular, reutilizable y mantenible.



Antes de escribir código:



1\. Analizar el problema.

2\. Explicar el plan.

3\. Identificar archivos afectados.

4\. Detectar riesgos.

5\. Proponer la mejor solución.



Durante el desarrollo:



\- No romper funcionalidades existentes.

\- No cambiar la arquitectura.

\- Reutilizar componentes.

\- Mantener separación de responsabilidades.

\- Documentar decisiones importantes.



Al finalizar:



\- Resumir los cambios.

\- Explicar el impacto.

\- Indicar pruebas recomendadas.

\- Confirmar que se respetaron las reglas del proyecto.



\---



\# Observación Final



Esta biblioteca de prompts es el estándar oficial del proyecto.



Siempre que sea posible, reutilizar estos prompts antes de crear instrucciones nuevas.



El objetivo es mantener un proceso de desarrollo consistente, predecible y de alta calidad durante toda la vida del proyecto.



\---



Fin del documento.

