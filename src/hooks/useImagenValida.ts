import { useEffect, useState } from "react"

/**
 * Patrón repetido en varios componentes (Navbar, Footer, filas de convenio/
 * profesional): mostrar una `<img>` con fallback a un ícono si la URL no
 * vino, o si vino pero rompió al cargar (`onError`). Centralizado acá para
 * no reimplementar el mismo `useState` + `onError` en cada uno.
 *
 * El "roto" se resetea si la URL cambia — si no, una fila que reutiliza el
 * mismo componente para otra entidad (mismo `key`, distinta prop) arrastraría
 * el estado de la imagen anterior.
 */
export function useImagenValida(url: string | null | undefined): {
  mostrar: boolean
  onError: () => void
} {
  const [rota, setRota] = useState(false)

  useEffect(() => {
    setRota(false)
  }, [url])

  return {
    mostrar: Boolean(url) && !rota,
    onError: () => setRota(true),
  }
}
