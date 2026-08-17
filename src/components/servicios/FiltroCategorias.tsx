import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FiltroCategoriasProps {
  categorias: string[]
  categoriaActiva: string
  onCambiarCategoria: (categoria: string) => void
}

const TODAS = "Todos"

export function FiltroCategorias({
  categorias,
  categoriaActiva,
  onCambiarCategoria,
}: FiltroCategoriasProps) {
  return (
    <Tabs value={categoriaActiva} onValueChange={onCambiarCategoria}>
      <TabsList className="flex-wrap">
        <TabsTrigger value={TODAS}>Todos</TabsTrigger>
        {categorias.map((categoria) => (
          <TabsTrigger key={categoria} value={categoria}>
            {categoria}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export { TODAS }
