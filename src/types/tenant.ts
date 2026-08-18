/**
 * Marca pública de la clínica tal como la expone `clinica-dental-api` en
 * `GET /publico/tenant`. La administra el staff desde el portal admin — acá
 * solo se consume y se aplica a la UI.
 */
export interface MarcaTenant {
  nombre: string
  logo_url: string | null
  color_primario: string | null
}
