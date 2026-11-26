import { api } from '@/lib/axios'
import type {
  RegisterStorePurchaseDto,
  RegisterStorePurchaseResponse,
  StorePurchaseDto,
  StorePurchaseLookup,
} from '@/types/storePurchase'

export const storePurchasesService = {
  // Solo consulta a la tienda: no escribe nada.
  async lookup(data: StorePurchaseDto): Promise<StorePurchaseLookup> {
    const response = await api.post<StorePurchaseLookup>('/admin/store-purchases/lookup', data)
    return response.data
  },

  async register(data: RegisterStorePurchaseDto): Promise<RegisterStorePurchaseResponse> {
    const response = await api.post<RegisterStorePurchaseResponse>(
      '/admin/store-purchases/register',
      data,
    )
    return response.data
  },
}
