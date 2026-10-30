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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          content_en: string | null
          content_vi: string
          created_at: string
          id: string
          published_at: string | null
          slug: string
          thumbnail_url: string | null
          title_en: string | null
          title_vi: string
          updated_at: string
        }
        Insert: {
          content_en?: string | null
          content_vi: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          thumbnail_url?: string | null
          title_en?: string | null
          title_vi: string
          updated_at?: string
        }
        Update: {
          content_en?: string | null
          content_vi?: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          thumbnail_url?: string | null
          title_en?: string | null
          title_vi?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_vi: string
          sort_order: number
          tab_color: string
          tab_label_en: string | null
          tab_label_vi: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_vi: string
          sort_order?: number
          tab_color?: string
          tab_label_en?: string | null
          tab_label_vi: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_vi?: string
          sort_order?: number
          tab_color?: string
          tab_label_en?: string | null
          tab_label_vi?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_audit_log: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          additional_fee: number | null
          content_en: string | null
          content_vi: string
          cover_asset_id: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description_en: string | null
          description_vi: string | null
          end_date: string | null
          event_date: string
          id: string
          is_active: boolean
          performer_name: string
          public_id: string
          source_id: string | null
          source_url: string | null
          title_en: string | null
          title_vi: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          additional_fee?: number | null
          content_en?: string | null
          content_vi?: string
          cover_asset_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_vi?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          is_active?: boolean
          performer_name: string
          public_id?: string
          source_id?: string | null
          source_url?: string | null
          title_en?: string | null
          title_vi: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          additional_fee?: number | null
          content_en?: string | null
          content_vi?: string
          cover_asset_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_vi?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          is_active?: boolean
          performer_name?: string
          public_id?: string
          source_id?: string | null
          source_url?: string | null
          title_en?: string | null
          title_vi?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_en: string | null
          alt_vi: string
          bucket_id: string
          created_at: string
          created_by: string | null
          height: number
          id: string
          mime_type: string
          object_path: string
          original_filename: string
          size_bytes: number
          source_url: string | null
          updated_at: string
          width: number
        }
        Insert: {
          alt_en?: string | null
          alt_vi?: string
          bucket_id: string
          created_at?: string
          created_by?: string | null
          height: number
          id?: string
          mime_type: string
          object_path: string
          original_filename: string
          size_bytes: number
          source_url?: string | null
          updated_at?: string
          width: number
        }
        Update: {
          alt_en?: string | null
          alt_vi?: string
          bucket_id?: string
          created_at?: string
          created_by?: string | null
          height?: number
          id?: string
          mime_type?: string
          object_path?: string
          original_filename?: string
          size_bytes?: number
          source_url?: string | null
          updated_at?: string
          width?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description_en: string | null
          description_vi: string | null
          id: string
          is_sold_out: boolean
          name_en: string | null
          name_vi: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          id?: string
          is_sold_out?: boolean
          name_en?: string | null
          name_vi: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description_en?: string | null
          description_vi?: string | null
          id?: string
          is_sold_out?: boolean
          name_en?: string | null
          name_vi?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_activity: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          new_status: string
          previous_status: string | null
          reservation_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: never
          new_status: string
          previous_status?: string | null
          reservation_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: never
          new_status?: string
          previous_status?: string | null
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_activity_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string | null
          event_id: string | null
          guests: number
          id: string
          idempotency_key: string
          name: string
          notes: string
          phone: string
          reference: string
          status: string
          updated_at: string
          updated_by: string | null
          venue_timezone: string
          visit_date: string
          visit_time: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          event_id?: string | null
          guests: number
          id?: string
          idempotency_key: string
          name: string
          notes?: string
          phone: string
          reference?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          venue_timezone?: string
          visit_date: string
          visit_time: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string | null
          event_id?: string | null
          guests?: number
          id?: string
          idempotency_key?: string
          name?: string
          notes?: string
          phone?: string
          reference?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          venue_timezone?: string
          visit_date?: string
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_settings: {
        Row: {
          created_at: string
          heading_en: string | null
          heading_vi: string
          id: string
          is_visible: boolean
          provider: string
          source_url: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          heading_en?: string | null
          heading_vi: string
          id?: string
          is_visible?: boolean
          provider: string
          source_url: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          heading_en?: string | null
          heading_vi?: string
          id?: string
          is_visible?: boolean
          provider?: string
          source_url?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
