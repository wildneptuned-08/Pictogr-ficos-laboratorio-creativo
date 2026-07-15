# ==========================================================
# 52_SUPABASE_SCHEMA.md
# Esquema Oficial de Base de Datos y Configuración de Supabase
# PictoGráficos Laboratorio Creativo
# ==========================================================

Versión: 1.0

Estado: Oficial

Origen: este documento consolida, sin alterar ningún campo, tipo o relación, el contenido de `legacy/49_DICCIONARIO_DATOS.md` — que queda archivado como referencia histórica — y añade la configuración de entorno correcta para el stack oficial (Vite).

Creado durante: Fase 0.5 — Consolidación Documental (2026-07-09), para resolver el hallazgo crítico C2 de la auditoría (documento obligatorio referenciado en README.md y 57_GUIA_CLAUDE_CODE.md que no existía).

Base de Datos: Supabase PostgreSQL

Documentos relacionados:

51_COMPONENTES_UI.md

53_API_CONTRACT.md

48_FLUJOS_NEGOCIO.md (pendiente de completar — ver 46/48)

---

# OBJETIVO

Este documento define TODOS los campos que existirán en la base de datos.

Claude Code NO deberá inventar nuevos campos.

Toda modificación deberá actualizar primero este documento.

---

# NOTA DE CONSOLIDACIÓN — DECISIÓN DEL NEGOCIO CONFIRMADA (2026-07-09)

El campo `estado` de la tabla `pedidos` (ver más abajo) se definía de tres formas distintas entre `legacy/49_DICCIONARIO_DATOS.md`, `10_MODULO_PEDIDOS.md` y `44_ANALISIS_PEDIDO.md` (hallazgo de auditoría C5).

El propietario del negocio confirmó la **Opción A**: el ENUM de 6 valores ya definido en el diccionario oficial (Nuevo, Diseño, Producción, Listo, Entregado, Cancelado) es el flujo vigente. Las propuestas alternativas de `10_MODULO_PEDIDOS.md` (otros nombres) y `44_ANALISIS_PEDIDO.md` (11 estados) quedan descartadas para la V1.

---

# CONVENCIONES

## Nombres

Todas las tablas:

snake_case

Ejemplo

pedido_detalle

movimiento_financiero

inventario_movimiento

Campos

snake_case

Ejemplo

fecha_entrega

precio_unitario

stock_minimo

created_at

updated_at

Llaves primarias

Siempre

id

Tipo

UUID

Fechas

TIMESTAMP WITH TIME ZONE

Dinero

NUMERIC(12,2)

Nunca FLOAT.

Booleanos

BOOLEAN

Estados

ENUM

Siempre que sea posible.

---

# CONFIGURACIÓN DE ENTORNO

Stack oficial: Vite (ver README.md, 54_PLAN_DESARROLLO.md, 56_ESTANDARES_DESARROLLO.md).

Variables de entorno (corrige el hallazgo I4 de la auditoría; `legacy/21_SUPABASE_CONFIGURACION.md` usaba el prefijo `NEXT_PUBLIC_*`, propio de Next.js):

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY (nunca expuesta al cliente; sin prefijo VITE_, no debe incluirse en ningún bundle de frontend)

Buenas prácticas

No exponer credenciales.

Usar migraciones para cambios de base de datos.

Nunca modificar la base de datos manualmente.

---

# TABLA

## clientes

Descripción

Almacena la información de cada cliente.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| id | UUID | Sí | Identificador único |
| nombre | VARCHAR(150) | Sí | |
| telefono | VARCHAR(30) | Sí | Único |
| correo | VARCHAR(150) | Opcional | |
| direccion | TEXT | Opcional | |
| ciudad | VARCHAR(80) | | |
| observaciones | TEXT | | |
| activo | BOOLEAN | | Agregado en Etapa 4 (2026-07-15) para resolver la operación "Eliminar Cliente (desactivar)" de 53_API_CONTRACT.md, que no tenía campo equivalente. Decisión del propietario del negocio. |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

