> ℹ️ **CONSOLIDADO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Su contenido íntegro (tablas, campos, tipos, convenciones) pasó a ser **52_SUPABASE_SCHEMA.md**, el documento oficial exigido por README.md y 57_GUIA_CLAUDE_CODE.md (hallazgo de auditoría C2). No se modificó ningún campo, tipo ni relación durante el traslado.
> Se conserva en `legacy/` como referencia histórica. Para el esquema vigente, consultar siempre 52_SUPABASE_SCHEMA.md.
>
> ---

\# ==========================================================

\# 49\_DICCIONARIO\_DATOS.md

\# Diccionario Oficial de Datos

\# ==========================================================



Versión: 1.0



Estado: Oficial



Base de Datos:

Supabase PostgreSQL



Documento relacionado:



41\_MODELO\_DATOS.md



48\_FLUJOS\_NEGOCIO.md



\---



\# OBJETIVO



Este documento define TODOS los campos que existirán en la base de datos.



Claude Code NO deberá inventar nuevos campos.



Toda modificación deberá actualizar primero este documento.



\---



\# CONVENCIONES



\## Nombres



Todas las tablas:



snake\_case



Ejemplo



pedido\_detalle



movimiento\_financiero



inventario\_movimiento



\---



Campos



snake\_case



Ejemplo



fecha\_entrega



precio\_unitario



stock\_minimo



created\_at



updated\_at



\---



Llaves primarias



Siempre



id



Tipo



UUID



\---



Fechas



TIMESTAMP WITH TIME ZONE



\---



Dinero



NUMERIC(12,2)



Nunca FLOAT.



\---



Booleanos



BOOLEAN



\---



Estados



ENUM



Siempre que sea posible.



\---



\# TABLA



\## clientes



Descripción



Almacena la información de cada cliente.



\---



Campo



id



Tipo



UUID



Obligatorio



Sí



Descripción



Identificador único.



\---



Campo



nombre



Tipo



VARCHAR(150)



Obligatorio



Sí



\---



Campo



telefono



Tipo



VARCHAR(30)



Obligatorio



Sí



Único



Sí



\---



Campo



correo



VARCHAR(150)



Opcional



\---



Campo



direccion



TEXT



Opcional



\---



Campo



ciudad



VARCHAR(80)



\---



Campo



observaciones



TEXT



\---



Campo



created\_at



TIMESTAMP



\---



Campo



updated\_at



TIMESTAMP



\---



\# TABLA



\## categorias\_producto



\---



id



UUID



\---



nombre



VARCHAR(100)



\---



descripcion



TEXT



\---



activo



BOOLEAN



\---



created\_at



TIMESTAMP



\---



updated\_at



TIMESTAMP



\---



\# TABLA



\## productos



\---



id



UUID



\---



categoria\_id



UUID



FK



categorias\_producto



\---



nombre



VARCHAR(120)



\---



descripcion



TEXT



\---



precio\_base



NUMERIC(12,2)



\---



activo



BOOLEAN



\---



created\_at



TIMESTAMP



\---



updated\_at



TIMESTAMP



\---



\# TABLA



\## pedidos



Descripción



Entidad principal del sistema.



Todo gira alrededor de esta tabla.



\---



id



UUID



\---



numero\_pedido



VARCHAR(30)



Único



Ejemplo



PED-000001



\---



cliente\_id



UUID



FK



clientes



\---



fecha\_pedido



TIMESTAMP



\---



fecha\_entrega



DATE



\---



estado



ENUM



Valores



Nuevo



Diseño



Producción



Listo



Entregado



Cancelado



\---



prioridad



ENUM



Baja



Media



Alta



Urgente



\---



canal\_ingreso



ENUM



WhatsApp



Instagram



Facebook



Tienda



Otro



\---



observaciones



TEXT



\---



subtotal



NUMERIC(12,2)



\---



descuento



NUMERIC(12,2)



\---



valor\_total



NUMERIC(12,2)



\---



anticipo



NUMERIC(12,2)



\---



saldo\_pendiente



NUMERIC(12,2)



\---



metodo\_pago



ENUM



Efectivo



Transferencia



Nequi



Daviplata



Tarjeta



Otro



\---



created\_at



TIMESTAMP



\---



updated\_at



TIMESTAMP



\---



\# TABLA



