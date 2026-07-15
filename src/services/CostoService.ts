import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { CostoProducto } from '@/types/database'

export interface CalcularCostoInput {
  producto_id: string
  costo_material: number
  costo_impresion: number
  costo_empaque: number
  otros_costos: number
}

export type ActualizarCostoInput = Partial<
  Omit<CalcularCostoInput, 'producto_id'>
>

export interface Rentabilidad {
  precioBase: number
  costoTotal: number
  utilidad: number
  margenPorcentaje: number
}

const FALLBACK_ERROR = 'No fue posible completar la operación con los costos del producto.'

function sumarCostoTotal(costos: ActualizarCostoInput & CalcularCostoInput) {
  return (
    costos.costo_material +
    costos.costo_impresion +
    costos.costo_empaque +
    costos.otros_costos
  )
}

export const CostoService = {
  // "Calcular Costo": registra por primera vez la estructura de costos de un producto.
  async calcularCosto(
    input: CalcularCostoInput,
  ): Promise<ServiceResponse<CostoProducto>> {
    if (
      [
        input.costo_material,
        input.costo_impresion,
        input.costo_empaque,
        input.otros_costos,
      ].some((valor) => valor < 0)
    ) {
      return fail('Los costos no pueden ser negativos.')
    }

    const { data, error } = await supabase
      .from('costos_producto')
      .insert({ ...input, costo_total: sumarCostoTotal(input) })
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  // "Actualizar Costos": modifica uno o más componentes y recalcula el total.
  async actualizarCostos(
    productoId: string,
    input: ActualizarCostoInput,
  ): Promise<ServiceResponse<CostoProducto>> {
    if (Object.values(input).some((valor) => valor !== undefined && valor < 0)) {
      return fail('Los costos no pueden ser negativos.')
    }

    const actual = await this.consultarCostos(productoId)
    if (!actual.success || !actual.data) {
      return fail('El producto todavía no tiene costos registrados.')
    }

    const combinado = { ...actual.data, ...input }
    const costo_total = sumarCostoTotal(combinado)

    const { data, error } = await supabase
      .from('costos_producto')
      .update({ ...input, costo_total })
      .eq('producto_id', productoId)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async consultarCostos(productoId: string): Promise<ServiceResponse<CostoProducto>> {
    const { data, error } = await supabase
      .from('costos_producto')
      .select()
      .eq('producto_id', productoId)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible consultar los costos del producto.'))
    return ok(data)
  },

  // Recalcula el costo_total a partir de los componentes ya almacenados.
  // No recalcula desde Inventario: el esquema actual no vincula insumos con
  // productos, así que el costo por insumo se actualiza manualmente (ver
  // Docs/45_ANALISIS_COSTOS.md, "Productos personalizados").
  async recalcularCostos(productoId: string): Promise<ServiceResponse<CostoProducto>> {
    const actual = await this.consultarCostos(productoId)
    if (!actual.success || !actual.data) {
      return fail('El producto todavía no tiene costos registrados.')
    }

    const { data, error } = await supabase
      .from('costos_producto')
      .update({ costo_total: sumarCostoTotal(actual.data) })
      .eq('producto_id', productoId)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async obtenerRentabilidad(productoId: string): Promise<ServiceResponse<Rentabilidad>> {
    const [{ data: producto, error: errorProducto }, costos] = await Promise.all([
      supabase.from('productos').select('precio_base').eq('id', productoId).single(),
      this.consultarCostos(productoId),
    ])

    if (errorProducto || !producto) {
      return fail('No fue posible encontrar el producto.')
    }
    if (!costos.success || !costos.data) {
      return fail('El producto todavía no tiene costos registrados.')
    }

    const precioBase = producto.precio_base
    const costoTotal = costos.data.costo_total
    const utilidad = precioBase - costoTotal
    const margenPorcentaje = precioBase > 0 ? (utilidad / precioBase) * 100 : 0

    return ok({ precioBase, costoTotal, utilidad, margenPorcentaje })
  },
}
