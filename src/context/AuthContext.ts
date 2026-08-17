import { createContext } from "react"
import type { DatosLogin, DatosRegistro, Paciente } from "@/types/paciente"

export interface AuthContextValue {
  paciente: Paciente | null
  /** true mientras se hidrata la sesión (token guardado -> /paciente/me) */
  cargandoSesion: boolean
  autenticado: boolean
  iniciarSesion: (datos: DatosLogin) => Promise<Paciente>
  registrarse: (datos: DatosRegistro) => Promise<Paciente>
  cerrarSesion: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
