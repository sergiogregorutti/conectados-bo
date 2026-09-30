import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Red de contención para errores que rompen el árbol de React (ej. un módulo
// que falla al cargar por una extensión del navegador bloqueando la request).
// Sin esto, un error acá deja la página en blanco sin ningún mensaje.
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Algo salió mal</CardTitle>
              <CardDescription>
                Ocurrió un error inesperado. Si tenés un bloqueador de anuncios o
                extensiones activas, probá desactivarlas para este sitio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
