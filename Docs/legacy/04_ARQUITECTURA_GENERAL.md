> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **README.md** (sección Arquitectura) y **56_ESTANDARES_DESARROLLO.md**.
> Motivo: describía una arquitectura basada en Next.js, incompatible con el stack oficial (Vite) confirmado en README, 50, 54 y 56. Hallazgo de auditoría: C1.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

# Arquitectura General

## Objetivo

Construir una aplicación web modular para administrar el negocio de
artes gráficas.

## Arquitectura

Cliente (Next.js) ↓ Supabase (Auth + PostgreSQL + Storage) ↓ Dashboard

## Módulos

-   Dashboard
-   Pedidos
-   Clientes
-   Finanzas
-   Presupuesto
-   Inventario
-   Costos

## Principios

-   Un módulo, una responsabilidad.
-   Componentes reutilizables.
-   La base de datos es la fuente oficial.
-   Google Sheets solo se usará durante la transición.
