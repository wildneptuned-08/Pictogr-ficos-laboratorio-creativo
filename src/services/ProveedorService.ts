import { supabase } from '@/config/supabaseClient'
import { ok, fail, friendlyMessage } from '@/services/utils/serviceResponse'
import type { ServiceResponse } from '@/types/service'
import type { Proveedor } from '@/types/database'

export interface CrearProveedorInput {
  nombre: string
  prefijo_id: string
}

export type ActualizarProveedorInput = Partial<CrearProveedorInput>

const FALLBACK_ERROR = 'No fue posible completar la operación con el proveedor.'

// Marcas combinantes (categoría Unicode M) que deja sueltas normalize('NFD'):
// permite convertir "Cartón" en "CARTON" antes de armar un prefijo.
const DIACRITICOS = /\p{M}/gu

// El prefijo forma parte de los códigos (PREFIJO-XXXX), así que se normaliza a
// mayúsculas sin espacios para que coincida con lo que genera la base de datos.
function normalizarPrefijo(prefijo: string): string {
  return prefijo.trim().toUpperCase().replace(/\s+/g, '')
}

// Prefijo tentativo para un proveedor que llega en una importación y todavía
// no existe. Con varias palabras toma 3 letras de la primera y 2 de la
// segunda ("Tienda Fla" -> TIEFL) para no chocar con otros del mismo grupo
// ("Tienda Transfer" -> TIETR). El usuario puede cambiarlo después.
export function sugerirPrefijo(nombre: string): string {
  const palabras = nombre
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (palabras.length === 0) return 'PROV'
  if (palabras.length === 1) return palabras[0].slice(0, 5).toUpperCase()
  return (palabras[0].slice(0, 3) + palabras[1].slice(0, 2)).toUpperCase()
}

export const ProveedorService = {
  async create(input: CrearProveedorInput): Promise<ServiceResponse<Proveedor>> {
    if (!input.nombre.trim()) {
      return fail('El nombre del proveedor es obligatorio.')
    }
    const prefijo = normalizarPrefijo(input.prefijo_id)
    if (!prefijo) {
      return fail('El prefijo del proveedor es obligatorio.')
    }

    const { data: existente } = await supabase
      .from('proveedores')
      .select('id')
      .eq('prefijo_id', prefijo)
      .maybeSingle()

    if (existente) {
      return fail('Ya existe un proveedor con ese prefijo.')
    }

    const { data, error } = await supabase
      .from('proveedores')
      .insert({ nombre: input.nombre.trim(), prefijo_id: prefijo })
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async update(
    id: string,
    input: ActualizarProveedorInput,
  ): Promise<ServiceResponse<Proveedor>> {
    if (input.nombre !== undefined && !input.nombre.trim()) {
      return fail('El nombre del proveedor es obligatorio.')
    }

    const cambios: ActualizarProveedorInput = {}
    if (input.nombre !== undefined) cambios.nombre = input.nombre.trim()
    if (input.prefijo_id !== undefined) {
      const prefijo = normalizarPrefijo(input.prefijo_id)
      if (!prefijo) return fail('El prefijo del proveedor es obligatorio.')
      cambios.prefijo_id = prefijo
    }

    const { data, error } = await supabase
      .from('proveedores')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, FALLBACK_ERROR))
    return ok(data)
  },

  async findById(id: string): Promise<ServiceResponse<Proveedor>> {
    const { data, error } = await supabase
      .from('proveedores')
      .select()
      .eq('id', id)
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible encontrar el proveedor.'))
    return ok(data)
  },

  async list(): Promise<ServiceResponse<Proveedor[]>> {
    const { data, error } = await supabase
      .from('proveedores')
      .select()
      .order('nombre', { ascending: true })

    if (error) return fail(friendlyMessage(error, 'No fue posible listar los proveedores.'))
    return ok(data)
  },

  // Soporta la importación de inventario: devuelve un mapa nombre -> proveedor
  // creando los que falten. La comparación de nombres ignora mayúsculas y
  // espacios sobrantes para no duplicar "Sublimugs" y "sublimugs ".
  async asegurarPorNombre(
    nombres: string[],
  ): Promise<ServiceResponse<{ mapa: Map<string, Proveedor>; creados: Proveedor[] }>> {
    const existentes = await this.list()
    if (!existentes.success || !existentes.data) {
      return fail('No fue posible consultar los proveedores.')
    }

    const clave = (nombre: string) => nombre.trim().toLowerCase()
    const mapa = new Map<string, Proveedor>()
    for (const proveedor of existentes.data) mapa.set(clave(proveedor.nombre), proveedor)

    const prefijosUsados = new Set(existentes.data.map((p) => p.prefijo_id))
    const pendientes = Array.from(
      new Set(nombres.map((n) => n.trim()).filter((n) => n && !mapa.has(clave(n)))),
    )

    const creados: Proveedor[] = []
    for (const nombre of pendientes) {
      // Si el prefijo sugerido ya está tomado, se numera hasta encontrar libre.
      const base = sugerirPrefijo(nombre)
      let prefijo = base
      let intento = 2
      while (prefijosUsados.has(prefijo)) {
        prefijo = `${base}${intento}`.slice(0, 20)
        intento += 1
      }

      const resultado = await this.create({ nombre, prefijo_id: prefijo })
      if (!resultado.success || !resultado.data) {
        return fail(`No fue posible crear el proveedor "${nombre}".`)
      }

      prefijosUsados.add(prefijo)
      mapa.set(clave(nombre), resultado.data)
      creados.push(resultado.data)
    }

    return ok({ mapa, creados })
  },

  async eliminar(id: string): Promise<ServiceResponse<Proveedor>> {
    const { data, error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) return fail(friendlyMessage(error, 'No fue posible eliminar el proveedor.'))
    return ok(data)
  },
}
