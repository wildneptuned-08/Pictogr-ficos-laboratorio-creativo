export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      archivos_pedido: {
        Row: {
          created_at: string
          id: string
          nombre_archivo: string
          pedido_id: string
          tamano: number | null
          tipo_archivo: string | null
          updated_at: string
          url_storage: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre_archivo: string
          pedido_id: string
          tamano?: number | null
          tipo_archivo?: string | null
          updated_at?: string
          url_storage: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre_archivo?: string
          pedido_id?: string
          tamano?: number | null
          tipo_archivo?: string | null
          updated_at?: string
          url_storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "archivos_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      bolsillos_financieros: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          porcentaje: number
          saldo_actual: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          porcentaje: number
          saldo_actual?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          porcentaje?: number
          saldo_actual?: number
          updated_at?: string
        }
        Relationships: []
      }
      categorias_producto: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          activo: boolean
          ciudad: string | null
          correo: string | null
          created_at: string
          direccion: string | null
          id: string
          nombre: string
          observaciones: string | null
          telefono: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          ciudad?: string | null
          correo?: string | null
          created_at?: string
          direccion?: string | null
          id?: string
          nombre: string
          observaciones?: string | null
          telefono: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          ciudad?: string | null
          correo?: string | null
          created_at?: string
          direccion?: string | null
          id?: string
          nombre?: string
          observaciones?: string | null
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracion: {
        Row: {
          correo_contacto: string | null
          created_at: string
          dias_habiles_mes: number | null
          id: string
          nombre_empresa: string | null
          telefono_contacto: string | null
          updated_at: string
        }
        Insert: {
          correo_contacto?: string | null
          created_at?: string
          dias_habiles_mes?: number | null
          id?: string
          nombre_empresa?: string | null
          telefono_contacto?: string | null
          updated_at?: string
        }
        Update: {
          correo_contacto?: string | null
          created_at?: string
          dias_habiles_mes?: number | null
          id?: string
          nombre_empresa?: string | null
          telefono_contacto?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      costos_producto: {
        Row: {
          costo_empaque: number
          costo_impresion: number
          costo_material: number
          costo_total: number
          created_at: string
          id: string
          otros_costos: number
          producto_id: string
          updated_at: string
        }
        Insert: {
          costo_empaque?: number
          costo_impresion?: number
          costo_material?: number
          costo_total?: number
          created_at?: string
          id?: string
          otros_costos?: number
          producto_id: string
          updated_at?: string
        }
        Update: {
          costo_empaque?: number
          costo_impresion?: number
          costo_material?: number
          costo_total?: number
          created_at?: string
          id?: string
          otros_costos?: number
          producto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "costos_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_pedidos: {
        Row: {
          comentario: string | null
          created_at: string
          estado_anterior: string | null
          estado_nuevo: string | null
          fecha: string
          id: string
          pedido_id: string
          updated_at: string
          usuario: string | null
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          estado_anterior?: string | null
          estado_nuevo?: string | null
          fecha?: string
          id?: string
          pedido_id: string
          updated_at?: string
          usuario?: string | null
        }
        Update: {
          comentario?: string | null
          created_at?: string
          estado_anterior?: string | null
          estado_nuevo?: string | null
          fecha?: string
          id?: string
          pedido_id?: string
          updated_at?: string
          usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_pedidos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario: {
        Row: {
          activo: boolean
          categoria: string | null
          codigo: string
          costo_unitario: number
          created_at: string
          id: string
          nombre: string
          proveedor: string | null
          stock_actual: number
          stock_minimo: number
          unidad_medida: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          codigo: string
          costo_unitario?: number
          created_at?: string
          id?: string
          nombre: string
          proveedor?: string | null
          stock_actual?: number
          stock_minimo?: number
          unidad_medida: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          codigo?: string
          costo_unitario?: number
          created_at?: string
          id?: string
          nombre?: string
          proveedor?: string | null
          stock_actual?: number
          stock_minimo?: number
          unidad_medida?: string
          updated_at?: string
        }
        Relationships: []
      }
      movimientos_financieros: {
        Row: {
          bolsillo_id: string
          categoria: string | null
          created_at: string
          descripcion: string | null
          fecha: string
          id: string
          pedido_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento_financiero"]
          updated_at: string
          valor: number
        }
        Insert: {
          bolsillo_id: string
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          pedido_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento_financiero"]
          updated_at?: string
          valor: number
        }
        Update: {
          bolsillo_id?: string
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          pedido_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimiento_financiero"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_financieros_bolsillo_id_fkey"
            columns: ["bolsillo_id"]
            isOneToOne: false
            referencedRelation: "bolsillos_financieros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          inventario_id: string
          motivo: string | null
          pedido_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento_inventario"]
          updated_at: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          inventario_id: string
          motivo?: string | null
          pedido_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimiento_inventario"]
          updated_at?: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          inventario_id?: string
          motivo?: string | null
          pedido_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimiento_inventario"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "inventario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_detalle: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          observaciones: string | null
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          observaciones?: string | null
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number
          updated_at?: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          observaciones?: string | null
          pedido_id?: string
          precio_unitario?: number
          producto_id?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_detalle_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_detalle_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          anticipo: number
          canal_ingreso: Database["public"]["Enums"]["canal_ingreso_pedido"]
          cliente_id: string
          created_at: string
          descuento: number
          estado: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega: string | null
          fecha_pedido: string
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          numero_pedido: string
          observaciones: string | null
          prioridad: Database["public"]["Enums"]["prioridad_pedido"]
          saldo_pendiente: number
          subtotal: number
          updated_at: string
          valor_total: number
        }
        Insert: {
          anticipo?: number
          canal_ingreso: Database["public"]["Enums"]["canal_ingreso_pedido"]
          cliente_id: string
          created_at?: string
          descuento?: number
          estado?: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega?: string | null
          fecha_pedido?: string
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
          numero_pedido: string
          observaciones?: string | null
          prioridad?: Database["public"]["Enums"]["prioridad_pedido"]
          saldo_pendiente?: number
          subtotal?: number
          updated_at?: string
          valor_total?: number
        }
        Update: {
          anticipo?: number
          canal_ingreso?: Database["public"]["Enums"]["canal_ingreso_pedido"]
          cliente_id?: string
          created_at?: string
          descuento?: number
          estado?: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega?: string | null
          fecha_pedido?: string
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
          numero_pedido?: string
          observaciones?: string | null
          prioridad?: Database["public"]["Enums"]["prioridad_pedido"]
          saldo_pendiente?: number
          subtotal?: number
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuesto: {
        Row: {
          activo: boolean
          anio: number
          created_at: string
          id: string
          mes: number
          meta_diaria: number
          meta_mensual: number
          meta_quincenal: number
          meta_semanal: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          anio: number
          created_at?: string
          id?: string
          mes: number
          meta_diaria?: number
          meta_mensual?: number
          meta_quincenal?: number
          meta_semanal?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          anio?: number
          created_at?: string
          id?: string
          mes?: number
          meta_diaria?: number
          meta_mensual?: number
          meta_quincenal?: number
          meta_semanal?: number
          updated_at?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean
          categoria_id: string
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          precio_base: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          precio_base: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          precio_base?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_producto"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cambiar_estado_pedido: {
        Args: {
          p_comentario?: string
          p_nuevo_estado: Database["public"]["Enums"]["estado_pedido"]
          p_pedido_id: string
        }
        Returns: {
          anticipo: number
          canal_ingreso: Database["public"]["Enums"]["canal_ingreso_pedido"]
          cliente_id: string
          created_at: string
          descuento: number
          estado: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega: string | null
          fecha_pedido: string
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          numero_pedido: string
          observaciones: string | null
          prioridad: Database["public"]["Enums"]["prioridad_pedido"]
          saldo_pendiente: number
          subtotal: number
          updated_at: string
          valor_total: number
        }
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      crear_pedido: {
        Args: {
          p_anticipo?: number
          p_canal_ingreso: Database["public"]["Enums"]["canal_ingreso_pedido"]
          p_cliente_id: string
          p_descuento?: number
          p_detalle: Json
          p_fecha_entrega?: string
          p_metodo_pago?: Database["public"]["Enums"]["metodo_pago"]
          p_observaciones?: string
          p_prioridad?: Database["public"]["Enums"]["prioridad_pedido"]
        }
        Returns: {
          anticipo: number
          canal_ingreso: Database["public"]["Enums"]["canal_ingreso_pedido"]
          cliente_id: string
          created_at: string
          descuento: number
          estado: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega: string | null
          fecha_pedido: string
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          numero_pedido: string
          observaciones: string | null
          prioridad: Database["public"]["Enums"]["prioridad_pedido"]
          saldo_pendiente: number
          subtotal: number
          updated_at: string
          valor_total: number
        }
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      registrar_pago_pedido: {
        Args: { p_pedido_id: string; p_valor: number }
        Returns: {
          anticipo: number
          canal_ingreso: Database["public"]["Enums"]["canal_ingreso_pedido"]
          cliente_id: string
          created_at: string
          descuento: number
          estado: Database["public"]["Enums"]["estado_pedido"]
          fecha_entrega: string | null
          fecha_pedido: string
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          numero_pedido: string
          observaciones: string | null
          prioridad: Database["public"]["Enums"]["prioridad_pedido"]
          saldo_pendiente: number
          subtotal: number
          updated_at: string
          valor_total: number
        }
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      canal_ingreso_pedido:
        | "WhatsApp"
        | "Instagram"
        | "Facebook"
        | "Tienda"
        | "Otro"
      estado_pedido:
        | "Nuevo"
        | "Diseño"
        | "Producción"
        | "Listo"
        | "Entregado"
        | "Cancelado"
      metodo_pago:
        | "Efectivo"
        | "Transferencia"
        | "Nequi"
        | "Daviplata"
        | "Tarjeta"
        | "Otro"
      prioridad_pedido: "Baja" | "Media" | "Alta" | "Urgente"
      tipo_movimiento_financiero:
        | "Ingreso"
        | "Gasto"
        | "Transferencia"
        | "Ajuste"
      tipo_movimiento_inventario: "Entrada" | "Salida" | "Ajuste"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      canal_ingreso_pedido: [
        "WhatsApp",
        "Instagram",
        "Facebook",
        "Tienda",
        "Otro",
      ],
      estado_pedido: [
        "Nuevo",
        "Diseño",
        "Producción",
        "Listo",
        "Entregado",
        "Cancelado",
      ],
      metodo_pago: [
        "Efectivo",
        "Transferencia",
        "Nequi",
        "Daviplata",
        "Tarjeta",
        "Otro",
      ],
      prioridad_pedido: ["Baja", "Media", "Alta", "Urgente"],
      tipo_movimiento_financiero: [
        "Ingreso",
        "Gasto",
        "Transferencia",
        "Ajuste",
      ],
      tipo_movimiento_inventario: ["Entrada", "Salida", "Ajuste"],
    },
  },
} as const
