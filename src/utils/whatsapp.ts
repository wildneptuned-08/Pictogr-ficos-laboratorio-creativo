// Aviso manual por WhatsApp cuando un pedido entra a "Producción": no hay
// integración con ninguna API de WhatsApp, solo se arma un enlace wa.me con
// el mensaje ya redactado para que alguien del equipo le dé clic y lo envíe.
// Funciones puras, sin dependencias externas.

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

export function construirMensajeProduccion({
  nombreCliente,
  numeroPedido,
}: {
  nombreCliente: string
  numeroPedido: string
}): string {
  return (
    `¡Hola ${nombreCliente}! 🎉\n\n` +
    `Tu pedido #${numeroPedido} ya está en *Producción*. Agradecemos mucho la confianza ` +
    `en PictoGráficos Laboratorio Creativo. Muy pronto lo tendrás en tus manos ✨`
  )
}

export function construirEnlaceWhatsApp({
  telefono,
  nombreCliente,
  numeroPedido,
}: {
  telefono: string
  nombreCliente: string
  numeroPedido: string
}): string {
  const mensaje = construirMensajeProduccion({ nombreCliente, numeroPedido })
  return `https://wa.me/${normalizarTelefono(telefono)}?text=${encodeURIComponent(mensaje)}`
}

// Vanilla: retorna el HTML del botón como string ("" si no corresponde
// mostrarlo), útil para reutilizar la regla fuera de un componente React.
// La vista de Pedidos (React) no inyecta este string — usa las mismas
// funciones de arriba para renderizar un <a> como JSX; ver PedidosPage.tsx.
export function renderBotonWhatsApp(pedido: PedidoParaWhatsApp): string {
  const telefono = pedido.cliente?.telefono
  if (pedido.estado !== 'Producción' || !telefono) return ''

  const enlace = construirEnlaceWhatsApp({
    telefono,
    nombreCliente: pedido.cliente?.nombre ?? '',
    numeroPedido: pedido.numero_pedido,
  })

  return (
    `<a class="btn-whatsapp" href="${enlace}" target="_blank" rel="noopener noreferrer" ` +
    `aria-label="Enviar aviso de producción por WhatsApp">📲</a>`
  )
}
