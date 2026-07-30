// Aviso manual por WhatsApp cuando un pedido entra a "Producción": no hay
// integración con ninguna API de WhatsApp, solo se arma un enlace wa.me con
// el mensaje ya redactado para que alguien del equipo le dé clic y lo envíe.
// Funciones puras, sin dependencias externas.
//
// El texto del mensaje es editable desde Configuración → "Mensaje a
// clientes" (ver ConfiguracionMensajesService); esta constante es el
// respaldo que se usa si nunca se guardó una plantilla, o si la consulta a
// Supabase falla — el envío nunca debe quedar roto por falta de config.
export const PLANTILLA_POR_DEFECTO_PRODUCCION =
  '¡Hola {cliente}! 🎉\n\n' +
  'Tu pedido #{pedido} ya está en *{estado}*. Agradecemos mucho la confianza ' +
  'en {empresa}. Muy pronto lo tendrás en tus manos ✨'

export interface VariablesMensaje {
  cliente: string
  pedido: string
  estado: string
  empresa: string
}

export interface PedidoParaWhatsApp {
  numero_pedido: string
  estado: string
  cliente: { nombre: string; telefono: string } | null
}

// Limpia el número (quita espacios, guiones, paréntesis, "+") y antepone el
// indicativo de Colombia "57" solo si quedaron 10 dígitos (celular nacional
// sin indicativo). Con otra cantidad de dígitos se asume que el número ya
// trae su indicativo (o está mal capturado) y se deja tal cual: no se
// adivina un formato que el dato no confirma.
export function normalizarTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '')
  return limpio.length === 10 ? `57${limpio}` : limpio
}

// Reemplaza {cliente}, {pedido}, {estado} y {empresa} por los datos reales.
// Cualquier otro texto de la plantilla (emojis, *negrilla*, saltos de línea)
// se deja intacto.
export function interpolarPlantilla(plantilla: string, variables: VariablesMensaje): string {
  return plantilla
    .replaceAll('{cliente}', variables.cliente)
    .replaceAll('{pedido}', variables.pedido)
    .replaceAll('{estado}', variables.estado)
    .replaceAll('{empresa}', variables.empresa)
}

export function construirEnlaceWhatsApp({
  telefono,
  plantilla,
  ...variables
}: VariablesMensaje & { telefono: string; plantilla: string }): string {
  const mensaje = interpolarPlantilla(plantilla, variables)
  return `https://wa.me/${normalizarTelefono(telefono)}?text=${encodeURIComponent(mensaje)}`
}

// Vanilla: retorna el HTML del botón como string ("" si no corresponde
// mostrarlo), útil para reutilizar la regla fuera de un componente React.
// Usa siempre la plantilla por defecto (no consulta Supabase): la vista de
// Pedidos (React) sí trae la plantilla guardada y arma su propio <a> como
// JSX con las mismas funciones de arriba; ver PedidosPage.tsx.
export function renderBotonWhatsApp(pedido: PedidoParaWhatsApp, nombreEmpresa = 'Pictográficos'): string {
  const telefono = pedido.cliente?.telefono
  if (pedido.estado !== 'Producción' || !telefono) return ''

  const enlace = construirEnlaceWhatsApp({
    telefono,
    plantilla: PLANTILLA_POR_DEFECTO_PRODUCCION,
    cliente: pedido.cliente?.nombre ?? '',
    pedido: pedido.numero_pedido,
    estado: pedido.estado,
    empresa: nombreEmpresa,
  })

  return (
    `<a class="btn-whatsapp" href="${enlace}" target="_blank" rel="noopener noreferrer" ` +
    `aria-label="Enviar aviso de producción por WhatsApp">📲</a>`
  )
}
