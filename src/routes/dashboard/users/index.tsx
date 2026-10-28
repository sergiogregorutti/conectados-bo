import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Crown,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { getPremiumStatus } from '@/lib/premium'
import { GrantPremiumDialog } from '@/components/users/GrantPremiumDialog'
import { RevokePremiumDialog } from '@/components/users/RevokePremiumDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserStatusDialog } from '@/components/users/UserStatusDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  User,
  UserSortBy,
  UserSortOrder,
  UserStatusFilter,
} from '@/types/user'

const ITEMS_PER_PAGE = 20
type PremiumFilter = 'all' | 'premium' | 'free'

// Filtros y paginación viven en la URL (no en useState): si no, al navegar a
// otra pantalla (ej. el detalle de un user) y volver con el botón "atrás" del
// navegador, se pierden la página y los filtros que tenía elegidos el admin.
// .default() (no solo .catch()) es necesario para que TanStack Router sepa,
// a nivel de tipos, que estos campos son opcionales al navegar hacia esta
// ruta (ej. <Link to="/dashboard/users"> sin pasar `search`); .catch() de
// más protege además contra valores inválidos en la URL (ej. ?page=abc).
const usersSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  search: z.string().default('').catch(''),
  premium: z.enum(['all', 'premium', 'free']).default('all').catch('all'),
  status: z.enum(['active', 'disabled', 'all']).default('all').catch('all'),
  sortBy: z
    .enum(['createdAt', 'premiumUntil', 'totalSpent'])
    .default('createdAt')
    .catch('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc').catch('desc'),
})

export const Route = createFileRoute('/dashboard/users/')({
  validateSearch: usersSearchSchema,
  component: UsersPage,
})

function UsersPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page, sortBy, sortOrder } = search
  const premiumFilter: PremiumFilter = search.premium
  const statusFilter: UserStatusFilter = search.status

  const { data, isLoading, refetch, isFetching } = useUsers({
    page,
    limit: ITEMS_PER_PAGE,
    search: search.search || undefined,
    premium:
      premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
    status: statusFilter,
    sortBy,
    sortOrder,
  })

  const users = data?.users ?? []
  const pagination = data?.pagination

  const setPage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }

  // Los filtros resetean a página 1 y no acumulan historial propio (replace):
  // solo la paginación empuja una entrada nueva, así "atrás" avanza filtro por
  // filtro en vez de letra por letra en el buscador.
  const handleSearchChange = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, search: value, page: 1 }), replace: true })
  }

  const handlePremiumChange = (value: PremiumFilter) => {
    navigate({ search: (prev) => ({ ...prev, premium: value, page: 1 }), replace: true })
  }

  const handleStatusChange = (value: UserStatusFilter) => {
    navigate({ search: (prev) => ({ ...prev, status: value, page: 1 }), replace: true })
  }

  const handleSortByChange = (value: UserSortBy) => {
    navigate({ search: (prev) => ({ ...prev, sortBy: value, page: 1 }), replace: true })
  }

  const handleSortOrderChange = (value: UserSortOrder) => {
    navigate({ search: (prev) => ({ ...prev, sortOrder: value, page: 1 }), replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            Listado de usuarios registrados en la aplicación
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Buscar por nombre..."
          value={search.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select value={premiumFilter} onValueChange={(v) => handlePremiumChange(v as PremiumFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => handleStatusChange(v as UserStatusFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="disabled">Deshabilitados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => handleSortByChange(v as UserSortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Fecha de registro</SelectItem>
            <SelectItem value="premiumUntil">Vencimiento premium</SelectItem>
            <SelectItem value="totalSpent">Total gastado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => handleSortOrderChange(v as UserSortOrder)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descendente</SelectItem>
            <SelectItem value="asc">Ascendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Total gastado</TableHead>
              <TableHead className="text-right">Swipes</TableHead>
              <TableHead className="text-right">Matches</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="w-[60px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No hay usuarios para mostrar
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserRow({ user }: { user: User }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [grantOpen, setGrantOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const initials = (user.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const action = user.disabled ? 'enable' : 'disable'
  const premiumStatus = getPremiumStatus(user)
  // Si ya venció, no importa que currentProvider todavía diga MANUAL (el
  // backend puede tardar en limpiarlo): no hay nada activo que cancelar.
  const hasManualPremium = premiumStatus === 'active' && user.currentProvider === 'MANUAL'
  // Si ya tiene una suscripción paga real (Apple/Google) activa, el backend
  // rechaza el grant con 409: ni mostramos la opción.
  const hasPaidSubscription =
    premiumStatus === 'active' && !!user.currentProvider && !hasManualPremium

  return (
    <TableRow>
      <TableCell>
        <Link
          to="/dashboard/users/$userId"
          params={{ userId: user.id }}
          className="flex items-center gap-3 group"
        >
          <Avatar>
            {user.photoUrl ? <AvatarImage src={user.photoUrl} alt={user.name ?? ''} /> : null}
            <AvatarFallback>{initials || '?'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate group-hover:underline">
              {user.name ?? 'Sin nombre'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.id}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </Link>
      </TableCell>
      <TableCell>
        {premiumStatus === 'active' && (
          <div className="flex flex-col gap-1">
            <Badge>Premium</Badge>
            {user.currentPlan && (
              <span className="text-xs text-muted-foreground">
                {user.currentPlan}
                {user.currentProvider ? ` · ${user.currentProvider}` : ''}
              </span>
            )}
          </div>
        )}
        {premiumStatus === 'expired' && (
          <Badge variant="outline" className="text-muted-foreground">
            Fue premium
          </Badge>
        )}
        {premiumStatus === 'free' && <Badge variant="secondary">Free</Badge>}
      </TableCell>
      <TableCell>
        <span className="text-sm">{formatDate(user.premiumUntil)}</span>
      </TableCell>
      <TableCell className="text-right">
        {user.totalSpent.length === 0 ? (
          <span className="text-muted-foreground font-mono text-sm">—</span>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            {user.totalSpent.map((spend) => (
              <span key={spend.currency} className="font-mono text-sm">
                {formatCurrency(spend.amount, spend.currency)}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="text-right font-mono">
        {formatNumber(user.swipesCount)}
      </TableCell>
      <TableCell className="text-right font-mono">
        {formatNumber(user.matchesCount)}
      </TableCell>
      <TableCell>
        {user.disabled ? (
          <Badge variant="destructive" className="gap-1">
            <ShieldOff className="h-3 w-3" />
            Deshabilitado
          </Badge>
        ) : (
          <Badge variant="outline">Activo</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.disabled ? (
              <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                <ShieldCheck className="h-4 w-4" />
                Habilitar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDialogOpen(true)}
              >
                <ShieldOff className="h-4 w-4" />
                Deshabilitar
              </DropdownMenuItem>
            )}
            {!hasPaidSubscription && (
              <DropdownMenuItem onSelect={() => setGrantOpen(true)}>
                <Crown className="h-4 w-4" />
                {hasManualPremium ? 'Cambiar fecha de premium' : 'Otorgar premium manual'}
              </DropdownMenuItem>
            )}
            {hasManualPremium && (
              <DropdownMenuItem variant="destructive" onSelect={() => setRevokeOpen(true)}>
                <Ban className="h-4 w-4" />
                Cancelar premium manual
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <UserStatusDialog
          userId={user.id}
          userName={user.name}
          action={action}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
        <GrantPremiumDialog
          userId={user.id}
          userName={user.name}
          open={grantOpen}
          onOpenChange={setGrantOpen}
        />
        <RevokePremiumDialog
          userId={user.id}
          userName={user.name}
          open={revokeOpen}
          onOpenChange={setRevokeOpen}
        />
      </TableCell>
    </TableRow>
  )
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
