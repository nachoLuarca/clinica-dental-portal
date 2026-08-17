import type { Servicio } from "@/types/servicio"

/**
 * MOCK TEMPORAL — Módulo 2.
 *
 * Estos datos simulan el catálogo público de tratamientos que en producción
 * expone `clinica-dental-api` (gestionado por el staff desde el portal
 * admin). Nada de esto se edita desde este repo: cuando el módulo de
 * consumo real de API esté listo, este archivo se reemplaza y el resto de
 * la app no debería cambiar, porque todo pasa por `src/services/servicios.service.ts`
 * y respeta el contrato definido en `src/types/servicio.ts`.
 */
export const serviciosMock: Servicio[] = [
  {
    id: "1",
    slug: "limpieza-dental",
    nombre: "Limpieza dental (profilaxis)",
    categoria: "Prevención",
    resumen: "Eliminación de placa y sarro para una boca sana desde la raíz.",
    descripcion:
      "Sesión de higiene profesional que remueve placa bacteriana y sarro acumulado, incluso en zonas difíciles de alcanzar con el cepillado diario. Es la base de cualquier plan de prevención y se recomienda al menos dos veces al año.",
    duracionMinutos: 45,
    precioDesdeClp: 25000,
    incluye: [
      "Destartraje con ultrasonido",
      "Pulido dental",
      "Revisión general de encías",
      "Recomendaciones de higiene personalizadas",
    ],
    destacado: true,
  },
  {
    id: "2",
    slug: "blanqueamiento-dental",
    nombre: "Blanqueamiento dental",
    categoria: "Estética",
    resumen: "Aclara el tono de tus dientes de forma segura y pareja.",
    descripcion:
      "Tratamiento estético con gel blanqueador de uso profesional aplicado en clínica, con activación por luz LED. Los resultados se notan desde la primera sesión y se acompañan de indicaciones para mantener el color por más tiempo.",
    duracionMinutos: 60,
    precioDesdeClp: 65000,
    incluye: [
      "Evaluación previa de sensibilidad",
      "Aplicación de gel blanqueador profesional",
      "Activación con luz LED",
      "Kit de cuidado post-tratamiento",
    ],
    destacado: true,
  },
  {
    id: "3",
    slug: "ortodoncia-invisible",
    nombre: "Ortodoncia invisible",
    categoria: "Ortodoncia",
    resumen: "Alineadores transparentes, casi imperceptibles en el día a día.",
    descripcion:
      "Corrección de la posición dentaria con alineadores transparentes removibles, diseñados a partir de un escaneo digital de tu boca. Ideal para quienes buscan un tratamiento estético y cómodo, con controles periódicos para ajustar el plan.",
    duracionMinutos: 40,
    precioDesdeClp: 890000,
    incluye: [
      "Escaneo digital 3D de tu boca",
      "Plan de movimiento dentario simulado",
      "Set inicial de alineadores",
      "Controles mensuales de seguimiento",
    ],
    destacado: true,
  },
  {
    id: "4",
    slug: "extraccion-simple",
    nombre: "Extracción dental simple",
    categoria: "Cirugía",
    resumen: "Retiro de piezas dañadas o sin posibilidad de restauración.",
    descripcion:
      "Procedimiento para retirar una pieza dental que no puede conservarse, realizado con anestesia local y técnica que minimiza las molestias. Incluye indicaciones claras de cuidado posterior para una recuperación sin complicaciones.",
    duracionMinutos: 30,
    precioDesdeClp: 35000,
    incluye: [
      "Anestesia local",
      "Extracción de la pieza afectada",
      "Indicaciones de cuidado post-extracción",
      "Receta si es necesaria",
    ],
    destacado: false,
  },
  {
    id: "5",
    slug: "endodoncia",
    nombre: "Endodoncia (tratamiento de conducto)",
    categoria: "Rehabilitación",
    resumen: "Salva la pieza dental cuando el nervio está comprometido.",
    descripcion:
      "Tratamiento que elimina la infección o inflamación del nervio dental, sellando el conducto para conservar la pieza natural en boca y evitar una extracción. Se realiza con anestesia local y control radiográfico.",
    duracionMinutos: 75,
    precioDesdeClp: 120000,
    incluye: [
      "Anestesia local",
      "Limpieza y desinfección del conducto",
      "Obturación del conducto radicular",
      "Control radiográfico",
    ],
    destacado: false,
  },
  {
    id: "6",
    slug: "implante-dental",
    nombre: "Implante dental unitario",
    categoria: "Rehabilitación",
    resumen: "Reemplaza una pieza perdida con una base fija y duradera.",
    descripcion:
      "Reposición de una pieza dental ausente mediante un implante de titanio que actúa como raíz artificial, sobre el cual luego se instala una corona. Incluye evaluación con imagenología y planificación quirúrgica.",
    duracionMinutos: 90,
    precioDesdeClp: 590000,
    incluye: [
      "Evaluación con imagenología 3D",
      "Cirugía de instalación del implante",
      "Controles de cicatrización",
      "Planificación de la corona definitiva",
    ],
    destacado: true,
  },
  {
    id: "7",
    slug: "urgencia-dental",
    nombre: "Atención de urgencia dental",
    categoria: "Urgencias",
    resumen: "Alivio inmediato para dolor agudo, golpes o infecciones.",
    descripcion:
      "Atención prioritaria para dolor dental agudo, traumatismos o infecciones que no pueden esperar a una hora regular. El profesional evalúa, controla el dolor y define si se requiere un tratamiento posterior.",
    duracionMinutos: 30,
    precioDesdeClp: 30000,
    incluye: [
      "Evaluación inmediata del dolor o lesión",
      "Manejo del dolor",
      "Diagnóstico de la causa",
      "Derivación a tratamiento definitivo si corresponde",
    ],
    destacado: false,
  },
  {
    id: "8",
    slug: "resina-dental",
    nombre: "Obturación con resina (tapadura)",
    categoria: "Rehabilitación",
    resumen: "Restaura piezas con caries devolviendo forma y función.",
    descripcion:
      "Restauración de una pieza afectada por caries usando resina del color del diente, devolviendo su forma, resistencia y función masticatoria en una sola sesión.",
    duracionMinutos: 40,
    precioDesdeClp: 32000,
    incluye: [
      "Remoción de tejido dañado",
      "Restauración con resina estética",
      "Ajuste de mordida",
      "Pulido final",
    ],
    destacado: false,
  },
  {
    id: "9",
    slug: "diseno-de-sonrisa",
    nombre: "Diseño de sonrisa",
    categoria: "Estética",
    resumen: "Plan integral y personalizado para transformar tu sonrisa.",
    descripcion:
      "Evaluación estética integral que combina distintos tratamientos (carillas, blanqueamiento, ortodoncia u otros) según cada caso, con una simulación previa del resultado esperado antes de comenzar.",
    duracionMinutos: 50,
    precioDesdeClp: 45000,
    incluye: [
      "Evaluación estética facial y dental",
      "Simulación digital del resultado",
      "Plan de tratamiento personalizado",
      "Cotización detallada por etapas",
    ],
    destacado: true,
  },
  {
    id: "10",
    slug: "control-de-ortodoncia",
    nombre: "Control de ortodoncia",
    categoria: "Ortodoncia",
    resumen: "Seguimiento periódico para un tratamiento en curso.",
    descripcion:
      "Cita de control para pacientes que ya están en tratamiento de ortodoncia, donde se revisa el avance, se realizan ajustes y se resuelven dudas sobre el uso de brackets o alineadores.",
    duracionMinutos: 20,
    precioDesdeClp: 20000,
    incluye: [
      "Revisión del avance del tratamiento",
      "Ajuste de brackets o cambio de alineador",
      "Resolución de molestias puntuales",
    ],
    destacado: false,
  },
  {
    id: "11",
    slug: "protesis-removible",
    nombre: "Prótesis dental removible",
    categoria: "Rehabilitación",
    resumen: "Recupera piezas perdidas con una solución cómoda y funcional.",
    descripcion:
      "Confección de una prótesis removible a medida para reemplazar una o varias piezas ausentes, devolviendo función masticatoria y estética. Incluye toma de impresiones y pruebas de ajuste.",
    duracionMinutos: 60,
    precioDesdeClp: 180000,
    incluye: [
      "Toma de impresiones",
      "Prueba de ajuste y mordida",
      "Entrega e instalación de la prótesis",
      "Indicaciones de mantención",
    ],
    destacado: false,
  },
  {
    id: "12",
    slug: "radiografia-dental",
    nombre: "Radiografía dental digital",
    categoria: "Prevención",
    resumen: "Imagen diagnóstica clave para detectar problemas a tiempo.",
    descripcion:
      "Toma de radiografía digital para apoyar el diagnóstico de caries, infecciones o problemas óseos que no son visibles a simple vista, con baja dosis de radiación gracias a la tecnología digital.",
    duracionMinutos: 15,
    precioDesdeClp: 12000,
    incluye: [
      "Toma de imagen digital",
      "Informe con hallazgos relevantes",
      "Entrega de la imagen al paciente",
    ],
    destacado: false,
  },
]
