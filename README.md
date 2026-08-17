# clinica-dental-paciente

Sitio público de cada clínica dental (tenant): catálogo de tratamientos y reserva de hora en línea para pacientes. Consume `clinica-dental-api` — no implementa lógica de negocio propia.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 + shadcn/ui (estilo `radix-nova`)
- Iconografía: [lucide-react](https://lucide.dev/)
- Tipografía: Fraunces (titulares) + Plus Jakarta Sans (cuerpo), vía `@fontsource-variable`

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor de desarrollo corre en `http://localhost:5175`.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción (`tsc -b && vite build`).
- `npm run preview` — sirve el build localmente.
- `npm run lint` — lint con oxlint.

## Estructura

- `src/components/ui` — primitivas de shadcn/ui (base del sistema de diseño).
- `src/lib` — utilidades compartidas.
- `src/index.css` — paleta, tipografía y tokens del tema (claro/oscuro).
