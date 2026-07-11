> ⚠️ **DOCUMENTO OBSOLETO — Fase 0.5, Consolidación Documental (2026-07-09)**
> Reemplazado por: **56_ESTANDARES_DESARROLLO.md** (sección Estructura del Proyecto).
> Motivo: mismo patrón que el hallazgo C1 (arquitectura Next.js incompatible con el stack oficial Vite); no tenía pin propio en el informe de auditoría pero comparte exactamente la causa raíz de C1, por lo que se archiva junto con los demás documentos de esa familia.
> Se conserva en `legacy/` como referencia histórica. No debe usarse como fuente para el desarrollo.
>
> ---

# Frontend

/app
/components
/modules
/lib
/hooks
/types
/utils

Cada módulo tendrá componentes independientes.
