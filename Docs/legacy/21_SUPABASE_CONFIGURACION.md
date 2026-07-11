> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **52_SUPABASE_SCHEMA.md** (sección Configuración de Entorno).
> Motivo: usaba variables `NEXT_PUBLIC_*`, propias de Next.js e incompatibles con el prefijo `VITE_*` del stack oficial. Hallazgos de auditoría: C1, I4.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

# Configuración de Supabase

## Objetivo
Centralizar toda la información del sistema.

## Servicios
- PostgreSQL
- Auth
- Storage

## Variables de entorno
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

## Buenas prácticas
No exponer credenciales.
Usar migraciones para cambios de base de datos.
