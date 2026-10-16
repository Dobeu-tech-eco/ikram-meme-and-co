export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      stripe_events: {
        Row: {
          claimed_at: string
          event_id: string
          processed_at: string | null
          received_at: string
          status: string
        }
        Insert: {
          claimed_at?: string
          event_id: string
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Update: {
          claimed_at?: string
          event_id?: string
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Relationships: []
      }
      artists: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          id: string
          instagram: string | null
          name_ar: string
          name_en: string
          photo_url: string | null
          slug: string
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          name_ar: string
          name_en: string
          photo_url?: string | null
          slug: string
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          name_ar?: string
          name_en?: string
          photo_url?: string | null
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price_cents: number
          product_id: string
          quantity: number
          title_en: string
        }
        Insert: {
          id?: string
          order_id: string
          price_cents: number
          product_id: string
          quantity?: number
          title_en: string
        }
        Update: {
          id?: string
          order_id?: string
          price_cents?: number
          product_id?: string
          quantity?: number
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_total_cents: number
          carrier: string | null
          created_at: string
          currency: string
          email: string
          id: string
          inventory_applied: boolean
          locale: string
          notified_at: string | null
          shipping_address: Json | null
          shipping_name: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string
          stripe_payment_intent_id: string | null
          tracking_number: string | null
        }
        Insert: {
          amount_total_cents?: number
          carrier?: string | null
          created_at?: string
          currency?: string
          email: string
          id?: string
          inventory_applied?: boolean
          locale?: string
          notified_at?: string | null
          shipping_address?: Json | null
          shipping_name?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string
          stripe_payment_intent_id?: string | null
          tracking_number?: string | null
        }
        Update: {
          amount_total_cents?: number
          carrier?: string | null
          created_at?: string
          currency?: string
          email?: string
          id?: string
          inventory_applied?: boolean
          locale?: string
          notified_at?: string | null
          shipping_address?: Json | null
          shipping_name?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string
          stripe_payment_intent_id?: string | null
          tracking_number?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          artist_id: string
          created_at: string
          currency: string
          description_ar: string | null
          description_en: string | null
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          images: Json
          price_cents: number
          quantity: number
          reserved_until: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          title_ar: string
          title_en: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          currency?: string
          description_ar?: string | null
          description_en?: string | null
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          images?: Json
          price_cents: number
          quantity?: number
          reserved_until?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          title_ar: string
          title_en: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          currency?: string
          description_ar?: string | null
          description_en?: string | null
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          images?: Json
          price_cents?: number
          quantity?: number
          reserved_until?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_checkout_inventory: {
        Args: { p_order_id: string; p_product_id: string }
        Returns: string
      }
      claim_order_notification: { Args: { p_order_id: string }; Returns: boolean }
      claim_stripe_event: {
        Args: { p_event_id: string; p_stale_after?: string }
        Returns: string
      }
      complete_stripe_event: { Args: { p_event_id: string }; Returns: undefined }
      decrement_edition: { Args: { p_id: string }; Returns: boolean }
      mark_sold: { Args: { p_id: string }; Returns: undefined }
      release_original: { Args: { p_id: string }; Returns: undefined }
      release_stripe_event: { Args: { p_event_id: string }; Returns: undefined }
      reserve_original: {
        Args: { p_id: string; p_minutes?: number }
        Returns: boolean
      }
    }
    Enums: {
      fulfillment_type: "original" | "edition" | "pod"
      order_status: "pending" | "paid" | "failed" | "refunded" | "fulfilled"
      product_status: "draft" | "available" | "reserved" | "sold" | "archived"
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
      fulfillment_type: ["original", "edition", "pod"],
      order_status: ["pending", "paid", "failed", "refunded", "fulfilled"],
      product_status: ["draft", "available", "reserved", "sold", "archived"],
    },
  },
} as const
