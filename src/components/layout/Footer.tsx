import { useState } from "react"
import { Link } from "react-router-dom"
import { Clock, Mail, MapPin, Phone, Smile } from "lucide-react"
import { useTenantBranding } from "@/hooks/useTenantBranding"

const NOMBRE_CLINICA_POR_DEFECTO = "Clínica Sonrisa"

export function Footer() {
  const [logoRoto, setLogoRoto] = useState(false)
  const { marca } = useTenantBranding()
  const nombreClinica = marca?.nombre ?? NOMBRE_CLINICA_POR_DEFECTO
  const mostrarLogo = Boolean(marca?.logo_url) && !logoRoto

  return (
    <footer className="border-t border-border/70 bg-[#0f231e] text-[#f4eee1]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-heading text-lg font-medium">
            {mostrarLogo ? (
              <img
                src={marca?.logo_url ?? undefined}
                alt={nombreClinica}
                className="size-9 rounded-full object-cover"
                onError={() => setLogoRoto(true)}
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-[#f4eee1] text-[#0f231e]">
                <Smile className="size-4.5" />
              </span>
            )}
            {nombreClinica}
          </div>
          <p className="max-w-sm text-sm text-[#f4eee1]/70">
            Odontología general y estética con hora reservable en línea. Cada
            clínica de la red administra su propio catálogo y disponibilidad.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="font-heading text-base text-[#f4eee1]">Navegación</span>
          <Link to="/" className="text-[#f4eee1]/70 transition-colors hover:text-[#f4eee1]">
            Inicio
          </Link>
          <Link
            to="/tratamientos"
            className="text-[#f4eee1]/70 transition-colors hover:text-[#f4eee1]"
          >
            Tratamientos
          </Link>
          <Link
            to="/mis-horas"
            className="text-[#f4eee1]/70 transition-colors hover:text-[#f4eee1]"
          >
            Gestionar mi hora
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm text-[#f4eee1]/70">
          <span className="font-heading text-base text-[#f4eee1]">Contacto</span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-[#ff8f72]" />
            Av. Providencia 1234, Providencia, Santiago
          </span>
          <span className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-[#ff8f72]" />
            +56 9 1234 5678
          </span>
          <span className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-[#ff8f72]" />
            hola@clinicasonrisa.cl
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-[#ff8f72]" />
            Lun a vie 9:00–19:00 · Sáb 9:00–13:00
          </span>
        </div>
      </div>

      <div className="border-t border-[#f4eee1]/10 px-4 py-5 text-center text-xs text-[#f4eee1]/50 sm:px-6">
        © {new Date().getFullYear()} {nombreClinica}. Datos de contacto e
        imágenes de referencia, personalizables por clínica.
      </div>
    </footer>
  )
}