---

# TABLA

## categorias_producto

| Campo | Tipo |
|---|---|
| id | UUID |
| nombre | VARCHAR(100) |
| descripcion | TEXT |
| activo | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# TABLA

## productos

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| categoria_id | UUID | FK → categorias_producto |
| nombre | VARCHAR(120) | |
| descripcion | TEXT | |
| precio_base | NUMERIC(12,2) | |
| activo | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

# TABLA

## pedidos

Descripción

Entidad principal del sistema. Todo gira alrededor de esta tabla.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| numero_pedido | VARCHAR(30) | Único. Ejemplo: PED-000001 |
| cliente_id | UUID | FK → clientes |
| fecha_pedido | TIMESTAMP | |
| fecha_entrega | DATE | |
| estado | ENUM | Nuevo, Diseño, Producción, Listo, Entregado, Cancelado — confirmado por el propietario del negocio (2026-07-09), ver "Nota de consolidación" arriba |
| prioridad | ENUM | Baja, Media, Alta, Urgente |
| canal_ingreso | ENUM | WhatsApp, Instagram, Facebook, Tienda, Otro |
| observaciones | TEXT | |
| subtotal | NUMERIC(12,2) | |
| descuento | NUMERIC(12,2) | |
| valor_total | NUMERIC(12,2) | |
| anticipo | NUMERIC(12,2) | |
| saldo_pendiente | NUMERIC(12,2) | |
| metodo_pago | ENUM | Efectivo, Transferencia, Nequi, Daviplata, Tarjeta, Otro |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

# TABLA

## pedido_detalle

Cada pedido podrá tener múltiples productos.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| pedido_id | UUID | FK → pedidos |
| producto_id | UUID | FK → productos |
| cantidad | INTEGER | |
| precio_unitario | NUMERIC(12,2) | |
| subtotal | NUMERIC(12,2) | |
| observaciones | TEXT | |

---

# TABLA

## inventario

| Campo | Tipo |
|---|---|
| id | UUID |
| codigo | VARCHAR(50) |
| nombre | VARCHAR(150) |
| categoria | VARCHAR(80) |
| unidad_medida | VARCHAR(40) |
| stock_actual | NUMERIC(12,2) |
| stock_minimo | NUMERIC(12,2) |
| costo_unitario | NUMERIC(12,2) |
| proveedor | VARCHAR(120) |
| activo | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# TABLA

## movimientos_inventario

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| inventario_id | UUID | FK → inventario |
| tipo | ENUM | Entrada, Salida, Ajuste |
| cantidad | NUMERIC(12,2) | |
| motivo | TEXT | |
| pedido_id | UUID | Opcional |
| created_at | TIMESTAMP | |

---

# TABLA

## costos_producto

| Campo | Tipo |
|---|---|
| id | UUID |
| producto_id | UUID |
| costo_material | NUMERIC |
| costo_impresion | NUMERIC |
| costo_empaque | NUMERIC |
| otros_costos | NUMERIC |
| costo_total | NUMERIC |
| updated_at | TIMESTAMP |

---

# TABLA

## bolsillos_financieros

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| nombre | VARCHAR(80) | |
| porcentaje | NUMERIC(5,2) | Configurable. Valores semilla confirmados por el propietario del negocio (2026-07-09): ver tabla siguiente |
| saldo_actual | NUMERIC(12,2) | |
| activo | BOOLEAN | |
| created_at | TIMESTAMP | |

## Valores semilla — bolsillos_financieros (confirmados 2026-07-09)

| nombre | porcentaje |
|---|---|
| Reinversión | 20% |
| Mantenimiento | 10% |
| Fondo de Emergencia | 10% |
| Disponible para mí | 60% |

Suma: 100%. Estos valores reemplazan al ejemplo ilustrativo (30/10/15/45%) de 43_ANALISIS_FINANZAS.md, que queda como no vinculante frente a este valor semilla oficial.

