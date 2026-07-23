// Lectura del Excel de inventario del negocio (pestaña "Inventario" de
// "Ventas Picto.xlsx"). Sus columnas, en orden:
//
//   CATEGORIA | PRODUCTO | PROVEEDOR | CANTIDAD | COSTO UNITARIO |
//   COSTO TOTAL | STOCK MÍNIMO | OBSERVACIONES
//
// Dos particularidades del archivo real que obligan a normalizar:
//   - La categoría está agrupada visualmente: solo aparece en la primera fila
//     de cada grupo y las siguientes van vacías. Se arrastra hacia abajo.
//   - COSTO TOTAL es una fórmula. No se lee: se recalcula como
//     cantidad x costo unitario, que es la única fuente de verdad.

export interface FilaInventarioExcel {
  fila: number
  categoria: string
  nombre: string
  proveedor: string
  cantidad: number
  costo_unitario: number
  stock_minimo: number
  observaciones: string
}

export interface ResultadoLectura {
  filas: FilaInventarioExcel[]
  errores: string[]
  hoja: string
}

const ENCABEZADOS_ESPERADOS = [
  'CATEGORIA',
  'PRODUCTO',
  'PROVEEDOR',
  'CANTIDAD',
  'COSTO UNITARIO',
  'COSTO TOTAL',
  'STOCK MÍNIMO',
  'OBSERVACIONES',
]

// Una celda de exceljs puede ser texto, número, fórmula {formula, result},
// texto enriquecido {richText} o hipervínculo {text}.
function valorCelda(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'string') return valor.trim()
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'boolean') return String(valor)
  if (valor instanceof Date) return valor.toISOString()

  if (typeof valor === 'object') {
    const obj = valor as Record<string, unknown>
    if ('result' in obj) return valorCelda(obj.result)
    if ('text' in obj) return valorCelda(obj.text)
    if ('richText' in obj && Array.isArray(obj.richText)) {
      return obj.richText.map((t) => valorCelda((t as { text?: unknown }).text)).join('').trim()
    }
  }
  return ''
}

// Acepta "1.496,08" y "1,496.08": si hay coma y punto, el último separador
// que aparece es el decimal.
function numeroCelda(valor: unknown): number | null {
  const texto = valorCelda(valor).replace(/\s/g, '').replace(/\$/g, '')
  if (!texto) return null

  const tieneComa = texto.includes(',')
  const tienePunto = texto.includes('.')
  let normalizado = texto

  if (tieneComa && tienePunto) {
    const decimal = texto.lastIndexOf(',') > texto.lastIndexOf('.') ? ',' : '.'
    const miles = decimal === ',' ? '.' : ','
    normalizado = texto.split(miles).join('').replace(decimal, '.')
  } else if (tieneComa) {
    // Coma sola: decimal si deja 1-2 dígitos a la derecha, si no es de miles.
    const [, decimales = ''] = texto.split(',')
    normalizado = decimales.length > 0 && decimales.length <= 2
      ? texto.replace(',', '.')
      : texto.split(',').join('')
  }

  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

function normalizarEncabezado(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export async function leerInventarioExcel(archivo: File): Promise<ResultadoLectura> {
  // exceljs pesa cerca de 1 MB: se carga solo cuando el usuario importa.
  const ExcelJS = (await import('exceljs')).default
  const libro = new ExcelJS.Workbook()
  await libro.xlsx.load(await archivo.arrayBuffer())

  const hoja =
    libro.worksheets.find((h) => normalizarEncabezado(h.name) === 'INVENTARIO') ??
    libro.worksheets[0]

  if (!hoja) {
    return { filas: [], errores: ['El archivo no tiene ninguna hoja legible.'], hoja: '' }
  }

  const errores: string[] = []
  const filas: FilaInventarioExcel[] = []

  const encabezados = (hoja.getRow(1).values as unknown[])
    .slice(1)
    .map((v) => normalizarEncabezado(valorCelda(v)))

  const faltantes = ENCABEZADOS_ESPERADOS.map(normalizarEncabezado).filter(
    (esperado) => !encabezados.includes(esperado),
  )
  if (faltantes.length > 0) {
    errores.push(
      `A la hoja "${hoja.name}" le faltan estas columnas: ${faltantes.join(', ')}. ` +
        'Verifica que sea la pestaña de inventario.',
    )
    return { filas: [], errores, hoja: hoja.name }
  }

  const indice = (nombre: string) => encabezados.indexOf(normalizarEncabezado(nombre)) + 1

  const colCategoria = indice('CATEGORIA')
  const colProducto = indice('PRODUCTO')
  const colProveedor = indice('PROVEEDOR')
  const colCantidad = indice('CANTIDAD')
  const colCostoUnitario = indice('COSTO UNITARIO')
  const colStockMinimo = indice('STOCK MÍNIMO')
  const colObservaciones = indice('OBSERVACIONES')

  let categoriaActual = ''

  for (let numeroFila = 2; numeroFila <= hoja.rowCount; numeroFila += 1) {
    const fila = hoja.getRow(numeroFila)

    const categoria = valorCelda(fila.getCell(colCategoria).value)
    const nombre = valorCelda(fila.getCell(colProducto).value)
    const proveedor = valorCelda(fila.getCell(colProveedor).value)
    const observaciones = valorCelda(fila.getCell(colObservaciones).value)
    const cantidad = numeroCelda(fila.getCell(colCantidad).value)
    const costoUnitario = numeroCelda(fila.getCell(colCostoUnitario).value)
    const stockMinimo = numeroCelda(fila.getCell(colStockMinimo).value)

    // Arrastre de la categoría agrupada.
    if (categoria) categoriaActual = categoria

    // Filas de cierre o separadores: sin producto no hay nada que importar.
    if (!nombre) continue

    if (cantidad === null) {
      errores.push(`Fila ${numeroFila} (${nombre}): CANTIDAD no es un número.`)
      continue
    }
    if (costoUnitario === null) {
      errores.push(`Fila ${numeroFila} (${nombre}): COSTO UNITARIO no es un número.`)
      continue
    }
    if (cantidad < 0 || costoUnitario < 0) {
      errores.push(`Fila ${numeroFila} (${nombre}): la cantidad y el costo no pueden ser negativos.`)
      continue
    }

    filas.push({
      fila: numeroFila,
      categoria: categoriaActual,
      nombre,
      proveedor,
      cantidad,
      costo_unitario: costoUnitario,
      stock_minimo: stockMinimo ?? 0,
      observaciones,
    })
  }

  if (filas.length === 0 && errores.length === 0) {
    errores.push('La hoja de inventario no tiene filas con producto.')
  }

  return { filas, errores, hoja: hoja.name }
}
