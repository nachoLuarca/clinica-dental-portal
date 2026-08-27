import { Component, type ErrorInfo, type ReactNode } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  huboError: boolean
}

/**
 * Red de seguridad para errores de render no capturados (un componente que
 * lanza, no un error de red: esos ya se manejan por página vía ApiError).
 * Tiene que ser una clase: es el unico mecanismo de React para
 * componentDidCatch/getDerivedStateFromError, no existe equivalente en hooks.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { huboError: false }

  static getDerivedStateFromError(): State {
    return { huboError: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Error no capturado en la app:", error, info.componentStack)
  }

  render() {
    if (this.state.huboError) {
      return (
        <section className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <TriangleAlert className="size-6" />
          </span>
          <h1 className="font-heading text-2xl font-medium">
            Algo salió mal
          </h1>
          <p className="text-muted-foreground">
            Ocurrió un error inesperado. Intenta recargar la página; si el
            problema sigue, vuelve más tarde.
          </p>
          <Button className="rounded-full" onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </section>
      )
    }

    return this.props.children
  }
}
