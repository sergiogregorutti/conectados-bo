import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useAddPostImages,
  useRemovePostImage,
  useReorderPostImages,
} from '@/hooks/usePosts'
import { MAX_POST_IMAGES, type DebatePostImage } from '@/types/post'

interface PostImagesManagerProps {
  postId: string
  images: DebatePostImage[]
}

export function PostImagesManager({ postId, images }: PostImagesManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [prevImages, setPrevImages] = useState(images)
  const [localImages, setLocalImages] = useState(images)
  const [orderDirty, setOrderDirty] = useState(false)
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)

  // Sincroniza el estado local con la prop cuando cambia (post recargado tras
  // agregar/quitar imágenes o guardar el orden) sin pasar por un efecto.
  if (prevImages !== images) {
    setPrevImages(images)
    setLocalImages(images)
    setOrderDirty(false)
  }

  const addMutation = useAddPostImages()
  const removeMutation = useRemovePostImage()
  const reorderMutation = useReorderPostImages()

  const onMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= localImages.length) return
    const next = [...localImages]
    ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
    setLocalImages(next)
    setOrderDirty(true)
  }

  const onSaveOrder = () => {
    reorderMutation.mutate({
      id: postId,
      data: { order: localImages.map((image, index) => ({ id: image.id, order: index })) },
    })
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    const remaining = MAX_POST_IMAGES - images.length
    if (files.length > remaining) {
      setAddError(`Solo podés agregar ${remaining} imagen(es) más (máximo ${MAX_POST_IMAGES})`)
      return
    }
    setAddError(null)
    addMutation.mutate({ id: postId, files })
  }

  const onConfirmRemove = () => {
    if (!removeTargetId) return
    removeMutation.mutate(
      { id: postId, imageId: removeTargetId },
      { onSuccess: () => setRemoveTargetId(null) },
    )
  }

  const canAddMore = images.length < MAX_POST_IMAGES
  const canRemove = images.length > 1

  return (
    <div className="space-y-3">
      <Label>Imágenes ({images.length}/{MAX_POST_IMAGES})</Label>

      <div className="flex flex-wrap gap-3">
        {localImages.map((image, index) => (
          <div key={image.id} className="group relative">
            <img
              src={image.url}
              alt={`Imagen ${index + 1}`}
              className="h-20 w-20 rounded object-cover"
            />
            <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-xs text-white">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => setRemoveTargetId(image.id)}
              disabled={!canRemove || removeMutation.isPending}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-30"
              aria-label="Eliminar imagen"
              title={canRemove ? 'Eliminar imagen' : 'El post necesita al menos una imagen'}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                className="rounded-full bg-background p-0.5 shadow disabled:opacity-30"
                aria-label="Mover a la izquierda"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === localImages.length - 1}
                className="rounded-full bg-background p-0.5 shadow disabled:opacity-30"
                aria-label="Mover a la derecha"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {orderDirty && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onSaveOrder}
            disabled={reorderMutation.isPending}
          >
            {reorderMutation.isPending ? 'Guardando orden...' : 'Guardar orden'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setLocalImages(images)
              setOrderDirty(false)
            }}
          >
            Cancelar
          </Button>
        </div>
      )}

      {canAddMore && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? 'Subiendo...' : 'Agregar imágenes'}
          </Button>
        </>
      )}

      {addError && <p className="text-sm text-destructive">{addError}</p>}
      {addMutation.isError && (
        <p className="text-sm text-destructive">No se pudieron subir las imágenes</p>
      )}
      {removeMutation.isError && (
        <p className="text-sm text-destructive">No se pudo eliminar la imagen</p>
      )}
      {reorderMutation.isError && (
        <p className="text-sm text-destructive">No se pudo guardar el orden</p>
      )}

      <AlertDialog open={!!removeTargetId} onOpenChange={(open) => !open && setRemoveTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La imagen será eliminada permanentemente del post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
