import { useForm, Controller } from 'react-hook-form'
import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Ad, CreateAdDto, AdType, MediaType } from '@/types/ad'

interface AdFormValues {
  title: string
  type: AdType
  mediaType: MediaType
  destinationUrl: string
  startsAt: string
  endsAt: string
  isActive: boolean
  priority: number
  swipeFrequency: number
}

interface AdFormProps {
  defaultValues?: Ad
  onSubmit: (data: CreateAdDto) => Promise<void>
  isLoading?: boolean
}

// Tamaños según cómo se renderiza cada tipo en la app (AdBanner/AdInterstitial):
// el banner ocupa el ancho de la card del stack a 100pt de alto (~3.5:1), y el
// interstitial ocupa toda la pantalla en modo cover (relación vertical ~2:3).
// Ambos se recortan con "cover", así que lo importante debe ir centrado.
const RECOMMENDED_SIZE: Record<AdType, string> = {
  banner: 'Recomendado ~1200×340px (relación 3.5:1, horizontal). Se recorta en modo "cover": centrá el contenido importante.',
  interstitial: 'Recomendado ~1080×1620px (relación 2:3, vertical, pantalla completa). Se recorta en modo "cover": centrá el contenido importante.',
}

// MP4 (H.264/AAC) es el único formato que reproduce de forma confiable tanto
// en iOS (AVPlayer) como en Android (ExoPlayer) vía expo-av — WebM no anda en
// iOS y MOV es poco confiable en Android según el códec interno. Validado
// también en el backend (ads.service.ts).
const ALLOWED_VIDEO_TYPE = 'video/mp4'
const VIDEO_HELP =
  'Solo se acepta MP4 (H.264 + audio AAC): es el único formato que reproduce bien tanto en iOS como en Android. El video se descarga en cada impresión, así que conviene un clip corto (~10-15s) y liviano (idealmente menos de 5-8MB).'

function AdMediaPreview({
  src,
  mediaType,
  className,
}: {
  src: string
  mediaType: MediaType
  className?: string
}) {
  if (mediaType === 'video') {
    return <video src={src} className={className} muted autoPlay loop playsInline />
  }
  return <img src={src} alt="Vista previa" className={className} />
}

// Mockups aproximados de AdBanner.tsx / AdInterstitial.tsx (ver comentario de
// RECOMMENDED_SIZE) para mostrar cómo se recorta la imagen dentro de la app.
function BannerPreview({ previewUrl, mediaType }: { previewUrl: string; mediaType: MediaType }) {
  return (
    <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[1.75rem] border-4 border-foreground/80 bg-muted shadow-sm">
      <div className="flex aspect-[9/19.5] flex-col justify-center gap-1.5 p-2">
        <div className="flex-1 rounded-lg bg-background/60" />
        <div className="aspect-[3.5/1] w-full overflow-hidden rounded-md">
          <AdMediaPreview src={previewUrl} mediaType={mediaType} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 rounded-lg bg-background/60" />
      </div>
    </div>
  )
}

function InterstitialPreview({ previewUrl, mediaType }: { previewUrl: string; mediaType: MediaType }) {
  return (
    <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[1.75rem] border-4 border-foreground/80 bg-black shadow-sm">
      <div className="flex aspect-[9/19.5] flex-col">
        <div className="h-[65%] w-full overflow-hidden bg-muted">
          <AdMediaPreview src={previewUrl} mediaType={mediaType} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 items-center justify-center bg-black text-[10px] text-white/50">
          resto de la pantalla
        </div>
      </div>
    </div>
  )
}

