import { Badge } from "@/components/ui/badge"
import type { EstadoCita } from "@/types/reserva"

const ETIQUETAS: Record<EstadoCita, string> = {
  reservada: "Reservada",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
}

const VARIANTES: Record<EstadoCita, "default" | "secondary" | "outline" | "destructive"> = {
  reservada: "default",
  confirmada: "secondary",
  cancelada: "destructive",
  completada: "outline",
}

export function EstadoCitaBadge({ estado }: { estado: EstadoCita }) {
  return <Badge variant={VARIANTES[estado]}>{ETIQUETAS[estado]}</Badge>
}
