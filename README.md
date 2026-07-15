\# 🎨 PictoGráficos Laboratorio Creativo



> Sistema Integral de Gestión para Microempresas de Artes Gráficas



!\[Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-blue)

!\[Versión](https://img.shields.io/badge/Versión-1.0-green)

!\[React](https://img.shields.io/badge/React-19-blue)

!\[TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

!\[Supabase](https://img.shields.io/badge/Supabase-Backend-green)

!\[Vercel](https://img.shields.io/badge/Vercel-Deploy-black)



\---



\# Descripción



PictoGráficos Laboratorio Creativo es un sistema web desarrollado para administrar integralmente una microempresa dedicada a la elaboración de productos personalizados y servicios de diseño gráfico.



El proyecto nace con el objetivo de reemplazar procesos manuales realizados mediante hojas de cálculo, centralizando toda la operación del negocio en una única plataforma moderna, rápida y fácil de utilizar.



La aplicación permitirá gestionar:



\- Clientes

\- Pedidos

\- Productos

\- Servicios

\- Inventario

\- Costos

\- Finanzas

\- Presupuesto

\- Dashboard Ejecutivo

\- Reportes



Todo desde una única interfaz.



\---



\# Filosofía



El objetivo del proyecto no es construir un ERP complejo.



El objetivo es construir una herramienta de trabajo que haga más fácil administrar el negocio día tras día.



La simplicidad, claridad y estabilidad siempre tendrán prioridad sobre agregar funcionalidades innecesarias.



\---



\# Objetivos



\- Centralizar toda la operación del negocio.

\- Reducir errores manuales.

\- Tener información en tiempo real.

\- Mejorar el control financiero.

\- Automatizar cálculos.

\- Facilitar la toma de decisiones.

\- Preparar el crecimiento futuro del negocio.



\---



\# Stack Tecnológico



\## Frontend



\- React

\- TypeScript

\- Vite

\- TailwindCSS

\- Shadcn/UI

\- React Router

\- TanStack Query

\- React Hook Form

\- Zod

\- Lucide React



\---



\## Backend



\- Supabase

\- PostgreSQL

\- Supabase Auth

\- Supabase Storage

\- Supabase Realtime



\---



\## Infraestructura



\- GitHub

\- Vercel

\- Supabase



\---



\# Arquitectura



```

React

&#x20;       │

&#x20;       ▼

Services

&#x20;       │

&#x20;       ▼

Supabase Client

&#x20;       │

&#x20;       ▼

PostgreSQL

&#x20;       │

&#x20;       ▼

Storage

```



Toda la lógica de negocio estará desacoplada mediante una capa de servicios.



\---



\# Estructura del Proyecto



```

src/



components/



pages/



layouts/



services/



hooks/



contexts/



types/



utils/



config/



routes/



assets/



styles/

```



\---



\# Documentación



Toda la documentación vigente del proyecto (archivos numerados 00 a 58) se encuentra empaquetada en:



```

Docs/

```



Este README permanece en la raíz del repositorio por convención (es el que GitHub muestra automáticamente).



Los documentos reemplazados durante la Fase 0.5 de Consolidación Documental (2026-07-09) se conservan, sin eliminarse, en:



```

Docs/legacy/

```



Un documento dentro de `legacy/` nunca debe utilizarse como fuente para el desarrollo; cada uno indica en su propio encabezado por qué documento vigente fue reemplazado.



La documentación constituye la fuente oficial del proyecto.



\---



\# Orden recomendado de lectura



Para comprender completamente el proyecto se recomienda el siguiente orden (todos los archivos numerados están dentro de `Docs/`):



1\. README.md



2\. 57\_GUIA\_CLAUDE\_CODE.md



3\. 50\_FILOSOFIA\_DEL\_SISTEMA.md



4\. 54\_PLAN\_DESARROLLO.md



5\. 56\_ESTANDARES\_DESARROLLO.md



6\. 08\_DESIGN\_SYSTEM.md



7\. 51\_COMPONENTES\_UI.md



8\. 52\_SUPABASE\_SCHEMA.md



9\. 53\_API\_CONTRACT.md



10\. Documentación funcional.



\---



\# Módulos



\## Dashboard



Indicadores generales del negocio.



\---



\## Clientes



Administración de clientes.



\---



\## Productos



Catálogo de productos y servicios.



\---



\## Pedidos



Gestión completa del ciclo de vida del pedido.



\---



\## Inventario



Control de insumos.



\---



\## Costos



Cálculo automático de costos.



\---



\## Finanzas



Administración de ingresos, gastos y bolsillos financieros.



\---



\## Presupuesto



Seguimiento de metas.



\---



\## Reportes



Generación de informes.



\---



\# Flujo de Desarrollo



```

Documentación



↓



Arquitectura



↓



Supabase



↓



Servicios



↓



Componentes



↓



Módulos



↓



Pruebas



↓



Despliegue

```



\---



\# Principios del Proyecto



\- Código limpio.

\- Componentes reutilizables.

\- Tipado con TypeScript.

\- Arquitectura modular.

\- Diseño consistente.

\- Documentación como fuente de verdad.

\- Desarrollo incremental.

\- Calidad antes que velocidad.



\---



\# Convenciones



\- PascalCase para componentes.

\- camelCase para funciones y variables.

\- snake\_case para tablas SQL.

\- kebab-case para rutas.

\- Commits descriptivos.

\- Migraciones para cambios en la base de datos.



\---



\# Roadmap



\## Versión 1



\- Dashboard

\- Clientes

\- Pedidos

\- Productos

\- Inventario

\- Costos

\- Finanzas

\- Presupuesto

\- Reportes



\---



\## Futuras versiones



\- Multiusuario.

\- WhatsApp Business.

\- Google Drive.

\- Agenda de producción.

\- CRM.

\- Facturación electrónica.

\- Compras.

\- Proveedores.

\- Aplicación móvil.



\---



\# Calidad



Antes de publicar cualquier cambio deberán cumplirse los criterios definidos en:



```

58\_CHECKLIST\_IMPLEMENTACION.md

```



\---



\# Despliegue



Frontend: Vercel — [https://pictogr-ficos-laboratorio-creativo.vercel.app](https://pictogr-ficos-laboratorio-creativo.vercel.app)



Backend: Supabase (proyecto `ixvcrcivoixdwiloxkxb`)



Repositorio: GitHub — despliegue automático en cada push a `main`.



Variables de entorno requeridas en Vercel (Project Settings → Environment Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (mismos valores que `.env` local, ver `52_SUPABASE_SCHEMA.md`).



\---



\# Estado del Proyecto



Las 14 etapas de `54_PLAN_DESARROLLO.md` están completas y en producción, salvo la Etapa 7 (Inventario), formalmente bloqueada hasta completar `46_ANALISIS_INVENTARIO.md` por decisión del propietario del negocio.



El sistema está desplegado y en uso en la URL indicada en la sección "Despliegue".



\---



\# Equipo



Proyecto desarrollado para:



\*\*PictoGráficos Laboratorio Creativo\*\*



\---



\# Mantenimiento



Toda modificación importante deberá actualizar primero la documentación y posteriormente el código.



La documentación constituye el contrato oficial del proyecto.



\---



\# Licencia



Uso interno de PictoGráficos Laboratorio Creativo.



Todos los derechos reservados.



\---



\# Conclusión



Este repositorio contiene la especificación técnica y funcional de un sistema de gestión diseñado específicamente para una microempresa de artes gráficas.



Cada decisión tomada durante el desarrollo deberá respetar la documentación existente, garantizando un producto consistente, mantenible y preparado para evolucionar.



\---



\*\*"Construir menos, construir mejor."\*\*



