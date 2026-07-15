\# ==========================================================

\# 08\_DESIGN\_SYSTEM.md

\# Design System

\# PictoGráficos Laboratorio Creativo

\# ==========================================================



Versión: 1.0



Estado: Oficial



Este documento define la identidad visual y las reglas de diseño que deberán respetarse en toda la aplicación.



Ninguna pantalla podrá desarrollarse sin seguir este documento.



\---



\# OBJETIVO



Crear una interfaz moderna, elegante, intuitiva y altamente funcional.



El sistema debe transmitir profesionalismo y creatividad sin sacrificar simplicidad.



La experiencia del usuario tendrá prioridad sobre la cantidad de funcionalidades visibles.



\---



\# FILOSOFÍA DE DISEÑO



La interfaz deberá ser:



✔ Limpia.



✔ Moderna.



✔ Fluida.



✔ Clara.



✔ Minimalista.



✔ Profesional.



✔ Creativa.



✔ Responsive.



\---



El usuario nunca deberá sentirse frente a un software administrativo tradicional.



\---



\# INSPIRACIÓN



La interfaz tomará inspiración de productos como:



Linear



Notion



Stripe Dashboard



Framer



Vercel



Apple



No se copiarán diseños.



Se tomarán como referencia sus principios de simplicidad y claridad.



\---



\# IDENTIDAD VISUAL



La identidad estará inspirada en el logotipo oficial de PictoGráficos Laboratorio Creativo.



El sistema deberá sentirse como una extensión natural de la marca.



\---



\# PALETA DE COLORES

> ℹ️ **NOTA DE ACTUALIZACIÓN — v2.0 "Laboratorio Creativo" (2026-07-15).** El propietario del negocio solicitó explícitamente un rediseño completo inspirado en el logo oficial (matraz/bombilla de laboratorio, tipografía manuscrita verde/azul). Esta sección reemplaza la paleta plana "azul institucional / verde institucional" de la v1.0. Los colores funcionales (éxito/advertencia/error/información) se mantienen sin cambios.

## Color Primario

Verde neón (acento energético del laboratorio)

Hex: `#39FF14` (oscuro) · `#16a34a` (claro, versión atenuada sin neón)

Uso:

- Botones principales
- Enlaces destacados
- Estados activos
- Indicadores de éxito / cumplimiento

## Color Secundario

Azul eléctrico / cian (acento creativo)

Hex: `#00D2FF` (oscuro) · `#0284c7` (claro, versión atenuada sin neón)

Uso:

- Información secundaria
- Enlaces
- Interactividad / hover

## Superficies (modo oscuro)

- Fondo base: `#0B0F19` (azul-negro profundo, nunca gris genérico ni negro absoluto)
- Tarjetas (cards): `#141B2D`, efecto vidrio — ver sección GLASSMORPHISM
- Texto principal: `#F8FAFC`
- Texto secundario / deshabilitado: `#94A3B8`

## Colores Neutros (modo claro)

Blanco

Gris muy claro

Gris medio

Gris oscuro

Negro suave

Los fondos del modo claro deberán utilizar principalmente colores neutros; los acentos verde/azul de arriba se usan igual que en oscuro pero sin neón (evitar deslumbramiento sobre fondo blanco).

\---



\# COLORES FUNCIONALES



Éxito



Verde



\---



Advertencia



Amarillo



\---



Error



Rojo



\---



Información



Azul



\---



\# TIPOGRAFÍA

> ℹ️ **Actualización v2.0 (2026-07-15):** reemplaza Inter/Geist por dos tipografías con reglas de uso semántico, autohospedadas vía `@fontsource` (sin depender de Google Fonts como CDN externo).

Títulos, encabezados de módulo y marca

Space Grotesk (pesos 500 y 700) — carácter geométrico, técnico, vectorial

Cuerpo de texto, tablas de datos, inputs y números financieros

Plus Jakarta Sans (pesos 400, 500 y 600) — legibilidad óptima sobre fondos oscuros

Nunca utilizar más de dos tipografías.

\---



\# JERARQUÍA



Título principal



Muy visible.



\---



Título de sección



Destacado.



\---



Texto normal



Legible.



\---



Texto secundario



Gris.



\---



\# ESPACIADO



Toda la aplicación utilizará una escala consistente.



8 px



16 px



24 px



32 px



48 px



Nunca utilizar espaciados arbitrarios.



\---



\# BORDES



Los componentes tendrán bordes suaves.



No utilizar bordes completamente cuadrados.



\---



\# SOMBRAS



Sombras muy sutiles.



El usuario no deberá percibir elementos pesados.



\---



\# TARJETAS



Todas las tarjetas compartirán el mismo estilo.



Cabecera



Contenido



Indicador



Acción



Ejemplo.



Ventas del Mes



$5.420.000



+18%



Ver detalle

## Glassmorphism (v2.0, modo oscuro)

Las tarjetas simulan los matraces de vidrio del laboratorio creativo:

- Fondo semi-transparente sobre `#141B2D`
- `backdrop-filter: blur(8px)`
- Borde semitransparente: `1px solid rgba(255,255,255,0.05)`

## Microinteracción hover

Al pasar el cursor sobre una tarjeta o ítem de navegación:

