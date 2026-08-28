// Genera la "Cuenta de cobro" como PDF con el mismo diseño de marca de la
// plantilla de factura de Pictográficos (templates/factura-pictograficos.html
// / artifact aprobado por el propietario): logo, barra de acento verde-azul,
// tipografía y layout idénticos. Rellena los datos reales del cliente, sus
// pedidos y los datos de la empresa (dirección, NIT, redes sociales,
// representante legal — configurables en ConfiguracionPage); solo queda como
// placeholder punteado lo que la empresa todavía no ha cargado ahí.
//
// Render: el HTML se escribe en un iframe oculto (documento aparte, así el
// CSS con selectores `:root`/`body` de la plantilla no se filtra a la app),
// se captura con html2canvas y se pega como imagen en un PDF vía jsPDF,
// partiendo en varias páginas si el contenido no cabe en una sola A4.

import logoPictograficos from '@/assets/LogoPicto.jpeg'
import { descargar, nombreConFecha } from '@/utils/exportar'

export interface LineaFacturaPdf {
  producto: string
  cantidad: number
  precioUnitario: number
}

export interface CuentaCobroPdfInput {
  nombreArchivoBase: string
  cliente: {
    nombre: string
    correo: string | null
    telefono: string
    direccion: string | null
    ciudad: string | null
  }
  empresa: {
    nombre: string
    correo: string | null
    telefono: string | null
    direccion: string | null
    ciudad: string | null
    nit: string | null
    instagram: string | null
    facebook: string | null
    tiktok: string | null
    whatsapp: string | null
    sitioWeb: string | null
    representanteLegalNombre: string | null
    representanteLegalDocumento: string | null
  }
  periodo: { desde: string; hasta: string } // vacíos si no se filtró por fecha
  lineas: LineaFacturaPdf[]
  resumen: {
    cantidadPedidos: number
    totalPagado: number
    saldoPendiente: number
  }
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatearFecha(iso: string): string {
  const fecha = new Date(`${iso}T00:00:00`)
  return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleDateString('es-CO')
}

const CHIP_PLACEHOLDER =
  'display:inline-block;background:#eef4ff;border:1px dashed #b9cdef;color:#3a5a8f;' +
  'font-style:italic;font-size:12px;padding:2px 7px;border-radius:5px;white-space:nowrap;'

function chip(texto: string): string {
  return `<span style="${CHIP_PLACEHOLDER}">${escaparHtml(texto)}</span>`
}

function construirHtmlCuentaCobro(input: CuentaCobroPdfInput): string {
  const { cliente, empresa, periodo, lineas, resumen } = input

  const direccionEmpresa =
    empresa.direccion || empresa.ciudad
      ? [empresa.direccion, empresa.ciudad].filter(Boolean).map(escaparHtml).join(', ')
      : chip('Dirección, ciudad, país')

  const nitEmpresa = empresa.nit ? escaparHtml(`NIT ${empresa.nit}`) : chip('NIT 000.000.000-0')

  const filaRedSocial = (etiqueta: string, valor: string | null) =>
    valor ? `<div class="row"><span>${etiqueta}</span><span>${escaparHtml(valor)}</span></div>` : ''

  const filasRedesSociales =
    [
      filaRedSocial('Instagram', empresa.instagram),
      filaRedSocial('Facebook', empresa.facebook),
      filaRedSocial('TikTok', empresa.tiktok),
      filaRedSocial('WhatsApp', empresa.whatsapp),
      filaRedSocial('Sitio web', empresa.sitioWeb),
    ]
      .filter(Boolean)
      .join('') ||
    `<div class="row"><span>Instagram</span>${chip('@pictograficos')}</div>`

  const representanteNombre = empresa.representanteLegalNombre
    ? escaparHtml(empresa.representanteLegalNombre)
    : chip('Nombre completo')
  const representanteDocumento = empresa.representanteLegalDocumento
    ? escaparHtml(`C.C. ${empresa.representanteLegalDocumento}`)
    : chip('C.C. 0.000.000')

  const filasItems = lineas
    .map((linea) => {
      const importe = linea.cantidad * linea.precioUnitario
      return `
        <tr>
          <td>${escaparHtml(linea.producto)}</td>
          <td class="num">${linea.cantidad}</td>
          <td class="num">${formatearMoneda(linea.precioUnitario)}</td>
          <td class="num">${formatearMoneda(importe)}</td>
        </tr>`
    })
    .join('')

  const totalLineas = lineas.reduce((total, l) => total + l.cantidad * l.precioUnitario, 0)

  const rangoTexto =
    periodo.desde || periodo.hasta
      ? `Del ${periodo.desde ? formatearFecha(periodo.desde) : '...'} al ${periodo.hasta ? formatearFecha(periodo.hasta) : '...'}`
      : 'Todo el historial de pedidos'

  const hoy = new Date().toLocaleDateString('es-CO')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  :root {
    --ink: #16231c;
    --paper-card: #ffffff;
    --green: #2fae55;
    --green-deep: #1f7a3d;
    --blue: #1d5fc2;
    --line: #dce4de;
    --muted: #64726b;
    --font-display: "Segoe UI Semibold", "Segoe UI", -apple-system, ui-sans-serif, system-ui, sans-serif;
    --font-body: "Segoe UI", -apple-system, ui-sans-serif, system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: #ffffff; color: var(--ink); font-family: var(--font-body); }
  .page { width: 780px; background: var(--paper-card); padding: 48px 52px 40px; }
  header.doc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  .brand { display: flex; gap: 16px; align-items: center; }
  .brand img { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; flex: none; border: 1px solid var(--line); }
  .brand-text .name { font-family: var(--font-display); font-weight: 700; font-size: 19px; margin: 0 0 2px; }
  .brand-text .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--green-deep); margin: 0 0 6px; font-weight: 600; }
  .brand-text .meta-line { font-size: 12.5px; color: var(--muted); line-height: 1.5; }
  .doc-meta { text-align: right; font-size: 12.5px; line-height: 1.6; white-space: nowrap; }
  .doc-meta .label { font-weight: 700; color: var(--ink); }
  .doc-meta .row { margin-bottom: 4px; }
  .accent-bar { height: 4px; border-radius: 4px; margin: 28px 0 26px; background: linear-gradient(90deg, var(--green) 0%, var(--blue) 100%); }
  h1.doc-title { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin: 0 0 6px; }
  .doc-sub { font-size: 13.5px; color: var(--muted); margin: 0 0 30px; }
  .cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 22px 0; margin-bottom: 28px; }
  .cols h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted); margin: 0 0 10px; font-weight: 700; }
  .cols .block p { margin: 0 0 4px; font-size: 13px; line-height: 1.6; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  table.items thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 700; padding-bottom: 10px; border-bottom: 1.5px solid var(--ink); }
  table.items th.num, table.items td.num { text-align: right; }
  table.items td { padding: 10px 0; font-size: 13.5px; vertical-align: top; border-bottom: 1px solid var(--line); }
  .totals { display: flex; justify-content: flex-end; margin: 18px 0 34px; }
  .totals .box { width: 260px; }
  .totals .line { display: flex; justify-content: space-between; font-size: 13.5px; padding: 7px 0; }
  .totals .line.total { border-top: 1.5px solid var(--ink); margin-top: 4px; padding-top: 12px; font-weight: 700; font-size: 15.5px; }
  .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-top: 1px solid var(--line); padding-top: 26px; }
  .side h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted); margin: 0 0 10px; font-weight: 700; }
  .side .row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed var(--line); }
  .side .row span:first-child { color: var(--muted); }
  .signature { margin-top: 22px; padding-top: 26px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); text-align: center; }
  .legal-line { margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--line); text-align: center; font-size: 11px; color: var(--muted); }
