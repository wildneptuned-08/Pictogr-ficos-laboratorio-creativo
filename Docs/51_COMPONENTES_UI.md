\# ==========================================================

\# 51\_COMPONENTES\_UI.md

\# Catálogo Oficial de Componentes UI

\# PictoGráficos Laboratorio Creativo

\# ==========================================================



Versión: 1.0



Estado: Oficial



Este documento define todos los componentes reutilizables que conforman la interfaz del sistema.



Ningún desarrollador deberá crear componentes nuevos si ya existe uno que resuelva el mismo problema.



Todos los módulos deberán reutilizar estos componentes.



\---



\# OBJETIVO



Crear una interfaz consistente, mantenible y escalable.



Cada componente deberá tener una única responsabilidad y podrá reutilizarse en cualquier módulo del sistema.



\---



\# FILOSOFÍA



La interfaz se construirá como un conjunto de bloques reutilizables.



Las pantallas NO se diseñarán desde cero.



Las pantallas se construirán ensamblando componentes existentes.



\---



\# CATEGORÍAS



Los componentes se agrupan en:



\- Layout

\- Navegación

\- Dashboard

\- Formularios

\- Datos

\- Retroalimentación

\- Negocio



\---



\# COMPONENTES DE LAYOUT



\## AppShell



\### Propósito



Es la estructura principal de toda la aplicación.



\### Contiene



Sidebar



TopBar



Área de contenido



Footer (opcional)



\### Utilizado por



Toda la aplicación.



\---



\## Sidebar



\### Propósito



Permitir navegar entre los módulos.



\### Contenido



Logo PictoGráficos



Menú principal



Acciones rápidas



Perfil de usuario



\### Características



Colapsable.



Responsive.



Íconos Lucide.



\---



\## TopBar



\### Propósito



Mostrar información general.



\### Contiene



Título



Breadcrumb



Buscador



Notificaciones



Acciones rápidas



Modo oscuro



\---



\## PageHeader



\### Propósito



Encabezado de cada módulo.



\### Contiene



Título



Descripción



Acciones



Filtros rápidos



\---



\# COMPONENTES DEL DASHBOARD



\## KpiCard



\### Propósito



Mostrar un indicador principal.



\### Ejemplos



Ventas



Pedidos



Utilidad



Meta



Inventario



\### Contenido



Ícono



Título



Valor



Variación



Descripción



\---



\## MetricProgress



\### Propósito



Mostrar el avance hacia una meta.



\### Ejemplos



Meta mensual



Meta diaria



Meta anual



\### Visualización



Barra de progreso.



Porcentaje.



Valor restante.



\---



\## ChartCard



\### Propósito



Contener cualquier gráfico.



\### Tipos permitidos



Barras



Líneas



Área



Anillo



\---



\## QuickActions



\### Propósito



Acciones frecuentes.



\### Ejemplos



Registrar Pedido



Registrar Pago



Comprar Inventario



Nuevo Cliente



\---



\## ActivityFeed



\### Propósito



Mostrar la actividad reciente.



Ejemplos.



Pedido creado.



Pago registrado.



Inventario actualizado.



\---



\# COMPONENTES DE DATOS



\## DataTable



\### Propósito



Mostrar información tabular.



\### Características



Búsqueda.



Filtros.



Ordenamiento.



Paginación.



Exportación (V2).



Selección múltiple.



Columnas configurables.



\---



\## StatusBadge



\### Propósito



Mostrar estados.



Ejemplos.



Nuevo



Producción



Entregado



Cancelado



Pagado



Pendiente



\---



\## Timeline



\### Propósito



Mostrar historial cronológico.



Utilizado en:



Pedidos



Clientes



Inventario



Finanzas



\---



\## EmptyState



\### Propósito



Mostrar una interfaz amigable cuando no existan registros.



Nunca mostrar tablas vacías.



\---



\# COMPONENTES DE FORMULARIOS



\## TextField



Campo de texto.



\---



\## TextArea



Texto largo.



