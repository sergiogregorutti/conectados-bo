import { useForm, Controller } from 'react-hook-form'
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
  mediaUrl: string
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

export function AdForm({ defaultValues, onSubmit, isLoading }: AdFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AdFormValues>({
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          type: defaultValues.type,
          mediaType: defaultValues.mediaType,
          mediaUrl: defaultValues.mediaUrl,
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
          mediaUrl: '',
          destinationUrl: '',
          startsAt: '',
          endsAt: '',
          isActive: false,
          priority: 0,
          swipeFrequency: 10,
        },
  })

  const onFormSubmit = async (values: AdFormValues) => {
    await onSubmit({
      ...values,
      priority: Number(values.priority),
      swipeFrequency: Number(values.swipeFrequency),
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
    })
  }

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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mediaUrl">URL del Media</Label>
        <Input
          id="mediaUrl"
          placeholder="https://..."
          {...register('mediaUrl', {
            required: 'La URL del media es requerida',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Ingresa una URL válida',
            },
          })}
        />
        {errors.mediaUrl && (
          <p className="text-sm text-destructive">{errors.mediaUrl.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          URL de la imagen o video (Supabase Storage)
        </p>
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
          <Link to="/dashboard/ads">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
