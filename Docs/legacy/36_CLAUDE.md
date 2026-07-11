> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **57_GUIA_CLAUDE_CODE.md**.
> Motivo: describía stack Next.js y un orden de desarrollo ("1 Dashboard, 2 Pedidos") contradictorio con la documentación oficial. Hallazgos de auditoría: C1, C3, C4.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo ni para gobernar el comportamiento del agente.
>
> ---

\# ==========================================================

\# CLAUDE.md

\# Sistema Administrativo para Empresa de Artes Gráficas

\# ==========================================================



Versión: 1.0



Estado: Activo



Este documento contiene el contexto permanente del proyecto.



Claude Code deberá leer este archivo antes de realizar cualquier modificación en el sistema.



\---



\# Objetivo del proyecto



Desarrollar una aplicación web moderna que permita administrar completamente la operación de una empresa de artes gráficas.



La aplicación reemplazará gradualmente Google Sheets como herramienta principal de administración.



El sistema debe ser sencillo de utilizar, visualmente profesional y preparado para crecer sin necesidad de rediseñar su arquitectura.



\---



\# Descripción del negocio



La empresa ofrece servicios de:



\- Sublimación de mugs

\- Sublimación de camisetas

\- Llaveros

\- Cuadros personalizados

\- Papelería

\- Diseños gráficos

\- Logos

\- Branding

\- Cartas menú

\- Productos personalizados



Los pedidos llegan principalmente desde WhatsApp Business.



Actualmente el negocio utiliza Google Sheets para controlar la operación.



El objetivo es migrar completamente esta administración hacia una aplicación web.



\---



\# Filosofía del desarrollo



Durante todo el desarrollo deberán respetarse los siguientes principios.



\## Simplicidad



Siempre elegir la solución más simple que resuelva correctamente el problema.



Evitar complejidad innecesaria.



\---



\## Escalabilidad



Aunque esta es una Versión 1, cada módulo deberá diseñarse para permitir futuras ampliaciones.



\---



\## Modularidad



Cada módulo será independiente.



No mezclar responsabilidades.



\---



\## Reutilización



Todo componente deberá poder reutilizarse.



No duplicar lógica.



\---



\## Mantenibilidad



El código debe ser fácil de entender.



Debe ser fácil de modificar.



Debe ser fácil de ampliar.



\---



\## Experiencia de Usuario



El usuario no tiene conocimientos técnicos.



La aplicación debe ser intuitiva.



Reducir al mínimo la cantidad de clics.



Automatizar tareas repetitivas.



Mostrar mensajes claros.



Mostrar confirmaciones.



Mostrar errores entendibles.



\---



\# Objetivos de la V1



La primera versión incluirá únicamente los siguientes módulos.



\- Dashboard

\- Pedidos

\- Clientes

\- Finanzas

\- Presupuesto

\- Inventario

\- Costos

\- Reportes

\- Configuración



No desarrollar funcionalidades adicionales sin autorización.



\---



\# Tecnologías aprobadas



Frontend



\- Next.js

\- React

\- TypeScript

\- Tailwind CSS

\- shadcn/ui

\- Framer Motion



Backend



\- Supabase



Base de Datos



\- PostgreSQL



Autenticación



\- Supabase Auth



Storage



\- Supabase Storage



Hosting



\- Vercel



Gráficas



\- Recharts



Validaciones



\- React Hook Form

\- Zod



Tablas



\- TanStack Table



\---



\# Reglas obligatorias



Claude Code NO deberá:



❌ Reestructurar completamente el proyecto.



❌ Cambiar la arquitectura sin autorización.



❌ Eliminar funcionalidades existentes.



❌ Modificar reglas de negocio.



❌ Cambiar nombres de tablas arbitrariamente.



❌ Crear dependencias innecesarias.



❌ Escribir código duplicado.



\---



Claude Code SI deberá:



✅ Crear componentes reutilizables.



✅ Utilizar TypeScript.



✅ Mantener separación entre UI y lógica.



✅ Escribir código limpio.



✅ Documentar funciones importantes.



✅ Mantener nombres descriptivos.



✅ Priorizar rendimiento.



✅ Pensar siempre en la mantenibilidad.



\---



\# Diseño esperado



El sistema debe transmitir profesionalismo.



Inspiración:



\- Stripe

\- Linear

\- Vercel

\- Notion



Características:



\- Minimalista

\- Elegante

\- Fluido

\- Responsive

\- Rápido



Evitar interfaces recargadas.



\---



\# Flujo general del negocio



Cliente



↓



WhatsApp



↓



Nuevo pedido



↓



Diseño



↓



Producción



↓



Entrega



↓



Pago



↓



Distribución automática del dinero



↓



Dashboard actualizado



\---



\# Módulos del sistema



Dashboard



Visualiza indicadores del negocio.



\---



Pedidos



Registro completo de pedidos.



Estados.



Pagos.



Archivos.



Producción.



\---



Clientes



Historial de compras.



Información de contacto.



\---



Finanzas



Ingresos.



Gastos.



Bolsillos financieros.



Distribución automática.



\---



Presupuesto



Metas.



Indicadores.



Cumplimiento.



\---



Inventario



Entradas.



Salidas.



Alertas.



Stock.



\---



Costos



Costos por producto.



Costos de insumos.



Rentabilidad.



\---



Reportes



Ventas.



Clientes.



Productos.



Finanzas.



Inventario.



\---



\# Antes de escribir código



Claude Code deberá responder internamente las siguientes preguntas.



¿Existe una solución más simple?



¿Este cambio rompe otra funcionalidad?



¿Este componente puede reutilizarse?



¿La lógica pertenece realmente a este módulo?



¿Puede mantenerse fácilmente en el futuro?



¿Está alineado con la arquitectura?



Si alguna respuesta es NO, deberá replantear la implementación.



\---



\# Orden recomendado de desarrollo



1 Dashboard



2 Pedidos



3 Clientes



4 Finanzas



5 Presupuesto



6 Inventario



7 Costos



8 Reportes



9 Configuración



\---



\# Criterios de éxito



La Versión 1 será exitosa cuando:



✔ El negocio pueda dejar de utilizar Google Sheets para la operación diaria.



✔ Todos los pedidos estén centralizados.



✔ Los indicadores se actualicen automáticamente.



✔ Los ingresos y gastos sean trazables.



✔ El inventario pueda controlarse.



✔ El usuario pueda conocer el estado real del negocio desde el Dashboard.



\---



\# Regla más importante



Antes de implementar cualquier funcionalidad, Claude Code deberá comprender el proceso del negocio.



La prioridad no es escribir más código.



La prioridad es resolver correctamente el problema del usuario.



\---



Fin del documento.

