import { apiFetch } from "@/lib/http-client"
import type { Sucursal } from "@/types/sucursales"

export async function listarSucursalesPublicas(): Promise<Sucursal[]> {
  const respuesta = await apiFetch<{ data: Sucursal[] }>("/publico/sucursales", {
    incluirClinica: true,
  })
  return respuesta.data
}
