# Changelog

## v1.0.0
- Creación del proyecto.
- Documentación inicial.
- Definición de módulos.

## 2026-07-15 — Despliegue en producción
- Etapas 1-6, 8-14 completas (Etapa 7 Inventario sigue bloqueada por `46_ANALISIS_INVENTARIO.md` pendiente).
- Rediseño visual v2.0 "Laboratorio Creativo" (paleta neón verde/cian, glassmorphism, tipografía Space Grotesk + Plus Jakarta Sans).
- Publicado en Vercel: https://pictogr-ficos-laboratorio-creativo.vercel.app (despliegue automático desde `main`).
- Fix: `DialogContent` no tenía `max-height`/`overflow-y-auto`, por lo que formularios largos (ej. "Nuevo pedido" con varias filas de producto) podían recortarse contra el borde de la ventana sin poder hacer scroll hasta el botón de enviar. Corregido en todos los diálogos de la app.

Registrar aquí todos los cambios importantes.
