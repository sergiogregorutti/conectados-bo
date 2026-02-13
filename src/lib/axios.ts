import axios from 'axios'
import { supabase } from './supabase'

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Missing VITE_API_URL environment variable')
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token de Supabase a cada request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - cerrar sesión
      await supabase.auth.signOut()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)
