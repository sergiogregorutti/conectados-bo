import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PostForm } from '@/components/debate/PostForm'
import { useCreatePost, useUpdatePost } from '@/hooks/usePosts'
import type { CreatePostDto } from '@/types/post'

export const Route = createFileRoute('/dashboard/debate/new')({
  component: NewPostPage,
})

function NewPostPage() {
  const navigate = useNavigate()
  const createMutation = useCreatePost()
  const updateMutation = useUpdatePost()

  const onSubmit = async (data: CreatePostDto & { isActive: boolean }) => {
    const { isActive, ...createData } = data
    const created = await createMutation.mutateAsync(createData)
    // El endpoint de creación siempre deja el post activo; si el admin lo
    // quiere inactivo lo desactivamos con un PATCH.
    if (!isActive) {
      await updateMutation.mutateAsync({ id: created.data.id, data: { isActive: false } })
    }
    navigate({ to: '/dashboard/debate' })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crear post</h1>
        <p className="text-muted-foreground">
          Completa el formulario para publicar un nuevo post de debate
        </p>
      </div>

      <PostForm
        onSubmit={onSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}