</style>
</head>
<body>
<div class="page">
  <header class="doc-head">
    <div class="brand">
      <img src="${logoPictograficos}" alt="Logo Pictográficos" />
      <div class="brand-text">
        <p class="name">Pictográficos</p>
        <p class="tagline">Laboratorio Creativo</p>
        <p class="meta-line">
          ${direccionEmpresa}<br />
          ${nitEmpresa}
        </p>
      </div>
    </div>
    <div class="doc-meta">
      <div class="row"><span class="label">Cuenta de cobro</span></div>
      <div class="row"><span class="label">Fecha de emisión</span> ${hoy}</div>
    </div>
  </header>

  <div class="accent-bar"></div>

  <h1 class="doc-title">Cuenta de cobro</h1>
  <p class="doc-sub">Resumen de pedidos de ${escaparHtml(cliente.nombre)} — ${escaparHtml(rangoTexto)}.</p>

  <div class="cols">
    <div class="block">
      <h2>Cliente</h2>
      <p>${escaparHtml(cliente.nombre)}</p>
      <p>${cliente.correo ? escaparHtml(cliente.correo) : '—'}</p>
      <p>${escaparHtml(cliente.telefono)}</p>
      <p>${[cliente.direccion, cliente.ciudad].filter((v): v is string => Boolean(v)).map(escaparHtml).join(', ') || '—'}</p>
    </div>
    <div class="block">
      <h2>Período</h2>
      <p>${escaparHtml(rangoTexto)}</p>
      <p>${resumen.cantidadPedidos} pedido(s) incluido(s)</p>
    </div>
    <div class="block">
      <h2>Pago</h2>
      <p>Total pagado: ${formatearMoneda(resumen.totalPagado)}</p>
      <p>Saldo pendiente: ${formatearMoneda(resumen.saldoPendiente)}</p>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Producto</th>
        <th class="num">Cant.</th>
        <th class="num">Precio</th>
        <th class="num">Importe</th>
      </tr>
    </thead>
    <tbody>
      ${filasItems}
    </tbody>
  </table>

  <div class="totals">
    <div class="box">
      <div class="line total"><span>Total a pagar</span><span>${formatearMoneda(totalLineas)}</span></div>
    </div>
  </div>

  <div class="footer-grid">
    <div class="side">
      <h2>Síguenos</h2>
      ${filasRedesSociales}
    </div>
    <div class="side">
      <h2>Representante legal</h2>
      <div class="row"><span>Nombre</span><span>${representanteNombre}</span></div>
      <div class="row"><span>Documento</span><span>${representanteDocumento}</span></div>
      <div class="signature">Firma autorizada</div>
    </div>
  </div>

  <p class="legal-line">Pictográficos Laboratorio Creativo · ${nitEmpresa} · ${direccionEmpresa}</p>
