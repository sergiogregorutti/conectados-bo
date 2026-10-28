import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useAds, useDeleteAd, useToggleAd } from '@/hooks/useAds'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Ad, AdType } from '@/types/ad'

// Filtros y paginación viven en la URL: si no, al navegar a otra pantalla (ej.
// editar un ad) y volver con "atrás", se pierden la página y los filtros.
const adsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z.string().catch(''),
  type: z.enum(['all', 'banner', 'interstitial']).catch('all'),
  status: z.enum(['all', 'active', 'inactive']).catch('all'),
})

export const Route = createFileRoute('/dashboard/campaigns/')({
  validateSearch: (search) => adsSearchSchema.parse(search),
  component: AdsPage,
})

const ITEMS_PER_PAGE = 10

function AdsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = search
  const typeFilter = search.type
  const statusFilter = search.status
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useAds({
    page,
    limit: ITEMS_PER_PAGE,
    search: search.search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  })

  const deleteMutation = useDeleteAd()
  const toggleMutation = useToggleAd()

  const ads = data?.data ?? []
  const pagination = data?.pagination

  const onToggle = (id: string) => {
    toggleMutation.mutate(id)
  }

  const onDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  const setPage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }

  // Los filtros resetean a página 1 y usan replace (no empujan historial
  // propio): solo la paginación agrega una entrada nueva al historial.
  const handleSearchChange = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, search: value, page: 1 }), replace: true })
  }

  const handleTypeFilterChange = (value: AdType | 'all') => {
    navigate({ search: (prev) => ({ ...prev, type: value, page: 1 }), replace: true })
  }

  const handleStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    navigate({ search: (prev) => ({ ...prev, status: value, page: 1 }), replace: true })
  }

  // startsAt/endsAt son fechas sin hora, guardadas como medianoche UTC del día
  // elegido (ver AdForm). Si se formatean con la zona horaria local, en husos
  // negativos (ej. Argentina, UTC-3) se muestran un día antes del valor real.
  // timeZone: 'UTC' evita ese corrimiento.
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num)
  }

  const getCTR = (ad: Ad) => {
    if (ad.impressions === 0) return '0%'
    return ((ad.clicks / ad.impressions) * 100).toFixed(2) + '%'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ads</h1>
          <p className="text-muted-foreground">
            Gestiona los anuncios de la aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link to="/dashboard/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear Ad
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Buscar por título..."
          value={search.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={(v) => handleTypeFilterChange(v as AdType | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="interstitial">Interstitial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => handleStatusFilterChange(v as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Impresiones</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-center">Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay ads para mostrar
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={ad.mediaUrl}
                        alt={ad.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{ad.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Cada {ad.swipeFrequency} swipes · Prioridad {ad.priority}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ad.type === 'interstitial' ? 'default' : 'secondary'}>
                      {ad.type}
                    </Badge>
                    <Badge variant="outline" className="ml-1">
                      {ad.mediaType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {formatDate(ad.startsAt)} - {formatDate(ad.endsAt)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(ad.impressions)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(ad.clicks)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {getCTR(ad)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={() => onToggle(ad.id)}
                      disabled={toggleMutation.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!ad.destinationUrl}
                        asChild={!!ad.destinationUrl}
                        title={ad.destinationUrl ? undefined : 'Este ad no tiene URL de destino'}
                      >
                        {ad.destinationUrl ? (
                          <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/campaigns/$adId" params={{ adId: ad.id }}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(ad.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
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
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  className="w-8"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
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

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este ad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El ad será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
