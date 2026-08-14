import { api } from '@/lib/axios'
import type {
  CreatePostDto,
  UpdatePostDto,
  PostsFilters,
  PostsListResponse,
  PostResponse,
} from '@/types/post'

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
    // Los campos de texto van antes del archivo (fastify multipart los parsea en orden)
    formData.append('description', data.description)
    if (data.publishedAt) formData.append('publishedAt', data.publishedAt)
    formData.append('file', data.file)
    const response = await api.post<PostResponse>('/admin/debate/posts', formData)
    return response.data
  },

  async updatePost(id: string, data: UpdatePostDto): Promise<PostResponse> {
    const response = await api.patch<PostResponse>(`/admin/debate/posts/${id}`, data)
    return response.data
  },
}
