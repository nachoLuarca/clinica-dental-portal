import { serviciosMock } from "@/data/servicios.mock"
import type { Servicio } from "@/types/servicio"

/**
 * Capa de acceso al catálogo de servicios/tratamientos.
 *
 * TEMPORAL: hoy responde con `serviciosMock` simulando una pequeña latencia
 * de red. Cuando `clinica-dental-api` esté disponible en este entorno, solo
 * hay que reemplazar el cuerpo de estas funciones por llamadas `fetch`/cliente
 * HTTP contra el endpoint público del catálogo — la firma (parámetros y tipo
 * de retorno) no debería cambiar, así que ninguna pantalla debería tocarse.
 *
 * No se implementa aquí ninguna regla de negocio (precio final, disponibilidad,
 * etc.): eso siempre lo resuelve la API.
 */

const LATENCIA_SIMULADA_MS = 350

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function obtenerServicios(): Promise<Servicio[]> {
  await esperar(LATENCIA_SIMULADA_MS)
  return serviciosMock
}

export async function obtenerServiciosDestacados(): Promise<Servicio[]> {
  await esperar(LATENCIA_SIMULADA_MS)
  return serviciosMock.filter((servicio) => servicio.destacado)
}

export async function obtenerServicioPorSlug(
  slug: string
): Promise<Servicio | null> {
  await esperar(LATENCIA_SIMULADA_MS)
  return serviciosMock.find((servicio) => servicio.slug === slug) ?? null
}

export function obtenerCategorias(): string[] {
  const categorias = new Set(serviciosMock.map((servicio) => servicio.categoria))
  return Array.from(categorias)
}
