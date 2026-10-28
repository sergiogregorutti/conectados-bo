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
    try {
      // El endpoint de creación siempre deja el post activo (sin importar el
      // valor de "Activo" del form); si el admin lo quiere como borrador lo
      // desactivamos después con un PATCH. Por eso, si va a quedar en
      // borrador, NO mandamos notify=true en el create: el post queda activo
      // unos milisegundos antes del PATCH, y el backend rechaza (400) poner
      // notify en un post que ya está "visible" en ese instante. El admin
      // vuelve a decidir el aviso cuando más adelante active el borrador.
      const created = await createMutation.mutateAsync({
        ...createData,
        notify: isActive ? createData.notify : undefined,
      })
      if (!isActive) {
        await updateMutation.mutateAsync({ id: created.data.id, data: { isActive: false } })
      }
      navigate({ to: '/dashboard/debate' })
    } catch {
      // El error ya se muestra en un toast desde useCreatePost/useUpdatePost
    }
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
