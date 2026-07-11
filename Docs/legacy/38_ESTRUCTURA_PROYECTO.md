> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **56_ESTANDARES_DESARROLLO.md** (sección Estructura del Proyecto).
> Motivo: estructura basada en Next.js App Router (`app/`, `modules/`, `middleware.ts`) incompatible con el stack oficial Vite; además describe una carpeta `docs/` que no existe en el proyecto. Hallazgos de auditoría: C1, I2.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

\# ==========================================================

\# 38\_ESTRUCTURA\_PROYECTO.md

\# Estructura Oficial del Proyecto

\# ==========================================================



Versión: 1.0



Estado: Activo



Este documento define la estructura oficial del proyecto.



Claude Code deberá respetar esta organización durante todo el desarrollo.



No crear carpetas nuevas sin una justificación técnica.



\---



\# Objetivo



Mantener una arquitectura limpia, organizada y fácil de mantener.



Toda la aplicación deberá seguir una separación clara entre:



\- Presentación

\- Componentes

\- Lógica

\- Datos

\- Configuración

\- Utilidades



\---



\# Arquitectura General



El proyecto estará organizado de la siguiente manera.



```



/



├── app/



├── components/



├── modules/



├── services/



├── hooks/



├── lib/



├── types/



├── utils/



├── constants/



├── public/



├── docs/



├── styles/



├── middleware.ts



├── package.json



└── README.md



```



\---



\# app/



Contiene las rutas principales de Next.js.



Ejemplo:



```



app/



│



├── dashboard/



├── pedidos/



├── clientes/



├── finanzas/



├── inventario/



├── presupuesto/



├── costos/



├── reportes/



├── configuracion/



└── layout.tsx



```



Reglas



\- No colocar lógica del negocio.

\- Solo estructura de páginas.

\- Mantener cada página lo más limpia posible.



\---



\# components/



Contiene componentes reutilizables.



Ejemplo



```



components/



│



├── ui/



├── layout/



├── forms/



├── tables/



├── charts/



├── dialogs/



├── cards/



├── buttons/



├── inputs/



└── feedback/



```



Ejemplos



Button



Input



Modal



Sidebar



Header



Card



Loader



Toast



Dialog



No colocar consultas a Supabase.



\---



\# modules/



Cada módulo del sistema tendrá su propia carpeta.



```



modules/



│



├── dashboard/



├── pedidos/



├── clientes/



├── finanzas/



├── inventario/



├── presupuesto/



├── costos/



├── reportes/



└── configuracion/



```



Cada módulo podrá contener:



```



pedidos/



│



├── components/



├── services/



├── hooks/



├── types/



├── schemas/



├── actions/



├── utils/



└── index.ts



```



Esto permite que cada módulo sea independiente.



\---



\# services/



Contendrá toda la comunicación con Supabase.



Ejemplo



```



services/



│



├── pedidos.service.ts



├── clientes.service.ts



├── finanzas.service.ts



├── inventario.service.ts



└── dashboard.service.ts



```



Reglas



Toda consulta SQL deberá estar aquí.



No consultar Supabase desde componentes.



\---



\# hooks/



Hooks reutilizables.



Ejemplo



```



hooks/



│



├── usePedidos.ts



├── useClientes.ts



├── useDashboard.ts



├── useInventory.ts



└── useTheme.ts



```



\---



\# lib/



Configuraciones globales.



Ejemplo



```



lib/



│



├── supabase.ts



├── auth.ts



├── validations.ts



└── helpers.ts



```



\---



\# types/



Interfaces y tipos.



Ejemplo



```



types/



│



├── pedido.ts



├── cliente.ts



├── inventario.ts



├── finanzas.ts



└── dashboard.ts



```



Todo tipo reutilizable deberá vivir aquí.



\---



\# utils/



Funciones auxiliares.



Ejemplo



```



utils/



│



├── currency.ts



├── date.ts



├── percentage.ts



├── formatter.ts



└── calculator.ts



```



Nunca colocar consultas SQL.



\---



\# constants/



Información estática.



Ejemplo



```



constants/



│



├── routes.ts



├── colors.ts



├── menus.ts



├── permissions.ts



└── config.ts



```



\---



\# public/



Recursos públicos.



```



public/



│



├── logo/



├── icons/



├── images/



└── favicon.ico



```



\---



\# docs/



Toda la documentación.



```



docs/



│



├── 00\_DESARROLLO\_OBLIGATORIO.md



├── ...



├── 38\_ESTRUCTURA\_PROYECTO.md



└── ...



```



Nunca eliminar documentación.



\---



\# styles/



Archivos globales.



```



styles/



│



└── globals.css



```



Mantener la mayor parte de los estilos mediante Tailwind CSS.



\---



\# Convenciones de Archivos



Componentes



```



CustomerTable.tsx



OrderCard.tsx



InventoryAlert.tsx



```



Servicios



```



customer.service.ts



orders.service.ts



inventory.service.ts



```



Hooks



```



useOrders.ts



useCustomers.ts



```



Tipos



```



customer.ts



order.ts



inventory.ts



```



\---



\# Convenciones de Carpetas



No utilizar nombres ambiguos.



Correcto



```



clientes/



inventario/



dashboard/



```



Incorrecto



```



nuevo/



modulo1/



prueba/



```



\---



\# Flujo de Datos



El flujo oficial será:



```



Usuario



↓



Página



↓



Componente



↓



Hook



↓



Servicio



↓



Supabase



↓



Servicio



↓



Hook



↓



Componente



↓



Usuario



```



Nunca romper este flujo.



\---



\# Dependencias entre módulos



Dashboard



↓



Pedidos



↓



Clientes



↓



Finanzas



↓



Inventario



↓



Costos



↓



Presupuesto



↓



Reportes



Todos los módulos deben poder evolucionar de manera independiente.



\---



\# Reglas de Desarrollo



Cada nueva funcionalidad deberá responder a estas preguntas:



¿En qué módulo pertenece?



¿Existe ya un componente reutilizable?



¿Existe un servicio similar?



¿Existe un tipo definido?



¿Debe vivir en utils?



¿Debe vivir en constants?



Solo después de responder estas preguntas se podrá crear un nuevo archivo.



\---



\# Archivos que NO deben existir



Evitar archivos como:



```



utils2.ts



helpersFinal.ts



nuevo.ts



prueba.ts



temp.ts



test2.ts



```



Los nombres deben describir claramente su propósito.



\---



\# Objetivo Final



La estructura del proyecto deberá permitir que cualquier desarrollador pueda localizar un archivo en menos de un minuto y comprender dónde agregar una nueva funcionalidad sin necesidad de reorganizar el proyecto.



\---



\# Regla Final



Claude Code deberá respetar esta estructura durante todo el desarrollo.



Si considera necesario modificarla, primero deberá justificar técnicamente la razón y explicar el impacto sobre el resto del proyecto.



\---



Fin del documento.

