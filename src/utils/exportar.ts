// Exportación de reportes a Excel, PDF y CSV.
//
// Regla de la Etapa F: el archivo exportado conserva TODAS las columnas del
// dato original, aunque la tabla en pantalla muestre solo un resumen legible.
// Por eso cada reporte declara sus columnas explícitamente y, además,
// completarColumnas() añade cualquier campo que exista en los datos y no se
// haya declarado: si mañana se agrega una columna en la base, aparece sola en
// la exportación en vez de perderse en silencio.

import logoPictograficos from '@/assets/LogoPicto.jpeg'
import type { Styles } from 'jspdf-autotable'

// Marca de orden de bytes UTF-8. Sin ella Excel abre el CSV en ANSI y los
// acentos salen corruptos. Se construye por codigo para no dejar un
// caracter invisible en el fuente.
const BOM_UTF8 = String.fromCharCode(0xfeff)

export type ValorCelda = string | number | boolean | null

export interface ColumnaExport<T> {
  header: string
  value: (row: T) => ValorCelda
}

// Las librerías pesadas (exceljs ~930 kB, jspdf ~400 kB) se cargan solo al
// exportar, con import() dinámico, para no engordar el arranque de la app.

function descargar(contenido: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(contenido)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}

export function nombreConFecha(base: string, extension: string): string {
  const ahora = new Date()
  const sello = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, '0'),
    String(ahora.getDate()).padStart(2, '0'),
  ].join('-')
  return `${base}_${sello}.${extension}`
}

// Convierte a texto plano para CSV y PDF. Los booleanos se traducen porque
// "true"/"false" no dice nada en un informe impreso.
function comoTexto(valor: ValorCelda): string {
  if (valor === null || valor === undefined) return ''
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  return String(valor)
}

/**
 * Añade al final las columnas presentes en los datos que no estén ya
 * declaradas, para que la exportación nunca omita un campo.
 */
export function completarColumnas<T extends object>(
  columnas: ColumnaExport<T>[],
  filas: T[],
  clavesDeclaradas: string[],
): ColumnaExport<T>[] {
  const declaradas = new Set(clavesDeclaradas)
  const extra: ColumnaExport<T>[] = []

  for (const fila of filas) {
    for (const clave of Object.keys(fila)) {
      if (declaradas.has(clave)) continue
      declaradas.add(clave)
      extra.push({
        header: clave,
        value: (row) => {
          const valor = (row as Record<string, unknown>)[clave]
          if (valor === null || valor === undefined) return null
          if (typeof valor === 'object') return JSON.stringify(valor)
          return valor as ValorCelda
        },
      })
    }
  }

  return [...columnas, ...extra]
}

/**
 * CSV con separador de punto y coma: es lo que espera Excel en configuración
 * regional española, que es donde se abre este archivo. Lleva BOM UTF-8 para
 * que los acentos no se rompan al abrirlo.
 */
export function exportarCSV<T>(
  columnas: ColumnaExport<T>[],
  filas: T[],
  nombreBase: string,
): void {
  const escapar = (valor: ValorCelda) => {
    const texto = comoTexto(valor)
    return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
  }

  const lineas = [
    columnas.map((c) => escapar(c.header)).join(';'),
    ...filas.map((fila) => columnas.map((c) => escapar(c.value(fila))).join(';')),
  ]

  const contenido = BOM_UTF8 + lineas.join('\r\n')
  descargar(
    new Blob([contenido], { type: 'text/csv;charset=utf-8;' }),
    nombreConFecha(nombreBase, 'csv'),
  )
}

/**
 * Excel real (.xlsx). Los números viajan como números y no como texto, para
 * que se puedan sumar y filtrar en la hoja sin reconvertirlos.
 */
export async function exportarExcel<T>(
  columnas: ColumnaExport<T>[],
  filas: T[],
  nombreBase: string,
  tituloHoja: string,
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default
  const libro = new ExcelJS.Workbook()
  libro.created = new Date()

  // Excel rechaza nombres de hoja de más de 31 caracteres o con : \ / ? * [ ]
  const hoja = libro.addWorksheet(tituloHoja.replace(/[:\\/?*[\]]/g, '').slice(0, 31))

  hoja.columns = columnas.map((columna) => ({
    header: columna.header,
    key: columna.header,
    width: Math.min(Math.max(columna.header.length + 4, 12), 40),
  }))

  for (const fila of filas) {
    hoja.addRow(columnas.map((columna) => columna.value(fila)))
  }

  const encabezado = hoja.getRow(1)
  encabezado.font = { bold: true }
  encabezado.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEFEFEF' },
  }
  hoja.views = [{ state: 'frozen', ySplit: 1 }]
  hoja.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: Math.max(columnas.length, 1) },
  }

  const buffer = await libro.xlsx.writeBuffer()
  descargar(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    nombreConFecha(nombreBase, 'xlsx'),
  )
}

