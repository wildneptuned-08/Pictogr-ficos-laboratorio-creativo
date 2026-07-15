import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

const COLORES = ['57, 255, 20', '0, 210, 255'] // verde neón, cian eléctrico

// Estela tipo "estrella fugaz" que sigue al cursor (Docs/08_DESIGN_SYSTEM.md
// v2.0). Solo con mouse real y sin prefers-reduced-motion; nunca interfiere
// con clics.
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Nota: no se filtra por "pointer: fine" — en portátiles híbridas con
  // pantalla táctil esa media query puede reportar "coarse" aunque el
  // usuario esté usando mouse/trackpad real. mousemove solo lo dispara un
  // puntero real de todas formas, así que basta con respetar accesibilidad.
  const [enabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      ctx!.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    let particles: Particle[] = []
    let lastSpawn = 0
    let colorIndex = 0

    function handleMove(e: MouseEvent) {
      const now = performance.now()
      if (now - lastSpawn < 16) return
      lastSpawn = now
      colorIndex++

      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 + 0.3,
        life: 1,
        size: 2 + Math.random() * 2.5,
        color: COLORES[colorIndex % COLORES.length],
      })
      if (particles.length > 120) particles.shift()
    }
    window.addEventListener('mousemove', handleMove, { passive: true })

    let frameId: number
    function tick() {
      ctx!.clearRect(0, 0, width, height)

      // Actualizar posición/vida primero y solo después filtrar: si se
      // filtra antes de decrementar, una partícula puede cruzar a vida
      // negativa dentro del mismo cuadro y producir un radio negativo,
      // lo que hace que createRadialGradient lance una excepción y
      // detenga el loop de animación por completo.
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.025
      }
      particles = particles.filter((p) => p.life > 0.02)

      for (const p of particles) {
        const radio = p.size * p.life * 4
        const gradiente = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, radio)
        gradiente.addColorStop(0, `rgba(${p.color}, ${p.life * 0.9})`)
        gradiente.addColorStop(1, `rgba(${p.color}, 0)`)

        ctx!.fillStyle = gradiente
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, radio, 0, Math.PI * 2)
        ctx!.fill()
      }

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(frameId)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
