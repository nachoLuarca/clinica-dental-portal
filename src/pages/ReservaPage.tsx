import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PasoConfirmar } from "@/components/reserva/PasoConfirmar"
import { PasoExito } from "@/components/reserva/PasoExito"
import { PasoHorario } from "@/components/reserva/PasoHorario"
import { PasoIdentificacion } from "@/components/reserva/PasoIdentificacion"
import { PasoProfesional } from "@/components/reserva/PasoProfesional"
import { PasoServicio } from "@/components/reserva/PasoServicio"
import { StepperReserva } from "@/components/reserva/StepperReserva"
import { useReservaWizard } from "@/hooks/useReservaWizard"

const TITULOS: Record<string, string> = {
  identificacion: "Identifícate con tu RUT",
  servicio: "¿Qué tratamiento necesitas?",
  profesional: "¿Con quién prefieres atenderte?",
  horario: "Elige un horario",
  confirmar: "Confirma tu reserva",
  exito: "",
}

export function ReservaPage() {
  const wizard = useReservaWizard()

  const titulo = TITULOS[wizard.paso]

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {wizard.paso !== "exito" && (
        <div className="mb-8">
          <StepperReserva pasoActual={wizard.paso} />
        </div>
      )}

      <div
        key={wizard.paso}
        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {wizard.paso !== "identificacion" && wizard.paso !== "exito" && (
          <button
            type="button"
            onClick={() => {
              if (wizard.paso === "servicio") wizard.volverAPaso("identificacion")
              if (wizard.paso === "profesional") wizard.volverAPaso("servicio")
              if (wizard.paso === "horario") wizard.volverAPaso("profesional")
              if (wizard.paso === "confirmar") wizard.volverAPaso("horario")
            }}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="size-4" />
            Volver
          </button>
        )}

        {titulo && (
          <h1 className="mb-6 font-heading text-2xl font-medium text-balance sm:text-3xl">
            {titulo}
          </h1>
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

        {wizard.paso === "servicio" && (
          <PasoServicio
            tratamientos={wizard.tratamientos}
            cargando={wizard.cargandoTratamientos}
            error={wizard.errorTratamientos}
            conteoProfesionalesPorEspecialidad={
              wizard.conteoProfesionalesPorEspecialidad
            }
            cargandoConteoProfesionales={wizard.cargandoConteoProfesionales}
            onElegir={wizard.elegirTratamiento}
          />
        )}

        {wizard.paso === "profesional" && (
          <PasoProfesional
            profesionales={wizard.profesionales}
            cargando={wizard.cargandoProfesionales}
            error={wizard.errorProfesionales}
            onElegirEspecifico={(p) => void wizard.elegirProfesionalEspecifico(p)}
            onElegirCualquiera={() => void wizard.elegirCualquieraDisponible()}
          />
        )}

        {wizard.paso === "horario" && (
          <PasoHorario
            fecha={wizard.fecha}
            onCambiarFecha={(f) => void wizard.cambiarFecha(f)}
            slots={wizard.slots}
            cargando={wizard.cargandoSlots}
            error={wizard.errorSlots}
            slotSeleccionado={wizard.slotSeleccionado}
            onSeleccionarSlot={wizard.seleccionarSlot}
            mostrarProfesional={wizard.cualquieraDisponible}
            avisoSlotTomado={wizard.slotYaNoDisponible}
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

      {wizard.paso !== "servicio" && wizard.paso !== "exito" && wizard.tratamiento && (
        <div className="mt-10 border-t border-border/70 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={wizard.reiniciar}
            className="text-xs text-muted-foreground"
          >
            Elegir otro tratamiento
          </Button>
        </div>
      )}
    </section>
  )
}