\---



\## NumberField



Valores numéricos.



\---



\## CurrencyField



Valores monetarios.



Formato automático.



\---



\## DatePicker



Selección de fechas.



\---



\## Select



Lista desplegable.



\---



\## MultiSelect



Selección múltiple.



\---



\## SearchInput



Búsqueda rápida.



\---



\## PhoneInput



Campo para teléfonos.



\---



\## EmailInput



Campo para correo.



\---



\## FileUploader



Carga de archivos.



Permitirá:



PDF



PNG



JPG



SVG



AI (V2)



CDR (V2)



\---



\# COMPONENTES DE RETROALIMENTACIÓN



\## Toast



Mensajes temporales.



Tipos



Éxito



Advertencia



Error



Información



\---



\## ConfirmDialog



Confirmaciones.



Ejemplos



Eliminar



Cancelar pedido



Actualizar costos



\---



\## LoadingSkeleton



Mostrar carga.



Nunca utilizar pantallas completamente vacías.



\---



\## ProgressIndicator



Mostrar progreso de procesos largos.



\---



\# COMPONENTES DE NAVEGACIÓN



\## Breadcrumb



Ruta actual.



\---



\## Tabs



Cambiar entre secciones.



\---



\## Pagination



Cambiar páginas.



\---



\## CommandPalette (V2)



Búsqueda global del sistema.



\---



\# COMPONENTES DE NEGOCIO



\## PedidoCard



Resumen de un pedido.



Información



Cliente



Producto



Estado



Fecha



Saldo pendiente



\---



\## ClienteCard



Información resumida del cliente.



\---



\## ProductoCard



Información resumida del producto.



\---



\## InventarioCard



Información resumida del insumo.



Incluye



Stock



Costo



Proveedor



Estado



\---



\## MovimientoFinancieroCard



Resumen de ingresos y gastos.



\---



\## PresupuestoCard



Meta.



Avance.



Porcentaje.



Valor restante.



\---



\# COMPONENTES DE BOTONES



Solo existirán cuatro estilos.



\## Primario



Acción principal.



\---



\## Secundario



Acción alternativa.



\---



\## Terciario



Acciones poco frecuentes.



\---



\## Peligro



Eliminar.



Cancelar.



Acciones irreversibles.



\---



\# COMPONENTES DE ICONOGRAFÍA



Se utilizará exclusivamente:



Lucide React.



No mezclar diferentes librerías.



\---



\# RESPONSIVE



Todos los componentes deberán funcionar en:



Desktop



Tablet



Mobile



\---



\# ACCESIBILIDAD



Todos los componentes deberán soportar:



Navegación por teclado.



Etiquetas accesibles.



Contraste adecuado.



Mensajes claros.



\---



\# REUTILIZACIÓN



Antes de crear un nuevo componente responder:



¿Ya existe uno similar?



Si la respuesta es SI.



Reutilizar.



No crear otro.



\---



\# NOMENCLATURA



Todos los componentes utilizarán PascalCase.



Ejemplos.



AppShell



DataTable



KpiCard



MetricProgress



PedidoCard



ClienteCard



\---



\# CRITERIOS DE ACEPTACIÓN



Todos los componentes deberán:



Ser reutilizables.



Ser tipados con TypeScript.



Aceptar propiedades claramente definidas.



Tener una única responsabilidad.



Ser responsive.



Ser accesibles.



Mantener coherencia visual.



\---



\# COMPONENTES FUTUROS (V2)



No implementar en la primera versión.



Command Palette.



Calendario.



Kanban de Producción.



Agenda.



Chat interno.



Centro de Notificaciones.



Generador de Reportes.



\---



\# CONCLUSIÓN



Este documento define el catálogo oficial de componentes del sistema.



Toda nueva interfaz deberá construirse reutilizando estos componentes, garantizando una experiencia consistente, moderna y fácil de mantener.



La reutilización será un principio obligatorio durante todo el desarrollo del proyecto.



\---



Fin del documento.

