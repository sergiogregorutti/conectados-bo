import { useForm, Controller } from 'react-hook-form'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MAX_POST_IMAGES, type CreatePostDto, type DebatePost } from '@/types/post'
import { PostImagesManager } from '@/components/debate/PostImagesManager'

interface PostFormValues {
  description: string
  publishedAt: string
  isActive: boolean
}

interface PostFormProps {
  defaultValues?: DebatePost
  onSubmit: (data: CreatePostDto & { isActive: boolean }) => Promise<void>
  isLoading?: boolean
}

// El input datetime-local necesita 'YYYY-MM-DDTHH:mm' en hora local
function toLocalInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

export function PostForm({ defaultValues, onSubmit, isLoading }: PostFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PostFormValues>({
    defaultValues: {
      description: defaultValues?.description ?? '',
      publishedAt: toLocalInput(defaultValues?.publishedAt),
      isActive: defaultValues?.isActive ?? true,
    },
  })

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  )

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setSelectedFiles((prev) => {
      const next = [...prev, ...files]
      if (next.length > MAX_POST_IMAGES) {
        setFileError(`Máximo ${MAX_POST_IMAGES} imágenes por post`)
        return next.slice(0, MAX_POST_IMAGES)
      }
      setFileError(null)
      return next
    })
  }

  const onRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  const onMoveImage = (index: number, direction: -1 | 1) => {
    setSelectedFiles((prev) => {
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  const onFormSubmit = async (values: PostFormValues) => {
    if (selectedFiles.length === 0 && !defaultValues) {
      setFileError('Selecciona al menos una imagen')
      return
    }
    await onSubmit({
      description: values.description,
      files: selectedFiles,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : undefined,
      isActive: values.isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        {defaultValues ? (
          <PostImagesManager postId={defaultValues.id} images={defaultValues.images} />
        ) : (
          <>
            <Label>Imágenes</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="group relative">
                    <img
                      src={previewUrls[index]}
                      alt={`Imagen ${index + 1}`}
                      className="h-20 w-20 rounded object-cover"
                    />
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-xs text-white">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Eliminar imagen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onMoveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded-full bg-background p-0.5 shadow disabled:opacity-30"
                        aria-label="Mover a la izquierda"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveImage(index, 1)}
                        disabled={index === selectedFiles.length - 1}
                        className="rounded-full bg-background p-0.5 shadow disabled:opacity-30"
                        aria-label="Mover a la derecha"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length < MAX_POST_IMAGES && (
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-primary hover:bg-muted/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mb-3 text-4xl text-muted-foreground">🖼️</div>
                <p className="text-sm font-medium">
                  Haz clic para seleccionar imágenes ({selectedFiles.length}/
                  {MAX_POST_IMAGES})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF</p>
              </div>
            )}
          </>
        )}

        {fileError && <p className="text-sm text-destructive">{fileError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Escribe el texto del post de debate..."
          {...register('description', {
            required: 'La descripción es requerida',
            maxLength: { value: 2000, message: 'Máximo 2000 caracteres' },
          })}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="publishedAt">Fecha de publicación</Label>
        <Input id="publishedAt" type="datetime-local" {...register('publishedAt')} />
        <p className="text-sm text-muted-foreground">
          Si la fecha es futura, el post quedará programado
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Activo</Label>
          <p className="text-sm text-muted-foreground">
            El post se mostrará a los usuarios cuando esté activo
          </p>
        </div>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : defaultValues ? 'Guardar cambios' : 'Crear post'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link to="/dashboard/debate">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
