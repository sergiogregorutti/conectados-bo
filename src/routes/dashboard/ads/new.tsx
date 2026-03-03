import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AdForm } from '@/components/ads/AdForm'
import { useCreateAd } from '@/hooks/useAds'
import type { CreateAdDto } from '@/types/ad'

export const Route = createFileRoute('/dashboard/ads/new')({
  component: NewAdPage,
})

function NewAdPage() {
  const navigate = useNavigate()
  const createMutation = useCreateAd()

  const onSubmit = async (data: CreateAdDto) => {
    await createMutation.mutateAsync(data)
    navigate({ to: '/dashboard/ads' })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crear Ad</h1>
        <p className="text-muted-foreground">
          Completa el formulario para crear un nuevo anuncio
        </p>
      </div>

      <AdForm
        onSubmit={onSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
