/**
 * Identificación pública de paciente por RUT (reemplaza el login por
 * password en el flujo de reserva). Ver `POST /publico/pacientes/verificar-rut`
 * y `POST /publico/pacientes` en `clinica-dental-api`.
 */

export interface DatosAltaPaciente {
  rut: string
  nombre: string
  apellido: string
  email?: string
  telefono: string
  fecha_nacimiento: string
  acepta_tratamiento_datos: true
}

export interface PacientePublico {
  id: number
  nombre: string
  apellido: string
  rut: string
}