\## pedido\_detalle



Cada pedido podrá tener múltiples productos.



\---



id



UUID



\---



pedido\_id



UUID



FK



pedidos



\---



producto\_id



UUID



FK



productos



\---



cantidad



INTEGER



\---



precio\_unitario



NUMERIC(12,2)



\---



subtotal



NUMERIC(12,2)



\---



observaciones



TEXT



\---



\# TABLA



\## inventario



\---



id



UUID



\---



codigo



VARCHAR(50)



\---



nombre



VARCHAR(150)



\---



categoria



VARCHAR(80)



\---



unidad\_medida



VARCHAR(40)



\---



stock\_actual



NUMERIC(12,2)



\---



stock\_minimo



NUMERIC(12,2)



\---



costo\_unitario



NUMERIC(12,2)



\---



proveedor



VARCHAR(120)



\---



activo



BOOLEAN



\---



created\_at



TIMESTAMP



\---



updated\_at



TIMESTAMP



\---



\# TABLA



\## movimientos\_inventario



\---



id



UUID



\---



inventario\_id



UUID



FK



inventario



\---



tipo



ENUM



Entrada



Salida



Ajuste



\---



cantidad



NUMERIC(12,2)



\---



motivo



TEXT



\---



pedido\_id



UUID



Opcional



\---



created\_at



TIMESTAMP



\---



\# TABLA



\## costos\_producto



\---



id



UUID



\---



producto\_id



UUID



\---



costo\_material



NUMERIC



\---



costo\_impresion



NUMERIC



\---



costo\_empaque



NUMERIC



\---



otros\_costos



NUMERIC



\---



costo\_total



NUMERIC



\---



updated\_at



TIMESTAMP



\---



\# TABLA



\## bolsillos\_financieros



\---



id



UUID



\---



nombre



VARCHAR(80)



\---



porcentaje



NUMERIC(5,2)



\---



saldo\_actual



NUMERIC(12,2)



\---



activo



BOOLEAN



\---



created\_at



TIMESTAMP



\---



\# TABLA



\## movimientos\_financieros



\---



id



UUID



\---



pedido\_id



UUID



Opcional



\---



bolsillo\_id



UUID



\---



tipo



ENUM



Ingreso



Gasto



Transferencia



Ajuste



\---



categoria



VARCHAR(100)



\---



valor



NUMERIC(12,2)



\---



descripcion



TEXT



\---



fecha



TIMESTAMP



\---



\# TABLA



\## presupuesto



\---



id



UUID



\---



anio



INTEGER



\---



mes



INTEGER



\---



meta\_mensual



NUMERIC(12,2)



\---



meta\_quincenal



NUMERIC(12,2)



\---



meta\_semanal



NUMERIC(12,2)



\---



meta\_diaria



NUMERIC(12,2)



\---



activo



BOOLEAN



\---



\# TABLA



\## historial\_pedidos



\---



id



UUID



\---



pedido\_id



UUID



\---



estado\_anterior



VARCHAR



\---



estado\_nuevo



VARCHAR



\---



usuario



VARCHAR



\---



fecha



TIMESTAMP



\---



comentario



TEXT



\---



\# TABLA



\## archivos\_pedido



\---



id



UUID



\---



pedido\_id



UUID



\---



nombre\_archivo



VARCHAR



\---



url\_storage



TEXT



\---



tipo\_archivo



VARCHAR



\---



tamano



INTEGER



\---



created\_at



TIMESTAMP



\---



\# CAMPOS OBLIGATORIOS EN TODAS LAS TABLAS



Siempre incluir:



id



created\_at



updated\_at



Cuando aplique:



created\_by



updated\_by



activo



observaciones



\---



\# REGLAS GENERALES



Nunca eliminar registros críticos.



Usar estados.



Mantener historial.



No duplicar información.



Usar relaciones mediante UUID.



Evitar campos calculados cuando puedan obtenerse mediante consultas.



Toda lógica financiera deberá calcularse desde los movimientos y no mediante valores estáticos.



\---



\# OBSERVACIÓN IMPORTANTE



Este documento define la estructura mínima de la base de datos para la Versión 1.



Durante el desarrollo podrán agregarse nuevos campos únicamente cuando exista una justificación funcional y se actualice previamente esta documentación.



\---



Fin del documento.