</div>
</body>
</html>`
}

// Iframe oculto (documento aparte) para que el CSS de la plantilla no se
// filtre al resto de la app, y html2canvas capture el layout ya calculado.
async function renderizarEnIframe(html: string, ancho: number): Promise<HTMLIFrameElement> {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '0'
  iframe.style.left = '-99999px'
  iframe.style.width = `${ancho}px`
  iframe.style.height = '10px'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  const documento = iframe.contentDocument
  if (!documento) {
    iframe.remove()
    throw new Error('No fue posible preparar el documento para generar el PDF.')
  }
  documento.open()
  documento.write(html)
  documento.close()

  const imagenes = Array.from(documento.images)
  await Promise.all(
    imagenes.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            }),
    ),
  )

  return iframe
}

export async function generarCuentaCobroPDF(input: CuentaCobroPdfInput): Promise<void> {
  const ANCHO_RENDER = 820
  const html = construirHtmlCuentaCobro(input)
  const iframe = await renderizarEnIframe(html, ANCHO_RENDER)

  try {
    const contenedor = iframe.contentDocument?.querySelector('.page') as HTMLElement | null
    if (!contenedor) throw new Error('No fue posible preparar el diseño del PDF.')

    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(contenedor, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })

    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margen = 24
    const anchoDisponible = doc.internal.pageSize.getWidth() - margen * 2
    const altoPaginaDisponible = doc.internal.pageSize.getHeight() - margen * 2
    const pxPorPunto = canvas.width / anchoDisponible
    const altoFranjaPx = Math.floor(altoPaginaDisponible * pxPorPunto)

    let offsetPx = 0
    let primeraPagina = true
    while (offsetPx < canvas.height) {
      const franjaAltoPx = Math.min(altoFranjaPx, canvas.height - offsetPx)
      const franja = document.createElement('canvas')
      franja.width = canvas.width
      franja.height = franjaAltoPx
      const ctx = franja.getContext('2d')
      if (!ctx) break
      ctx.drawImage(canvas, 0, offsetPx, canvas.width, franjaAltoPx, 0, 0, canvas.width, franjaAltoPx)

      const altoFranjaPt = franjaAltoPx / pxPorPunto
      if (!primeraPagina) doc.addPage()
      doc.addImage(franja.toDataURL('image/png'), 'PNG', margen, margen, anchoDisponible, altoFranjaPt)

      primeraPagina = false
      offsetPx += franjaAltoPx
    }

    descargar(doc.output('blob'), nombreConFecha(input.nombreArchivoBase, 'pdf'))
  } finally {
    iframe.remove()
  }
}
