import { createFileRoute, Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ShieldOff,
  Ticket,
  XCircle,
} from 'lucide-react'
import { useUser } from '@/hooks/useUsers'
import { UserStatusDialog } from '@/components/users/UserStatusDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  CouponRedemption,
  ModerationLogEntry,
  Subscription,
  SubscriptionTransaction,
  UserDetail,
} from '@/types/user'

export const Route = createFileRoute('/dashboard/users/$userId')({
  component: UserDetailPage,
})

function UserDetailPage() {
  const { userId } = Route.useParams()
  const { data, isLoading, error } = useUser(userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (error) {
    const notFound = isAxiosError(error) && error.response?.status === 404
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">
          {notFound ? 'Usuario no encontrado' : 'Error al cargar el usuario'}
        </p>
        <Button asChild variant="outline">
          <Link to="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Usuarios
          </Link>
        </Button>
      </div>

      <UserHeader user={data} />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Swipes" value={formatNumber(data.swipesCount)} />
        <StatCard label="Matches" value={formatNumber(data.matchesCount)} />
        <StatCard
          label="Total gastado"
          value={
            data.totalSpent.length === 0
              ? '—'
              : data.totalSpent
                  .map((s) => formatCurrency(s.amount, s.currency))
                  .join(' · ')
          }
        />
      </div>

      <SubscriptionsSection subscriptions={data.subscriptions} />
      <CouponsSection redemptions={data.couponRedemptions} />
      <ModerationSection log={data.moderationLog} />
    </div>
  )
}

function UserHeader({ user }: { user: UserDetail }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const initials = (user.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const action = user.disabled ? 'enable' : 'disable'

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-6 pt-6">
        <Avatar size="lg" className="size-20">
          {user.photoUrl ? <AvatarImage src={user.photoUrl} alt={user.name ?? ''} /> : null}
          <AvatarFallback className="text-xl">{initials || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{user.name ?? 'Sin nombre'}</h1>
            {user.isPremium ? <Badge>Premium</Badge> : <Badge variant="secondary">Free</Badge>}
            {user.disabled ? (
              <Badge variant="destructive" className="gap-1">
                <ShieldOff className="h-3 w-3" />
                Deshabilitado
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Activo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono break-all">{user.id}</p>
          {user.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
        <Separator orientation="vertical" className="hidden h-20 md:block" />
        <div className="grid gap-2 text-sm">
          <InfoLine label="Plan" value={user.currentPlan ?? '—'} />
          <InfoLine label="Provider" value={user.currentProvider ?? '—'} />
          <InfoLine label="Vencimiento premium" value={formatDate(user.premiumUntil)} />
          <InfoLine label="Registrado" value={formatDate(user.createdAt)} />
          {user.disabledAt && (
            <InfoLine label="Deshabilitado el" value={formatDate(user.disabledAt)} />
          )}
        </div>
        <div className="w-full md:w-auto md:ml-auto">
          {user.disabled ? (
            <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Habilitar
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setDialogOpen(true)}
              className="w-full md:w-auto"
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Deshabilitar
            </Button>
          )}
        </div>
      </CardContent>
      <UserStatusDialog
        userId={user.id}
        userName={user.name}
        action={action}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-36">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}

function SubscriptionsSection({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suscripciones</CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin suscripciones registradas</p>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <div className="rounded-md border p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getStatusVariant(subscription.status)}>{subscription.status}</Badge>
        <span className="font-medium">{subscription.plan}</span>
        <span className="text-sm text-muted-foreground">· {subscription.provider}</span>
        {subscription.isInTrial && <Badge variant="outline">Trial</Badge>}
        {subscription.autoRenewEnabled ? (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Auto-renueva
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <XCircle className="h-3 w-3" />
            No renueva
          </Badge>
        )}
        {subscription.couponCode && (
          <Badge variant="outline" className="gap-1">
            <Ticket className="h-3 w-3" />
            {subscription.couponCode}
          </Badge>
        )}
      </div>

      <div className="grid gap-2 text-sm md:grid-cols-3">
        <InfoLine label="Inicio" value={formatDate(subscription.startedAt)} />
        <InfoLine label="Vencimiento" value={formatDate(subscription.expiresAt)} />
        <InfoLine label="Cancelada" value={formatDate(subscription.canceledAt)} />
      </div>

      {subscription.transactions.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Transacciones</p>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscription.transactions.map((tx, idx) => (
                  <TransactionRow key={idx} transaction={tx} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionRow({ transaction }: { transaction: SubscriptionTransaction }) {
  const amount = Number(transaction.priceMicros) / 1_000_000
  const isRefund = transaction.type.toUpperCase() === 'REFUND'
  return (
    <TableRow>
      <TableCell>
        <Badge variant={isRefund ? 'destructive' : 'secondary'}>{transaction.type}</Badge>
      </TableCell>
      <TableCell className="text-right font-mono">
        {isRefund ? '-' : ''}
        {formatCurrency(Math.abs(amount), transaction.currency)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDateTime(transaction.occurredAt)}
      </TableCell>
    </TableRow>
  )
}

function CouponsSection({ redemptions }: { redemptions: CouponRedemption[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cupones canjeados</CardTitle>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin canjes registrados</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Días otorgados</TableHead>
                  <TableHead>Canjeado el</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Ticket className="h-3 w-3" />
                        {r.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{r.grantDays}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(r.redeemedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ModerationSection({ log }: { log: ModerationLogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de moderación</CardTitle>
      </CardHeader>
      <CardContent>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin acciones de moderación</p>
        ) : (
          <ul className="space-y-3">
            {log.map((entry, idx) => (
              <li key={idx} className="flex gap-3">
                <div className="mt-1">
                  {entry.action === 'DISABLE' ? (
                    <ShieldOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={entry.action === 'DISABLE' ? 'destructive' : 'outline'}
                    >
                      {entry.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                  {entry.reason && (
                    <p className="text-sm text-muted-foreground">{entry.reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
                    Admin: {entry.adminId}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const upper = status.toUpperCase()
  if (upper === 'ACTIVE' || upper === 'IN_TRIAL') return 'default'
  if (upper === 'IN_GRACE') return 'secondary'
  if (upper === 'CANCELED' || upper === 'EXPIRED') return 'destructive'
  return 'outline'
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNumber(num: number) {
  return new Intl.NumberFormat('es-AR').format(num)
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}
