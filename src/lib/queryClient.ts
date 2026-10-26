import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from './errors'

export const queryClient = new QueryClient({
  // Si una query (listado/detalle) falla, antes quedaba en silencio: la tabla
  // mostraba "sin resultados" como si no hubiera datos. Esto avisa siempre,
  // sin tener que repetir el manejo en cada página.
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al cargar los datos'))
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})
