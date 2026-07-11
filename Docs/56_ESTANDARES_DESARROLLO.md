\# ==========================================================

\# 56\_ESTANDARES\_DESARROLLO.md

\# Estándares Oficiales de Desarrollo

\# PictoGráficos Laboratorio Creativo

\# ==========================================================



Versión: 1.0



Estado: Oficial



Este documento define los estándares técnicos obligatorios para el desarrollo del sistema.



Todo el código generado por Claude Code deberá cumplir estas reglas.



No deberán realizarse excepciones sin una justificación técnica.



\---



\# OBJETIVO



Garantizar un código:



Consistente.



Mantenible.



Escalable.



Legible.



Reutilizable.



Seguro.



\---



\# FILOSOFÍA



El código deberá escribirse pensando que otra persona lo mantendrá dentro de cinco años.



Siempre deberá priorizarse la claridad sobre la complejidad.



\---



\# PRINCIPIOS



Simplicidad.



Reutilización.



Responsabilidad única.



Legibilidad.



Consistencia.



Mínima duplicación.



\---



\# TECNOLOGÍAS OFICIALES



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



Storage



Supabase Storage



Repositorio



GitHub



Despliegue



Vercel



\---



\# ESTRUCTURA DEL PROYECTO



src/



components/



pages/



layouts/



services/



hooks/



contexts/



types/



utils/



constants/



config/



assets/



styles/



routes/



lib/



\---



\# COMPONENTES



Todos los componentes deberán:



Tener una única responsabilidad.



Ser reutilizables.



Recibir Props tipadas.



No contener lógica de negocio.



\---



\# PÁGINAS



Las páginas únicamente deberán:



Organizar componentes.



Consumir servicios.



Controlar navegación.



Nunca implementar lógica compleja.



\---



\# SERVICIOS



Toda interacción con Supabase deberá realizarse mediante Services.



Nunca acceder directamente a Supabase desde un componente.



\---



\# HOOKS



Los Hooks personalizados deberán comenzar con:



use



Ejemplos



usePedidos



useClientes



useInventario



useDashboard



\---



\# TYPESCRIPT



Obligatorio.



No utilizar "any".



Preferir tipos explícitos.



Utilizar interfaces cuando representen entidades.



Utilizar type para composiciones.



\---



\# NOMENCLATURA



Componentes



PascalCase



PedidoCard



DashboardPage



Hooks



camelCase



usePedidos



Funciones



camelCase



calcularCosto()



Variables



camelCase



totalPedido



Constantes



UPPER\_CASE



MAX\_FILE\_SIZE



Rutas



kebab-case



nuevo-pedido



\---



\# IMPORTACIONES



Utilizar alias configurados.



Incorrecto



../../../components



Correcto



@/components



\---



\# TAILWIND CSS



Utilizar utilidades oficiales.



No escribir estilos repetidos.



Agrupar clases cuando sea posible.



Evitar estilos inline.



\---



\# SHADCN/UI



Todos los componentes base deberán provenir de Shadcn/UI.



No modificar directamente los componentes originales.



Crear wrappers cuando sea necesario.



\---



\# ESTADO



Local



useState



Global



Context únicamente cuando sea necesario.



Servidor



TanStack Query.



\---



\# FORMULARIOS



React Hook Form.



Validaciones con Zod.



Mensajes claros.



Nunca validar únicamente en el frontend.



\---



\# VALIDACIONES



Validar:



Frontend.



Backend.



Base de datos.



\---



\# ERRORES



Nunca mostrar errores técnicos al usuario.



Registrar errores en consola únicamente durante desarrollo.



\---



\# LOGS



Eliminar console.log antes de producción.



Utilizar únicamente herramientas de depuración cuando sean necesarias.



\---



\# RENDIMIENTO



Evitar renderizados innecesarios.



Utilizar memoización únicamente cuando aporte beneficios reales.



No optimizar prematuramente.



\---



\# ACCESIBILIDAD



Todos los formularios deberán tener etiquetas.



Los botones deberán tener texto o aria-label.



Contraste adecuado.



Navegación mediante teclado.



\---



\# RESPONSIVE



Desktop primero.



Tablet.



Móvil.



Todas las pantallas deberán adaptarse correctamente.



\---



\# SEGURIDAD



Nunca almacenar claves en el código.



Utilizar variables de entorno.



Respetar políticas RLS.



No confiar únicamente en validaciones del frontend.



\---



\# SUPABASE



Todas las consultas deberán realizarse mediante Services.



No duplicar consultas.



Seleccionar únicamente las columnas necesarias.



Utilizar índices cuando corresponda.



\---



\# BASE DE DATOS



No modificar tablas manualmente.



Toda modificación deberá realizarse mediante migraciones.



Mantener integridad referencial.



\---



\# GIT



main



Producción.



develop



Desarrollo.



feature/\*



Nuevas funcionalidades.



fix/\*



Correcciones.



hotfix/\*



Errores críticos.



\---



\# COMMITS



Utilizar mensajes descriptivos.



Ejemplos



feat: módulo de pedidos



fix: cálculo de utilidad



refactor: servicios de inventario



docs: actualización del roadmap



style: mejoras visuales dashboard



\---



\# DOCUMENTACIÓN



Todo cambio importante deberá reflejarse en la documentación correspondiente.



Nunca dejar documentación desactualizada.



\---



\# CÓDIGO LIMPIO



Funciones pequeñas.



Componentes pequeños.



Variables descriptivas.



Eliminar código muerto.



Evitar comentarios innecesarios.



El código debe ser autoexplicativo.



\---



\# PRINCIPIOS SOLID



Aplicar cuando aporten claridad.



No sobrearquitecturar la aplicación.



La simplicidad tiene prioridad.



\---



\# REUTILIZACIÓN



Antes de crear:



Componente.



Hook.



Servicio.



Utilidad.



Responder:



¿Ya existe algo similar?



Si existe:



Reutilizar.



\---



\# DEPENDENCIAS



Agregar únicamente librerías que aporten valor real.



Evitar dependencias innecesarias.



Preferir soluciones simples.



\---



\# CONTROL DE CALIDAD



Antes de finalizar cualquier módulo verificar:



✔ Sin errores TypeScript.



✔ Sin errores ESLint.



✔ Sin errores de compilación.



✔ Responsive.



✔ Accesible.



✔ Servicios funcionando.



✔ Componentes reutilizables.



✔ Código documentado cuando sea necesario.



\---



\# REVISIÓN FINAL



Todo Pull Request deberá cumplir:



Código limpio.



Tipado correcto.



Sin duplicación.



Sin código comentado.



Sin archivos temporales.



Sin dependencias innecesarias.



\---



\# CRITERIOS DE ACEPTACIÓN



Todo desarrollo será aceptado únicamente si:



Cumple la documentación.



Respeta la arquitectura.



Mantiene consistencia visual.



Respeta el Design System.



Utiliza los componentes oficiales.



No rompe funcionalidades existentes.



\---



\# CONCLUSIÓN



Estos estándares constituyen la guía oficial de ingeniería del proyecto.



Su cumplimiento garantizará una base de código consistente, mantenible y preparada para evolucionar con el crecimiento de PictoGráficos Laboratorio Creativo.



\---



Fin del documento.

