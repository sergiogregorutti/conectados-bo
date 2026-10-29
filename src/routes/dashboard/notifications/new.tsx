import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { NotificationForm } from '@/components/notifications/NotificationForm'
import { SendNotificationDialog } from '@/components/notifications/SendNotificationDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

      <HowSendingWorks />

      <SendNotificationDialog
        payload={payload}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSent={() => navigate({ to: '/dashboard/notifications' })}
      />
    </div>
  )
}

function HowSendingWorks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cómo funcionan los envíos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">Cómo funciona</p>
          <p>
            Elegís a quién, escribís el mensaje y apretás "Revisar y enviar". Antes de confirmar
            vas a ver a cuántas personas va a llegar.
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">Cuándo sale</p>
          <p>
            No sale al instante. Hoy los envíos salen una vez por día, a las 09:00 (hora
            Argentina). Si programás una fecha, sale en el primer horario de envío después de
            esa fecha.
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">Estados del envío</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong className="text-foreground">Programado</strong>: está esperando su
              horario. Se puede cancelar.
            </li>
            <li>
              <strong className="text-foreground">Enviando</strong>: ya empezó. A veces los
              envíos grandes tardan más de un día porque se mandan de a tandas. Se puede
              cancelar y se frena lo que falta.
            </li>
            <li>
              <strong className="text-foreground">Enviado</strong>: terminó.
            </li>
            <li>
              <strong className="text-foreground">Cancelado</strong> y{' '}
              <strong className="text-foreground">Falló</strong>: no se completó.
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-foreground">Qué no se puede hacer</p>
          <p>
            No se puede editar un envío ya creado (si hay un error, cancelalo y creá otro de
            nuevo) y no se puede deshacer lo que ya se mandó.
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">Qué significan los números</p>
          <p>
            "Destinatarios" es una estimación tomada al crear el envío. "Les llegó" quiere decir
            que el servicio de notificaciones lo aceptó, no que la persona lo haya visto — hoy no
            podemos saber quién lo abrió.
          </p>
        </div>

        <div>
          <p className="font-medium text-foreground">Quiénes no reciben el mensaje</p>
          <p>
            Los usuarios eliminados o deshabilitados, quienes nunca activaron las notificaciones
            en su teléfono, y quienes las apagaron en sus preferencias dentro de la app.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