---

# TABLA

## movimientos_financieros

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| pedido_id | UUID | Opcional |
| bolsillo_id | UUID | |
| tipo | ENUM | Ingreso, Gasto, Transferencia, Ajuste |
| categoria | VARCHAR(100) | |
| valor | NUMERIC(12,2) | |
| descripcion | TEXT | |
| fecha | TIMESTAMP | |

---

# TABLA

## presupuesto

Regla de negocio (42_ANALISIS_PRESUPUESTO.md): solo puede existir un presupuesto `activo` por `(anio, mes)` — implementado como índice único parcial, no como UNIQUE pleno, para poder conservar revisiones históricas inactivas del mismo mes (nunca se eliminan presupuestos antiguos).

| Campo | Tipo |
|---|---|
| id | UUID |
| anio | INTEGER |
| mes | INTEGER |
| meta_mensual | NUMERIC(12,2) |
| meta_quincenal | NUMERIC(12,2) |
| meta_semanal | NUMERIC(12,2) |
| meta_diaria | NUMERIC(12,2) |
| activo | BOOLEAN |

---

# TABLA

## historial_pedidos

| Campo | Tipo |
|---|---|
| id | UUID |
| pedido_id | UUID |
| estado_anterior | VARCHAR |
| estado_nuevo | VARCHAR |
| usuario | VARCHAR |
| fecha | TIMESTAMP |
| comentario | TEXT |

---

# TABLA

## configuracion

Descripción

Tabla de fila única con los parámetros generales del negocio. Agregada en Etapa 4 (2026-07-15) para resolver las operaciones "Actualizar Empresa" y "Actualizar Preferencias" de `ConfiguracionService` (53_API_CONTRACT.md), que no tenían tabla equivalente. `dias_habiles_mes` es el valor "Días hábiles (configurable)" que 42_ANALISIS_PRESUPUESTO.md exige para calcular la meta diaria del Presupuesto.

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | |
| nombre_empresa | VARCHAR(150) | |
| correo_contacto | VARCHAR(150) | Opcional |
| telefono_contacto | VARCHAR(30) | Opcional |
| dias_habiles_mes | INTEGER | Usado por PresupuestoService para calcular la meta diaria |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

# TABLA

## archivos_pedido

| Campo | Tipo |
|---|---|
| id | UUID |
| pedido_id | UUID |
| nombre_archivo | VARCHAR |
| url_storage | TEXT |
| tipo_archivo | VARCHAR |
| tamano | INTEGER |
| created_at | TIMESTAMP |

---

# CAMPOS OBLIGATORIOS EN TODAS LAS TABLAS

Siempre incluir:

id

created_at

updated_at

Cuando aplique:

created_by

updated_by

activo

observaciones

---

# REGLAS GENERALES

Nunca eliminar registros críticos.

Usar estados.

Mantener historial.

No duplicar información.

Usar relaciones mediante UUID.

Evitar campos calculados cuando puedan obtenerse mediante consultas.

Toda lógica financiera deberá calcularse desde los movimientos y no mediante valores estáticos.

RLS: activar en todas las tablas. Para la V1 (mono-usuario, sin roles — ver 55_ROADMAP_PRODUCTO.md), las políticas deben limitarse a validar que el usuario autenticado sea el propietario de la cuenta; el soporte de roles múltiples queda fuera de alcance hasta V2.0.

---

# OBSERVACIÓN IMPORTANTE

Este documento define la estructura mínima de la base de datos para la Versión 1.

Durante el desarrollo podrán agregarse nuevos campos únicamente cuando exista una justificación funcional y se actualice previamente esta documentación.

No incluye la tabla `proveedores` ni ninguna entidad reservada para versiones futuras (ver 55_ROADMAP_PRODUCTO.md, sección "No incluir en la Versión 1").

---

Fin del documento.
