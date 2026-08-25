/** Convenio tal como lo expone `GET /publico/convenios`. */
export interface Convenio {
  id: number
  nombre: string
  tipo: string
  /** `null` cuando la clínica no cargó logo para este convenio. */
  logo_url: string | null
  descripcion: string | null
}
