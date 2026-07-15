import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evita refetch redundante al navegar entre páginas que comparten
      // queryKeys (ej. clientes, bolsillos) dentro de la misma ventana corta.
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
})
