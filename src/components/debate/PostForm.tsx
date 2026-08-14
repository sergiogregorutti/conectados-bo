import { useForm, Controller } from 'react-hook-form'
import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { CreatePostDto, DebatePost } from '@/types/post'

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setFileError(null)
  }

  const onFormSubmit = async (values: PostFormValues) => {
    if (!selectedFile && !defaultValues) {
      setFileError('La imagen es requerida')
      return
    }
    await onSubmit({
      description: values.description,
      file: selectedFile as File,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : undefined,
      isActive: values.isActive,
    })
  }

  const previewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : defaultValues?.imageUrl ?? null

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Imagen</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-primary hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="mb-3 max-h-40 max-w-full rounded object-contain"
            />
          ) : (
            <div className="mb-3 text-4xl text-muted-foreground">🖼️</div>
          )}
          <p className="text-sm font-medium">
            {selectedFile
              ? selectedFile.name
              : defaultValues
                ? 'Haz clic para reemplazar la imagen'
                : 'Haz clic para seleccionar una imagen'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF</p>
        </div>
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
