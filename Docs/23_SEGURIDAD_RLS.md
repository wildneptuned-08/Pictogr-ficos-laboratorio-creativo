# Seguridad

> ℹ️ **NOTA DE CONSOLIDACIÓN — Fase 0.5 (2026-07-09).** La sección "Roles" quedó aclarada para alinearse con 55_ROADMAP_PRODUCTO.md, que excluye explícitamente "Multiusuario" y "Sistema de permisos avanzado" de la V1 (hallazgo de auditoría I9). No se modificó ninguna regla de negocio: se referencia una decisión de alcance ya aprobada en el Roadmap.

## Row Level Security
Activar RLS en todas las tablas.

## Alcance V1 (mono-usuario)
La Versión 1 opera con una única cuenta (el propietario del negocio). Las políticas RLS deben validar que el usuario autenticado sea el propietario de la cuenta; no existe distinción de roles "Administrador" / "Usuario" en la V1. El soporte de roles y permisos avanzados está reservado para V2.0 (ver 55_ROADMAP_PRODUCTO.md).

Registrar auditoría de cambios críticos.
