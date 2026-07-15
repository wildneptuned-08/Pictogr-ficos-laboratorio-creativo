import { formatCurrency } from '@/utils/formatCurrency'

interface PuntoVenta {
  mes: string
  ventas: number
}

function barraPath(x: number, y: number, w: number, alto: number, r: number): string {
  const radio = Math.min(r, w / 2, alto)
  return `M${x},${y + radio} Q${x},${y} ${x + radio},${y} L${x + w - radio},${y} Q${x + w},${y} ${x + w},${y + radio} L${x + w},${y + alto} L${x},${y + alto} Z`
}

export function VentasChart({ data }: { data: PuntoVenta[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin ventas registradas en este período.</p>
  }

  const width = 640
  const height = 200
  const gap = 12
  const barWidth = (width - gap * (data.length - 1)) / data.length
  const max = Math.max(...data.map((d) => d.ventas), 1)

  return (
    <svg
      viewBox={`0 0 ${width} ${height + 34}`}
      className="w-full"
      role="img"
      aria-label="Ventas mensuales de los últimos meses"
    >
      <line x1={0} y1={height} x2={width} y2={height} className="stroke-border" strokeWidth={1} />
      {data.map((punto, index) => {
        const alto = (punto.ventas / max) * (height - 24)
        const x = index * (barWidth + gap)
        const y = height - alto

        return (
          <g key={punto.mes}>
            <path
              d={barraPath(x, y, barWidth, alto, 4)}
              className="fill-[#2a78d6] transition-opacity hover:opacity-80 dark:fill-[#3987e5]"
            >
              <title>{`${punto.mes}: ${formatCurrency(punto.ventas)}`}</title>
            </path>
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {formatCurrency(punto.ventas)}
            </text>
            <text
              x={x + barWidth / 2}
              y={height + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {punto.mes}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