- Borde ultra fino que transiciona entre verde neón y azul eléctrico
- Sombra exterior brillante sutil (`box-shadow` con el color de acento, difuminado)
- Transición suave (`transition: all 0.3s ease-in-out`), nunca abrupta

El verde neón y el azul eléctrico son acentos, no colores de fondo masivo: se usan en bordes de hover, estados activos, iconos puntuales y el efecto de cursor. El 90% de la interfaz permanece en tonos oscuros limpios.

\---



\# BOTONES



Existirán únicamente cuatro tipos.



Primario



Secundario



Terciario



Peligro



No crear nuevos estilos.



\---



\# ICONOS



Utilizar Lucide React.



Todos los iconos deberán pertenecer a la misma librería.



No mezclar estilos.



\---



\# TABLAS



Las tablas deberán:



Permitir búsqueda.



Filtros.



Ordenamiento.



Paginación.



Columnas configurables.



Nunca mostrar más información de la necesaria.



\---



\# FORMULARIOS



Todos los formularios compartirán la misma estructura.



Etiqueta



↓



Campo



↓



Ayuda



↓



Validación



↓



Acción



Nunca utilizar formularios largos.



Cuando existan muchos campos utilizar asistentes por pasos.



\---



\# MODALES



Utilizar únicamente para:



Confirmaciones.



Ediciones rápidas.



Eliminar registros.



No construir formularios completos dentro de modales.



\---



\# KPI



Los indicadores compartirán el mismo diseño.



Icono



Título



Valor



Variación



Descripción



\---



\# DASHBOARD



El Dashboard será la pantalla principal.



Debe responder visualmente:



¿Cómo está el negocio hoy?



No deberá saturarse con gráficos innecesarios.



\---



\# GRÁFICOS



Utilizar únicamente cuando agreguen valor.



Preferir:



Barras



Líneas



Anillos



Áreas



Evitar gráficos difíciles de interpretar.



\---



\# ANIMACIONES



Las animaciones deberán ser discretas.



Duración máxima:



300 ms



Nunca utilizar animaciones exageradas.



\---



\# TRANSICIONES



Toda transición deberá sentirse natural.



Sin movimientos bruscos.



\---



\# LOADING



Nunca mostrar pantallas vacías.



Utilizar Skeleton Loaders.



No utilizar spinners largos.



\---



\# RESPONSIVE



La aplicación deberá funcionar correctamente en:



Desktop



Tablet



Móvil



El diseño Mobile será adaptado.



No simplemente reducido.



\---



\# MODO OSCURO



La aplicación soportará:



Modo Claro



Modo Oscuro



Los colores deberán adaptarse automáticamente.

> ℹ️ **v2.0:** el modo oscuro es la expresión completa de la identidad "Laboratorio Creativo" (fondo `#0B0F19`, glassmorphism, acentos neón). El modo claro conserva el mismo mapa de acentos (verde primario, azul/cian secundario) pero en tonos atenuados — nunca neón puro sobre fondo blanco.

## Efecto de cursor — "estrella fugaz"

Sin `prefers-reduced-motion`, una estela de luz verde-azul se desvanece detrás del cursor mientras se mueve (efecto cometa, no un resplandor estático). Nunca interfiere con clics (`pointer-events: none`); no se activa con eventos táctiles porque `mousemove` no los dispara.

Únicamente activo en `LoginPage` por ahora (2026-07-15) — pendiente evaluar extenderlo al resto de la aplicación.

\---



\# ACCESIBILIDAD



Contraste adecuado.



Navegación por teclado.



Etiquetas accesibles.



Estados visibles.



\---



\# CONSISTENCIA



Todos los módulos deberán compartir:



Botones.



Tablas.



Tarjetas.



Filtros.



Buscadores.



Formularios.



Indicadores.



\---



\# EXPERIENCIA DEL USUARIO



El usuario nunca deberá preguntarse:



"¿Dónde está esta opción?"



Toda acción importante deberá encontrarse en lugares predecibles.



\---



\# MENSAJES



Utilizar lenguaje cercano.



Correcto.



Pedido registrado correctamente.



Inventario actualizado.



Pago registrado.



Incorrecto.



Registro insertado.



Proceso ejecutado.



\---



\# RENDIMIENTO



La interfaz deberá sentirse instantánea.



Reducir renderizados innecesarios.



Optimizar consultas.



Mantener navegación fluida.



\---



\# PRINCIPIO GENERAL



Cada pantalla deberá cumplir una única misión.



Evitar interfaces saturadas.



Menos información.



Más claridad.



\---



\# CRITERIOS DE ACEPTACIÓN



✔ Interfaz consistente.



✔ Componentes reutilizables.



✔ Responsive.



✔ Accesible.



✔ Moderna.



✔ Fluida.



✔ Basada en la identidad visual de PictoGráficos.



✔ Fácil de aprender.



\---



\# CONCLUSIÓN



El Design System será la base de toda la experiencia de usuario del proyecto.



Su objetivo no es únicamente definir colores o componentes, sino garantizar que cada módulo transmita una identidad visual coherente, profesional y alineada con la filosofía de PictoGráficos Laboratorio Creativo.



Toda nueva interfaz deberá respetar las reglas definidas en este documento.



\---



Fin del documento.

