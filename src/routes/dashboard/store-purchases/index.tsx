import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { CheckCircle2, Receipt, Search, XCircle } from 'lucide-react'
import { useLookupStorePurchase, useRegisterStorePurchase } from '@/hooks/useStorePurchases'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { StoreProvider, StorePurchaseLookup } from '@/types/storePurchase'

export const Route = createFileRoute('/dashboard/store-purchases/')({
  component: StorePurchasesPage,
})

const RECEIPT_HELP: Record<StoreProvider, string> = {
  GOOGLE:
    'Play Console → Administración de pedidos → buscá el pedido (por mail o GPA) → "Copiar el token de compra". El número GPA no sirve.',
  APPLE: 'El transactionId de la compra (App Store Connect o el recibo del usuario).',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })

function StorePurchasesPage() {
  const [provider, setProvider] = useState<StoreProvider>('GOOGLE')
  const [receipt, setReceipt] = useState('')
  const [userId, setUserId] = useState('')
  const [note, setNote] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const lookup = useLookupStorePurchase()
  const register = useRegisterStorePurchase()
  const result: StorePurchaseLookup | undefined = lookup.data

  const onLookup = (e: React.FormEvent) => {
    e.preventDefault()
    register.reset()
    lookup.mutate({ provider, receipt: receipt.trim() })
  }

  const onRegister = () => {
    register.mutate(
      {
        provider,
        receipt: receipt.trim(),
        userId: result?.receiptUserId ? undefined : userId.trim() || undefined,
        note: note.trim() || undefined,
      },
      {
        // Re-consulta para que la tarjeta muestre "ya está registrada".
        onSuccess: () => lookup.mutate({ provider, receipt: receipt.trim() }),
        onSettled: () => setIsConfirmOpen(false),
      },
    )
  }

  const ownerId = result?.registeredUserId ?? result?.receiptUserId ?? (userId.trim() || null)
  const needsUserId = Boolean(result && !result.registeredUserId && !result.receiptUserId)
  const canRegister =
    Boolean(result) &&
    !result?.registeredUserId &&
    (result?.receiptUserId ? result.receiptUserExists : userId.trim().length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Receipt className="h-6 w-6" /> Compras de tienda
        </h1>
        <p className="text-muted-foreground">
          Para cuando Google o Apple cobraron y el usuario no quedó premium. Consultá el recibo y,
          si corresponde, registralo como suscripción real (se renueva sola, no como premium
          manual).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Consultar el recibo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLookup} method="post" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="space-y-2">
                <Label>Tienda</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => {
                    setProvider(v as StoreProvider)
                    lookup.reset()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOGLE">Google Play</SelectItem>
                    <SelectItem value="APPLE">App Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">
                  {provider === 'GOOGLE' ? 'Token de compra' : 'Transaction ID'}
                </Label>
                <Textarea
                  id="receipt"
                  value={receipt}
                  onChange={(e) => {
                    setReceipt(e.target.value)
                    lookup.reset()
                  }}
                  rows={3}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">{RECEIPT_HELP[provider]}</p>
              </div>
            </div>
            <Button type="submit" disabled={receipt.trim().length < 4 || lookup.isPending}>
              <Search className="mr-2 h-4 w-4" />
              {lookup.isPending ? 'Consultando…' : 'Consultar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>2. Lo que dice la tienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
              <dt className="text-muted-foreground">Plan</dt>
              <dd>
                {result.plan} <span className="text-muted-foreground">({result.productId})</span>
              </dd>
              <dt className="text-muted-foreground">Estado</dt>
              <dd>
                <Badge variant="outline">{result.status}</Badge>
                {result.isInTrial && <Badge className="ml-2">Prueba</Badge>}
              </dd>
              <dt className="text-muted-foreground">Desde / vence</dt>
              <dd>
                {formatDate(result.startedAt)} → {formatDate(result.expiresAt)}
              </dd>
              <dt className="text-muted-foreground">Renovación automática</dt>
              <dd>{result.autoRenewEnabled ? 'Sí' : 'No'}</dd>
              <dt className="text-muted-foreground">Pedido</dt>
              <dd className="font-mono text-xs">{result.latestTransactionId ?? '—'}</dd>
              <dt className="text-muted-foreground">Usuario del recibo</dt>
              <dd>
                {result.receiptUserId ? (
                  <span className="flex items-center gap-2">
                    <Link
                      to="/dashboard/users/$userId"
                      params={{ userId: result.receiptUserId }}
                      className="font-mono text-xs underline"
                    >
                      {result.receiptUserId}
                    </Link>
                    {result.receiptUserExists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" /> no existe o está borrado
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">El recibo no trae usuario</span>
                )}
              </dd>
            </dl>

            {result.registeredUserId ? (
              <p className="rounded-md border p-3 text-sm">
                Esta compra <strong>ya está registrada</strong> a{' '}
                <Link
                  to="/dashboard/users/$userId"
                  params={{ userId: result.registeredUserId }}
                  className="font-mono text-xs underline"
                >
                  {result.registeredUserId}
                </Link>
                . No hace falta hacer nada.
              </p>
            ) : (
              <div className="space-y-4 border-t pt-4">
                {needsUserId && (
                  <div className="space-y-2">
                    <Label htmlFor="userId">ID del usuario (obligatorio: el recibo no lo trae)</Label>
                    <Input
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="note">Nota (opcional)</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={300}
                  />
                </div>
                <Button disabled={!canRegister || register.isPending} onClick={() => setIsConfirmOpen(true)}>
                  Registrar compra
                </Button>
                {register.data && (
                  <p className="text-sm text-green-600">
                    Listo: premium hasta{' '}
                    {register.data.premiumUntil ? formatDate(register.data.premiumUntil) : '—'}.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Registrar la compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Se crea la suscripción {result?.plan} de {provider === 'GOOGLE' ? 'Google' : 'Apple'}{' '}
              para el usuario <span className="font-mono">{ownerId}</span>, vigente hasta{' '}
              {result ? formatDate(result.expiresAt) : '—'}. Queda registrado en el historial de
              moderación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={register.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={register.isPending} onClick={onRegister}>
              {register.isPending ? 'Registrando…' : 'Registrar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
