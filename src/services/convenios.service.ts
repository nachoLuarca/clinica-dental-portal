import { apiFetch } from "@/lib/http-client"
import type { Convenio } from "@/types/convenios"

export async function listarConveniosPublicos(): Promise<Convenio[]> {
  const respuesta = await apiFetch<{ data: Convenio[] }>("/publico/convenios", {
    incluirClinica: true,
  })
  return respuesta.data
}
