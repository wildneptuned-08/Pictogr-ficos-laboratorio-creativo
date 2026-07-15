export function rangoDelMesActual(fecha: Date = new Date()) {
  const anio = fecha.getFullYear()
  const mes = fecha.getMonth() + 1
  const ultimoDia = new Date(anio, mes, 0).getDate()
  return {
    anio,
    mes,
    desde: `${anio}-${String(mes).padStart(2, '0')}-01`,
    hasta: `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`,
  }
}