// Dimensiones reales de src/assets/LogoPicto.jpeg (823x810 px). jsPDF no
// puede medir un archivo por sí solo, así que la proporción va fija aquí;
// si el archivo del logo cambia de forma, ajustar este valor.
const RELACION_ASPECTO_LOGO = 823 / 810

let bytesLogoCache: Promise<Uint8Array | null> | null = null

// Carga el logo una sola vez por sesión: exportar varios reportes seguidos
// no debe repetir la descarga del asset.
function cargarBytesLogo(): Promise<Uint8Array | null> {
  if (!bytesLogoCache) {
    bytesLogoCache = fetch(logoPictograficos)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer))
      .catch(() => null) // Sin logo el reporte igual debe poder generarse.
  }
  return bytesLogoCache
}

// Toda columna de identificador ("ID", "ID del cliente"...) es un UUID: no se
// lee en un informe impreso y, sin acotar su ancho, le quita espacio a las
// columnas que sí importan. Se muestra truncada; el valor completo sigue
// disponible en Excel y CSV.
function esColumnaId(header: string): boolean {
  return /^id(\s|$)/i.test(header)
}

/**
 * PDF horizontal: estos reportes tienen muchas columnas y en vertical
 * quedarían ilegibles.
 */
export async function exportarPDF<T>(
  columnas: ColumnaExport<T>[],
  filas: T[],
  nombreBase: string,
  titulo: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const margenIzquierdo = 40
  let inicioTexto = margenIzquierdo

  const bytesLogo = await cargarBytesLogo()
  if (bytesLogo) {
    const altoLogo = 34
    const anchoLogo = altoLogo * RELACION_ASPECTO_LOGO
    try {
      doc.addImage(bytesLogo, 'JPEG', margenIzquierdo, 22, anchoLogo, altoLogo)
      inicioTexto = margenIzquierdo + anchoLogo + 12
    } catch {
      inicioTexto = margenIzquierdo // El logo no cargó: el texto vuelve al margen.
    }
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(titulo, inicioTexto, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `Generado el ${new Date().toLocaleString('es-CO')} — ${filas.length} registro(s)`,
    inicioTexto,
    58,
  )

  const TAMANO_FUENTE_ENCABEZADO = 7
  const RELLENO_CELDA = 3
  const ANCHO_COLUMNA_ID = 55

  // Ancho mínimo de cada columna: el de su palabra más larga (no el del
  // encabezado completo), para que autoTable pueda seguir partiendo por
  // espacios sin partir una palabra a la mitad — que es lo que "Prioridad"
  // o "Valor total" hacían cuando la columna quedaba más angosta que ellos.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(TAMANO_FUENTE_ENCABEZADO)
  function anchoMinimoColumna(header: string): number {
    const palabraMasAncha = Math.max(...header.split(' ').map((p) => doc.getTextWidth(p)))
    return palabraMasAncha + RELLENO_CELDA * 2 + 2
  }

  const columnStyles: Record<number, Partial<Styles>> = {}
  columnas.forEach((columna, indice) => {
    columnStyles[indice] = esColumnaId(columna.header)
      ? { cellWidth: ANCHO_COLUMNA_ID, overflow: 'ellipsize' }
      : { minCellWidth: anchoMinimoColumna(columna.header) }
  })

  autoTable(doc, {
    startY: 76,
    head: [columnas.map((c) => c.header)],
    body: filas.map((fila) => columnas.map((c) => comoTexto(c.value(fila)))),
    styles: { fontSize: 6.5, cellPadding: RELLENO_CELDA, overflow: 'linebreak', valign: 'middle' },
    headStyles: {
      fillColor: [51, 51, 51],
      fontSize: TAMANO_FUENTE_ENCABEZADO,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles,
    alternateRowStyles: { fillColor: [247, 247, 247] },
    margin: { left: 20, right: 20 },
  })

  descargar(doc.output('blob'), nombreConFecha(nombreBase, 'pdf'))
}
