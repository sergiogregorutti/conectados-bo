import { api } from '@/lib/axios'
import type {
  CreatePostDto,
  UpdatePostDto,
  PostsFilters,
  PostsListResponse,
  PostResponse,
  ReorderPostImagesDto,
} from '@/types/post'
import type { CommentsFilters, CommentsListResponse, CommentResponse } from '@/types/debateComment'

export const debateService = {
  async getPosts(filters?: PostsFilters): Promise<PostsListResponse> {
    const response = await api.get<PostsListResponse>('/admin/debate/posts', {
      params: {
        page: filters?.page,
        limit: filters?.limit,
        // 'all' no es un filtro real: se omite para traer todos
        status: filters?.status === 'all' ? undefined : filters?.status,
      },
    })
    return response.data
  },

  async createPost(data: CreatePostDto): Promise<PostResponse> {
    const formData = new FormData()
    // Los campos de texto van antes de los archivos: fastify multipart (streaming) solo
    // expone los fields una vez consumido el último archivo, así que si van después no llegan.
    formData.append('description', data.description)
    if (data.publishedAt) formData.append('publishedAt', data.publishedAt)
    // El orden de aparición de "images" en el FormData define el `order` de cada imagen:
    // no existe un campo de orden separado.
    for (const file of data.files) {
      formData.append('images', file)
    }
    const response = await api.post<PostResponse>('/admin/debate/posts', formData)
    return response.data
  },

  async getPost(id: string): Promise<PostResponse> {
    const response = await api.get<PostResponse>(`/admin/debate/posts/${id}`)
    return response.data
  },

  async updatePost(id: string, data: UpdatePostDto): Promise<PostResponse> {
    const response = await api.patch<PostResponse>(`/admin/debate/posts/${id}`, data)
    return response.data
  },

  // Agrega imágenes al final del post (order = max existente + 1, 2...).
  async addImages(id: string, files: File[]): Promise<PostResponse> {
    const formData = new FormData()
    for (const file of files) {
      formData.append('images', file)
    }
    const response = await api.post<PostResponse>(`/admin/debate/posts/${id}/images`, formData)
    return response.data
  },

  // El backend rechaza con 400 si es la última imagen del post.
  async removeImage(id: string, imageId: string): Promise<PostResponse> {
    const response = await api.delete<PostResponse>(
      `/admin/debate/posts/${id}/images/${imageId}`,
    )
    return response.data
  },

  // El backend valida que el set de ids sea exactamente el de las imágenes
  // existentes del post (ni de más ni de menos).
  async reorderImages(id: string, data: ReorderPostImagesDto): Promise<PostResponse> {
    const response = await api.patch<PostResponse>(
      `/admin/debate/posts/${id}/images/order`,
      data,
    )
    return response.data
  },

  async getComments(filters?: CommentsFilters): Promise<CommentsListResponse> {
    const response = await api.get<CommentsListResponse>('/admin/debate/comments', {
      params: {
        page: filters?.page,
        limit: filters?.limit,
        // 'all' no es un filtro real: se omite para traer todos
        status: filters?.status === 'all' ? undefined : filters?.status,
        postId: filters?.postId,
      },
    })
    return response.data
  },

  // Soft-delete: el backend marca el comment como REMOVED y resuelve sus
  // denuncias pendientes, no borra la fila.
  async removeComment(id: string): Promise<void> {
    await api.delete(`/admin/debate/comments/${id}`)
  },

  // Solo válido si el comment está FLAGGED (lo saca de la cola de revisión).
  async approveComment(id: string): Promise<CommentResponse> {
    const response = await api.patch<CommentResponse>(`/admin/debate/comments/${id}/approve`)
    return response.data
  },
}
