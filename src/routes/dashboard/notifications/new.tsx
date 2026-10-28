import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { NotificationForm } from '@/components/notifications/NotificationForm'
import { SendNotificationDialog } from '@/components/notifications/SendNotificationDialog'
import type { CreateNotificationDto } from '@/types/notification'

export const Route = createFileRoute('/dashboard/notifications/new')({
  component: NewNotificationPage,
})

function NewNotificationPage() {
  const navigate = useNavigate()
  const [payload, setPayload] = useState<CreateNotificationDto | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const onReview = (data: CreateNotificationDto) => {
    setPayload(data)
    setDialogOpen(true)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva notificación</h1>
        <p className="text-muted-foreground">
          Enviá un mensaje o recordatorio a los usuarios de la aplicación
        </p>
      </div>

      <NotificationForm onReview={onReview} />

      <SendNotificationDialog
        payload={payload}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSent={() => navigate({ to: '/dashboard/notifications' })}
      />
    </div>
  )
}
