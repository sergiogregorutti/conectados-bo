import { useState } from 'react'
import { ImageOff, Trash2 } from 'lucide-react'
import { useUserPhotos } from '@/hooks/useUsers'
import { Badge } from '@/components/ui/badge'
import { DeleteUserPhotoDialog } from '@/components/users/DeleteUserPhotoDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  userId: string
  userName?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserPhotosDialog({ userId, userName, open, onOpenChange }: Props) {
  // enabled = open: la foto solo se pide al abrir el modal (carga bajo
  // demanda), no junto al detalle de usuario o de reporte.
  const { data, isLoading, isError } = useUserPhotos(userId, open)
  const displayName = userName?.trim() || 'este usuario'
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fotos de {displayName}</DialogTitle>
          <DialogDescription>
            Útil para verificar reportes de perfil falso o contenido inapropiado.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">Cargando fotos...</p>
        )}

        {isError && (
          <p className="py-8 text-center text-sm text-destructive">
            No se pudieron cargar las fotos.
          </p>
        )}

        {data && data.photos.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Este usuario no tiene fotos cargadas.
          </p>
        )}

        {data && data.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.photos.map((photo) => (
              <div key={photo.id} className="space-y-1">
                <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                  {photo.url ? (
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo.thumbnailUrl ?? photo.url}
                        alt="Foto del usuario"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {photo.isMain && (
                    <Badge className="absolute left-1 top-1 text-[10px]">Principal</Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(photo.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Eliminar foto"
                    title="Eliminar foto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>

      <DeleteUserPhotoDialog
        userId={userId}
        userName={userName}
        photoId={deleteTargetId}
        open={!!deleteTargetId}
        onOpenChange={(photoDialogOpen) => !photoDialogOpen && setDeleteTargetId(null)}
      />
    </Dialog>
  )
}
