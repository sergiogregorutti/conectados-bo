import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { storePurchasesService } from '@/services/storePurchases'
import { getErrorMessage } from '@/lib/errors'
import type { RegisterStorePurchaseDto, StorePurchaseDto } from '@/types/storePurchase'

// Consultar es una mutation (POST con el recibo en el body) pero no cambia
// datos: no invalida nada.
export function useLookupStorePurchase() {
  return useMutation({
    mutationFn: (data: StorePurchaseDto) => storePurchasesService.lookup(data),
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo consultar la compra'))
    },
  })
}

export function useRegisterStorePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterStorePurchaseDto) => storePurchasesService.register(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', res.userId] })
      toast.success('Compra registrada: el usuario quedó premium')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo registrar la compra'))
    },
  })
}