export function AdForm({ defaultValues, onSubmit, isLoading }: AdFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AdFormValues>({
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          type: defaultValues.type,
          mediaType: defaultValues.mediaType,
          destinationUrl: defaultValues.destinationUrl,
          startsAt: defaultValues.startsAt.split('T')[0],
          endsAt: defaultValues.endsAt.split('T')[0],
          isActive: defaultValues.isActive,
          priority: defaultValues.priority,
          swipeFrequency: defaultValues.swipeFrequency,
        }
      : {
          title: '',
          type: 'banner',
          mediaType: 'image',
          destinationUrl: '',
          startsAt: '',
          endsAt: '',
          isActive: false,
          priority: 0,
          swipeFrequency: 10,
        },
  })

  const mediaType = watch('mediaType')
  const adType = watch('type')
  const accept = mediaType === 'video' ? ALLOWED_VIDEO_TYPE : 'image/*'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && mediaType === 'video' && file.type !== ALLOWED_VIDEO_TYPE) {
      setFileError('Solo se acepta video en formato MP4 (H.264/AAC)')
      setSelectedFile(null)
      e.target.value = ''
      return
    }
    setSelectedFile(file)
    setFileError(null)
  }

  const onFormSubmit = async (values: AdFormValues) => {
    if (!selectedFile && !defaultValues) {
      setFileError('El archivo es requerido')
      return
    }
    await onSubmit({
      ...values,
      file: selectedFile as File,
      priority: Number(values.priority),
      swipeFrequency: Number(values.swipeFrequency),
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
    })
  }

  const previewUrl = selectedFile
    ? URL.createObjectURL(selectedFile)
    : defaultValues?.mediaUrl ?? null

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Nombre del ad"
          {...register('title', { required: 'El título es requerido' })}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Nombre interno para identificar el ad
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tipo de Ad</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="interstitial">Interstitial</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-muted-foreground">
            Banner: en el stack. Interstitial: pantalla completa
          </p>
          <p className="text-sm text-muted-foreground">{RECOMMENDED_SIZE[adType]}</p>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Media</Label>
          <Controller
            name="mediaType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {mediaType === 'video' && (
            <p className="text-sm text-muted-foreground">{VIDEO_HELP}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Archivo de Media</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-primary hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            mediaType === 'video' ? (
              <video
                src={previewUrl}
                className="mb-3 max-h-40 max-w-full rounded object-contain"
                controls={false}
                muted
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="mb-3 max-h-40 max-w-full rounded object-contain"
              />
            )
          ) : (
            <div className="mb-3 text-4xl text-muted-foreground">
              {mediaType === 'video' ? '🎬' : '🖼️'}
            </div>
          )}
          <p className="text-sm font-medium">
            {selectedFile
              ? selectedFile.name
              : defaultValues
                ? 'Haz clic para reemplazar el archivo'
                : 'Haz clic para seleccionar un archivo'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {mediaType === 'video' ? 'Solo MP4 (H.264 + AAC)' : 'JPG, PNG, WebP, GIF'}
          </p>
        </div>
        {fileError && (
          <p className="text-sm text-destructive">{fileError}</p>
        )}

        {previewUrl && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Vista previa en la app ({adType === 'banner' ? 'banner en el stack' : 'pantalla completa'})
            </p>
            {adType === 'banner' ? (
              <BannerPreview previewUrl={previewUrl} mediaType={mediaType} />
            ) : (
              <InterstitialPreview previewUrl={previewUrl} mediaType={mediaType} />
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destinationUrl">URL de Destino</Label>
        <Input
          id="destinationUrl"
          placeholder="https://..."
          {...register('destinationUrl', {
            required: 'La URL de destino es requerida',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Ingresa una URL válida',
            },
          })}
        />
        {errors.destinationUrl && (
          <p className="text-sm text-destructive">{errors.destinationUrl.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          URL a la que se redirige al hacer click
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Fecha de Inicio</Label>
          <Input
            id="startsAt"
            type="date"
            {...register('startsAt', { required: 'La fecha de inicio es requerida' })}
          />
          {errors.startsAt && (
            <p className="text-sm text-destructive">{errors.startsAt.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endsAt">Fecha de Fin</Label>
          <Input
            id="endsAt"
            type="date"
            {...register('endsAt', { required: 'La fecha de fin es requerida' })}
          />
          {errors.endsAt && (
            <p className="text-sm text-destructive">{errors.endsAt.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Input
            id="priority"
            type="number"
            min={0}
            max={100}
            {...register('priority', {
              required: 'La prioridad es requerida',
              min: { value: 0, message: 'Mínimo 0' },
              max: { value: 100, message: 'Máximo 100' },
            })}
          />
          {errors.priority && (
            <p className="text-sm text-destructive">{errors.priority.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Mayor número = más prioridad (0-100)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="swipeFrequency">Frecuencia (swipes)</Label>
          <Input
            id="swipeFrequency"
            type="number"
            min={1}
            {...register('swipeFrequency', {
              required: 'La frecuencia es requerida',
              min: { value: 1, message: 'Mínimo 1 swipe' },
            })}
          />
          {errors.swipeFrequency && (
            <p className="text-sm text-destructive">{errors.swipeFrequency.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Mostrar cada X swipes
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Activo</Label>
          <p className="text-sm text-muted-foreground">
            El ad se mostrará a los usuarios cuando esté activo
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
          {isLoading ? 'Guardando...' : defaultValues ? 'Guardar cambios' : 'Crear Ad'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link to="/dashboard/campaigns">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
