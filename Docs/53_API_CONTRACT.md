\# ==========================================================

\# 53\_API\_CONTRACT.md

\# Contrato de Servicios

\# PictoGráficos Laboratorio Creativo

\# ==========================================================



Versión: 1.0



Estado: Oficial



Este documento define la capa de servicios que utilizará toda la aplicación.



El objetivo es desacoplar la lógica de negocio de la implementación específica de Supabase.



El Frontend NUNCA accederá directamente a las tablas de la base de datos.



Toda interacción deberá realizarse mediante servicios.



\---



\# OBJETIVO



Centralizar toda la lógica del negocio.



Facilitar mantenimiento.



Evitar duplicación de código.



Permitir futuras migraciones de backend sin modificar el Frontend.



\---



\# ARQUITECTURA



Pantalla



↓



Servicio



↓



Supabase



↓



Base de Datos



\---



\# PRINCIPIOS



Cada servicio tendrá una única responsabilidad.



No mezclar lógica entre módulos.



Todos los servicios deberán estar tipados con TypeScript.



Toda validación deberá realizarse antes de escribir en la base de datos.



\---



\# SERVICIOS OFICIALES



ClienteService



PedidoService



ProductoService



InventarioService



CostoService



FinanzasService



DashboardService



PresupuestoService



ArchivoService



ConfiguracionService



ReporteService



\---



\# CLIENTESERVICE



Responsabilidad



Administrar la información de clientes.



Operaciones



Crear Cliente



Actualizar Cliente



Buscar Cliente



Consultar Cliente



Listar Clientes



Eliminar Cliente (desactivar)



Obtener Historial



Validaciones



Teléfono único.



Nombre obligatorio.



No permitir clientes duplicados.



\---



\# PEDIDOSERVICE



Responsabilidad



Gestionar todo el ciclo de vida del pedido.



Operaciones



Crear Pedido



Actualizar Pedido



Consultar Pedido



Listar Pedidos



Cambiar Estado



Registrar Pago



Cancelar Pedido



Finalizar Pedido



Obtener Historial



Duplicar Pedido



Validaciones



Cliente obligatorio.



Debe existir al menos un producto o servicio.



Total mayor que cero.



Estado válido.



\---



\# PRODUCTOSERVICE



Responsabilidad



Administrar el catálogo.



Operaciones



Crear



Editar



Consultar



Eliminar (desactivar)



Buscar



Listar



Obtener Costos



Obtener Rentabilidad



\---



\# INVENTARIOSERVICE



Responsabilidad



Administrar los insumos.



Operaciones



Registrar Entrada



Registrar Salida



Actualizar Stock



Consultar Stock



Consultar Historial



Obtener Stock Crítico



Listar Insumos



Validaciones



No permitir stock negativo.



Registrar movimiento automáticamente.



\---



\# COSTOSERVICE



Responsabilidad



Calcular costos de productos y servicios.



Operaciones



Calcular Costo



Actualizar Costos



Consultar Costos



Obtener Rentabilidad



Recalcular Costos



Observación



Toda modificación deberá reflejarse automáticamente en futuros pedidos.



Nunca modificar pedidos históricos.



\---



\# FINANZASSERVICE



Responsabilidad



Administrar ingresos y gastos.



Operaciones



Registrar Ingreso



Registrar Gasto



Actualizar Bolsillos



Consultar Movimientos



Obtener Utilidad



Consultar Saldos



Regla



Cada movimiento deberá quedar registrado en el historial financiero.



\---



\# DASHBOARDSERVICE



Responsabilidad



Construir todos los indicadores.



Operaciones



Ventas del Mes



Ventas del Día



Pedidos Pendientes



Utilidad



Metas



Productos Más Vendidos



Inventario Crítico



Clientes Frecuentes



Tendencias



Observación



No almacenar indicadores.



Siempre calcular desde la información existente.



\---



\# PRESUPUESTOSERVICE



Responsabilidad



Administrar metas.



Operaciones



Crear Meta



Actualizar Meta



Consultar Meta



Calcular Avance



Calcular Cumplimiento



\---



\# ARCHIVOSERVICE



Responsabilidad



Administrar archivos en Supabase Storage.



Operaciones



Subir Archivo



Eliminar Archivo



Descargar Archivo



Consultar Archivos



Obtener URL Pública



Tipos Permitidos



PDF



PNG



JPG



SVG



\---



\# CONFIGURACIONSERVICE



Responsabilidad



Administrar parámetros generales.



Operaciones



Actualizar Empresa



Actualizar Porcentajes



Actualizar Preferencias



Actualizar Configuración



\---



\# REPORTESERVICE



Responsabilidad



Generar reportes.



Operaciones



Ventas



Utilidad



Inventario



Clientes



Finanzas



Pedidos



Exportaciones



Excel



PDF



CSV



(V2)



\---



\# RESPUESTAS



Todos los servicios deberán devolver una estructura consistente.



success



boolean



data



resultado



error



mensaje



message



texto amigable



\---



\# MANEJO DE ERRORES



Nunca devolver errores técnicos al usuario.



Correcto



"No fue posible registrar el pedido."



Incorrecto



"PostgreSQL Error 23505"



\---



\# VALIDACIONES



Las validaciones deberán realizarse antes de escribir en la base de datos.



Ejemplos



Campos obligatorios.



Valores negativos.



Fechas inválidas.



Duplicados.



Stock insuficiente.



\---



\# TRANSACCIONES



Cuando una operación afecte varios módulos deberá ejecutarse como una única operación lógica.



Ejemplo



Registrar Pedido



↓



Guardar Pedido



↓



Guardar Detalle



↓



Actualizar Finanzas



↓



Actualizar Dashboard



↓



Registrar Historial



Si ocurre un error crítico, la operación deberá mantenerse consistente.



\---



\# LOGGING



Registrar únicamente eventos importantes.



Creación.



Actualización.



Cancelación.



Errores.



Nunca registrar información sensible.



\---



\# REUTILIZACIÓN



Ninguna pantalla podrá implementar lógica propia de negocio.



Toda lógica deberá existir únicamente dentro del servicio correspondiente.



\---



\# NOMENCLATURA



Todos los servicios utilizarán PascalCase.



Ejemplos



PedidoService



ClienteService



InventarioService



FinanzasService



Todos los métodos utilizarán verbos claros.



Ejemplos



create()



update()



delete()



findById()



list()



calculate()



upload()



download()



\---



\# ESCALABILIDAD



Los servicios deberán permitir futuras integraciones.



WhatsApp Business



Google Drive



Correo Electrónico



Facturación Electrónica



Sin modificar las pantallas existentes.



\---



\# CRITERIOS DE ACEPTACIÓN



✔ Servicios independientes.



✔ Código reutilizable.



✔ Lógica centralizada.



✔ Tipado con TypeScript.



✔ Fácil mantenimiento.



✔ Compatible con Supabase.



✔ Preparado para futuras integraciones.



\---



\# CONCLUSIÓN



La capa de servicios será el único punto de comunicación entre el Frontend y Supabase.



Toda la lógica del negocio deberá concentrarse aquí, permitiendo que las pantallas sean simples, reutilizables y fáciles de mantener.



Este enfoque garantizará una arquitectura limpia y preparada para evolucionar sin afectar la experiencia del usuario.



\---



Fin del documento.

