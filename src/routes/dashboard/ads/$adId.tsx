import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AdForm } from '@/components/ads/AdForm'
import { useAd, useUpdateAd } from '@/hooks/useAds'
import type { CreateAdDto } from '@/types/ad'

export const Route = createFileRoute('/dashboard/ads/$adId')({
  component: EditAdPage,
})

function EditAdPage() {
  const { adId } = Route.useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useAd(adId)
  const updateMutation = useUpdateAd()

  const onSubmit = async (formData: CreateAdDto) => {
    await updateMutation.mutateAsync({ id: adId, data: formData })
    navigate({ to: '/dashboard/ads' })
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
        <p className="text-muted-foreground">Ad no encontrado</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Ad</h1>
        <p className="text-muted-foreground">
          Modifica los datos del anuncio
        </p>
      </div>

      <AdForm
        defaultValues={data.data}
        onSubmit={onSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
