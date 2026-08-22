import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PostForm } from '@/components/debate/PostForm'
import { usePost, useUpdatePost } from '@/hooks/usePosts'
import type { CreatePostDto } from '@/types/post'

export const Route = createFileRoute('/dashboard/debate/$postId')({
  component: EditPostPage,
})

function EditPostPage() {
  const { postId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading } = usePost(postId)
  const updateMutation = useUpdatePost()

  const onSubmit = async (data: CreatePostDto & { isActive: boolean }) => {
    await updateMutation.mutateAsync({
      id: postId,
      data: {
        description: data.description,
        publishedAt: data.publishedAt,
        isActive: data.isActive,
      },
    })
    navigate({ to: '/dashboard/debate' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Post no encontrado</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar post</h1>
        <p className="text-muted-foreground">
          Modifica los datos y las imágenes del post de debate
        </p>
      </div>

      <PostForm
        defaultValues={data.data}
        onSubmit={onSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
