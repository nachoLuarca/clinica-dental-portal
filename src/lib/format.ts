const formateadorClp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})

export function formatClp(valor: number): string {
  return formateadorClp.format(valor)
}

/**
 * Normaliza un texto a un identificador simple ("Limpieza dental" ->
 * "limpieza-dental"). Se usa para intentar precargar el tratamiento del
 * flujo de reserva a partir del slug del catálogo (mock, Módulo 2) contra
 * el nombre real que expone `GET /publico/tratamientos` (que no trae
 * slug propio) — es solo un calce de UI, nunca una regla de negocio.
 */
export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function formatDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60

  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}
