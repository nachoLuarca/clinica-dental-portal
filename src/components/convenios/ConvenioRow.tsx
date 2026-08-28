import { HeartHandshake } from "lucide-react"
import { useImagenValida } from "@/hooks/useImagenValida"
import { formatTipoConvenio } from "@/lib/format"
import type { Convenio } from "@/types/convenios"

interface ConvenioRowProps {
  convenio: Convenio
}

/**
 * Fila de índice editorial, mismo lenguaje visual que `ServicioCard`: logo
 * a la izquierda (con reemplazo si falta o rompe), nombre y descripción.
 * No es una tarjeta clicable — el convenio no tiene ficha propia.
 */
export function ConvenioRow({ convenio }: ConvenioRowProps) {
  const { mostrar: mostrarLogo, onError } = useImagenValida(convenio.logo_url)

  return (
    <div className="flex items-center gap-4 py-5 sm:gap-6">
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-primary ring-1 ring-border/70">
        {mostrarLogo ? (
          <img
            src={convenio.logo_url ?? undefined}
            alt={convenio.nombre}
            className="size-full object-contain p-1.5"
            onError={onError}
          />
        ) : (
          <HeartHandshake className="size-6" />
        )}
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
          {formatTipoConvenio(convenio.tipo)}
        </span>
        <h3 className="font-heading text-xl leading-snug font-medium text-balance sm:text-2xl">
          {convenio.nombre}
        </h3>
        {convenio.descripcion && (
          <p className="max-w-xl text-sm text-muted-foreground">
            {convenio.descripcion}
          </p>
        )}
      </div>
    </div>
  )
}
