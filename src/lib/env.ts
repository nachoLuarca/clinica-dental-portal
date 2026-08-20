/**
 * Configuración de entorno centralizada.
 *
 * ASUNCIÓN TEMPORAL: aún no está definido si en producción cada clínica
 * (tenant) se resuelve por subdominio, dominio propio u otra vía. Mientras
 * eso no se defina, cada instancia de este sitio apunta a una sola clínica
 * a través de `VITE_CLINICA_SLUG`. Cuando se resuelva la estrategia real,
 * este es el único lugar que debería cambiar.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  clinicaSlug: import.meta.env.VITE_CLINICA_SLUG || "clinica-demo",
  /**
   * Site key pública de Cloudflare Turnstile (segura de exponer en el
   * cliente: el secret que valida el token vive solo en el backend).
   */
  turnstileSiteKey:
    import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAEXDEbkaQP2g91pe",
}
