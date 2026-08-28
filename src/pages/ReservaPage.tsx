import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PasoConfirmar } from "@/components/reserva/PasoConfirmar"
import { PasoDisponibilidad } from "@/components/reserva/PasoDisponibilidad"
import { PasoEspecialidadLista } from "@/components/reserva/PasoEspecialidadLista"
import { PasoExito } from "@/components/reserva/PasoExito"
import { PasoIdentificacion } from "@/components/reserva/PasoIdentificacion"
import { PasoInicio } from "@/components/reserva/PasoInicio"
import { PasoProfesionalLista } from "@/components/reserva/PasoProfesionalLista"
import { PasoSucursalLista } from "@/components/reserva/PasoSucursalLista"
import { PasoTratamientoEspecifico } from "@/components/reserva/PasoTratamientoEspecifico"
import { StepperReserva } from "@/components/reserva/StepperReserva"
import { useReservaWizard, type PasoReserva } from "@/hooks/useReservaWizard"
import { cn } from "@/lib/utils"

const TITULOS: Record<PasoReserva, string> = {
  inicio: "¿Cómo quieres buscar tu hora?",
  "sucursal-lista": "Elige una sucursal",
  "especialidad-lista": "¿Qué especialidad necesitas?",
  "profesional-lista": "¿Con quién prefieres atenderte?",
  disponibilidad: "Elige un horario",
  "tratamiento-especifico": "¿Qué tratamiento necesitas?",
  identificacion: "Identifícate con tu RUT",
  confirmar: "Confirma tu reserva",
  exito: "",
}

export function ReservaPage() {
  const wizard = useReservaWizard()

  const titulo = TITULOS[wizard.paso]
  const sinBotonVolver = wizard.paso === "inicio" || wizard.paso === "exito"

  function volver() {
    switch (wizard.paso) {
      case "sucursal-lista":
      case "profesional-lista":
        wizard.volverAPaso("inicio")
        break
      case "especialidad-lista":
        wizard.volverAPaso(
          wizard.entrada === "sucursal"
            ? "sucursal-lista"
            : wizard.entrada === "profesional"
              ? "profesional-lista"
              : "inicio"
        )
        break
      case "disponibilidad":
        wizard.volverAPaso("especialidad-lista")
        break
      case "tratamiento-especifico":
        wizard.volverAPaso("disponibilidad")
        break
      case "identificacion":
        wizard.volverAPaso(
          wizard.tratamiento && wizard.entrada
            ? "tratamiento-especifico"
            : "disponibilidad"
        )
        break
      case "confirmar":
        wizard.volverAPaso("identificacion")
        break
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      {wizard.paso !== "inicio" && wizard.paso !== "exito" && (
        <div className="mb-8">
          <StepperReserva pasos={wizard.pasosVisibles} pasoActual={wizard.paso} />
        </div>
      )}

      <div
        key={wizard.paso}
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {!sinBotonVolver && (
          <button
            type="button"
            onClick={volver}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="size-4" />
            Volver
          </button>
        )}

        {titulo && (
          <h1
            className={cn(
              "mb-6 font-heading text-2xl font-medium text-balance sm:text-3xl",
              wizard.paso === "identificacion" && "mx-auto max-w-md text-center"
            )}
          >
            {titulo}
          </h1>
        )}

        {wizard.paso === "inicio" && (
          <PasoInicio onElegir={wizard.elegirEntrada} />
        )}

        {wizard.paso === "sucursal-lista" && (
          <PasoSucursalLista
            sucursales={wizard.sucursales}
            cargando={wizard.cargandoSucursales}
            error={wizard.errorSucursales}
            onElegir={wizard.elegirSucursal}
          />
        )}

        {wizard.paso === "especialidad-lista" && (
          <PasoEspecialidadLista
            especialidades={wizard.opcionesEspecialidad}
            cargando={wizard.cargandoEspecialidades}
            error={wizard.errorEspecialidades}
            onElegir={wizard.elegirEspecialidad}
          />
        )}

        {wizard.paso === "profesional-lista" && (
          <PasoProfesionalLista
            profesionales={wizard.profesionales}
            cargando={wizard.cargandoProfesionales}
            error={wizard.errorProfesionales}
            onElegir={wizard.elegirProfesionalDeLista}
          />
        )}

        {wizard.paso === "disponibilidad" && (
          <PasoDisponibilidad
            fecha={wizard.fecha}
            onCambiarFecha={(f) => void wizard.cambiarFecha(f)}
            slots={wizard.slots}
            cargando={wizard.cargandoSlots}
            error={wizard.errorSlots}
            slotSeleccionado={wizard.slotSeleccionado}
            onSeleccionarSlot={wizard.seleccionarSlot}
            profesionalFijo={wizard.profesional}
            avisoSlotTomado={wizard.slotYaNoDisponible}
          />
        )}

        {wizard.paso === "tratamiento-especifico" && (
          <PasoTratamientoEspecifico
            tratamientos={wizard.tratamientosDeLaEspecialidad}
            onElegir={wizard.elegirTratamientoEspecifico}
          />
        )}

        {wizard.paso === "identificacion" && (
          <PasoIdentificacion
            verificandoRut={wizard.verificandoRut}
            errorVerificarRut={wizard.errorVerificarRut}
            pacienteExiste={wizard.pacienteExiste}
            onVerificarRut={(rut, token) =>
              void wizard.verificarRutYAvanzar(rut, token)
            }
            creandoPaciente={wizard.creandoPaciente}
            errorAltaPaciente={wizard.errorAltaPaciente}
            onCrearPaciente={(datos) =>
              void wizard.crearPacienteYAvanzar(datos)
            }
          />
        )}

        {wizard.paso === "confirmar" &&
          wizard.tratamiento &&
          wizard.slotSeleccionado && (
            <PasoConfirmar
              tratamiento={wizard.tratamiento}
              slot={wizard.slotSeleccionado}
              notas={wizard.notas}
              onCambiarNotas={wizard.setNotas}
              enviando={wizard.creandoCita}
              error={wizard.errorCita}
              onConfirmar={(token) => void wizard.confirmarReserva(token)}
            />
          )}

        {wizard.paso === "exito" && wizard.citaCreada && (
          <PasoExito cita={wizard.citaCreada} onReservarOtra={wizard.reiniciar} />
        )}
      </div>

      {["disponibilidad", "tratamiento-especifico", "identificacion", "confirmar"].includes(
        wizard.paso
      ) && (
        <div className="mt-10 border-t border-border/70 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={wizard.reiniciar}
            className="text-xs text-muted-foreground"
          >
            Empezar de nuevo
          </Button>
        </div>
      )}
    </section>
  )
}
