import { useMemo, useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/data/EmptyState'

export interface DataTableColumn<T> {
  header: string
  accessor: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription?: string
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortIndex, setSortIndex] = useState<number | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (sortIndex === null) return data
    const columna = columns[sortIndex]
    if (!columna.sortValue) return data

    return [...data].sort((a, b) => {
      const valorA = columna.sortValue!(a)
      const valorB = columna.sortValue!(b)
      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0
      return sortAsc ? comparacion : -comparacion
    })
  }, [data, columns, sortIndex, sortAsc])

  const totalPaginas = Math.max(Math.ceil(sorted.length / pageSize), 1)
  const paginaActual = Math.min(page, totalPaginas - 1)
  const paginados = sorted.slice(paginaActual * pageSize, paginaActual * pageSize + pageSize)

  function alternarOrden(index: number) {
    if (!columns[index].sortValue) return
    if (sortIndex === index) {
      setSortAsc((actual) => !actual)
    } else {
      setSortIndex(index)
      setSortAsc(true)
    }
  }

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((columna, index) => (
                <TableHead key={columna.header} className={columna.className}>
                  {columna.sortValue ? (
                    <button
                      type="button"
                      onClick={() => alternarOrden(index)}
                      className="flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      {columna.header}
                      {sortIndex === index &&
                        (sortAsc ? (
                          <ChevronUp className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="size-3.5" aria-hidden="true" />
                        ))}
                    </button>
                  ) : (
                    columna.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginados.map((row) => (
              <TableRow key={keyExtractor(row)}>
                {columns.map((columna) => (
                  <TableCell key={columna.header} className={columna.className}>
                    {columna.accessor(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {paginaActual + 1} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaActual === 0}
              onClick={() => setPage(paginaActual - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaActual >= totalPaginas - 1}
              onClick={() => setPage(paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
