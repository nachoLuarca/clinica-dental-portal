# clinica-dental-portal

Portal público de pacientes de cada clínica dental (tenant): catálogo de tratamientos y reserva de hora en línea. Consume `clinica-dental-api` — no implementa lógica de negocio propia.

El paciente se identifica por **RUT + Cloudflare Turnstile**, sin login ni contraseña. El flujo de reserva es: Identificación → Tratamiento → Profesional → Horario → Confirmar.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 + shadcn/ui
- [react-router-dom](https://reactrouter.com/) para el ruteo
- [framer-motion](https://www.framer.com/motion/) — animación de las franjas horarias
- [react-international-phone](https://www.npmjs.com/package/react-international-phone) — selector de país + teléfono en el alta de paciente
- Cloudflare Turnstile — verificación anti-bot en Identificación y Confirmar
- Iconografía: [lucide-react](https://lucide.dev/)
- Tipografía: Fraunces (titulares) + Inter (cuerpo) + IBM Plex Mono (horas, fechas, precios), vía `@fontsource`/`@fontsource-variable`

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

El servidor de desarrollo corre en `http://localhost:5175`. Requiere `clinica-dental-api` corriendo (ver `VITE_API_BASE_URL`).

### Variables de entorno

Ver `.env.example`:

- `VITE_API_BASE_URL` — base de la API (`http://127.0.0.1:8081/api` en local; usar `127.0.0.1`, no `localhost`, por intermitencia conocida en Windows/WSL2).
- `VITE_CLINICA_SLUG` — slug del tenant que sirve esta instancia (mientras no exista resolución por subdominio).

`VITE_TURNSTILE_SITE_KEY` es opcional: trae un default funcional en `src/lib/env.ts`, solo hace falta si se necesita otra site key.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción (`tsc -b && vite build`).
- `npm run preview` — sirve el build localmente.
- `npm run lint` — lint con oxlint.

## Estructura

- `src/pages` — una página por ruta.
- `src/components/reserva` — pasos del wizard de reserva.
- `src/components/servicios` / `src/components/landing` — catálogo público y landing.
- `src/components/ui` — primitivas de shadcn/ui.
- `src/hooks` — estado y orquestación (`useReservaWizard`, `useServicios`, etc.).
- `src/services` — capa de acceso a `clinica-dental-api`.
- `src/types` — contratos de datos tal como los expone la API.
- `src/lib` — utilidades compartidas (RUT, formato, cliente HTTP, entorno).
- `src/index.css` — paleta, tipografía y tokens del tema (claro/oscuro).
