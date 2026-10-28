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
      activity_log: {
        Row: {
          activity_log_id: number
          changed_by: string | null
          internal_notes: string | null
          member_message: string | null
          new_status_id: number
          old_status_id: number
          reference_code: string
          timestamp: string
        }
        Insert: {
          activity_log_id?: number
          changed_by?: string | null
          internal_notes?: string | null
          member_message?: string | null
          new_status_id?: number
          old_status_id?: number
          reference_code: string
          timestamp?: string
        }
        Update: {
          activity_log_id?: number
          changed_by?: string | null
          internal_notes?: string | null
          member_message?: string | null
          new_status_id?: number
          old_status_id?: number
          reference_code?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_new_status_id_fkey"
            columns: ["new_status_id"]
            isOneToOne: false
            referencedRelation: "status_types"
            referencedColumns: ["status_type_id"]
          },
          {
            foreignKeyName: "activity_log_old_status_id_fkey"
            columns: ["old_status_id"]
            isOneToOne: false
            referencedRelation: "status_types"
            referencedColumns: ["status_type_id"]
          },
          {
            foreignKeyName: "activity_log_reference_code_fkey"
            columns: ["reference_code"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["reference_code"]
          },
        ]
      }
      care_requests: {
        Row: {
          anonymous_flag: boolean
          archived_at: string | null
          archived_flag: boolean
          contact_method_id: number
          created_at: string
          email: string | null
          first: string | null
          id: number
          internal_notes: string | null
          last: string | null
          member_notes: string
          no_contact_flag: boolean
          phone: string | null
          reference_code: string
          request_type_id: number
          status_type_id: number
          updated_at: string
          urgency_type_id: number
        }
        Insert: {
          anonymous_flag?: boolean
          archived_at?: string | null
          archived_flag?: boolean
          contact_method_id: number
          created_at?: string
          email?: string | null
          first?: string | null
          id?: number
          internal_notes?: string | null
          last?: string | null
          member_notes: string
          no_contact_flag?: boolean
          phone?: string | null
          reference_code?: string
          request_type_id: number
          status_type_id: number
          updated_at?: string
          urgency_type_id: number
        }
        Update: {
          anonymous_flag?: boolean
          archived_at?: string | null
          archived_flag?: boolean
          contact_method_id?: number
          created_at?: string
          email?: string | null
          first?: string | null
          id?: number
          internal_notes?: string | null
          last?: string | null
          member_notes?: string
          no_contact_flag?: boolean
          phone?: string | null
          reference_code?: string
          request_type_id?: number
          status_type_id?: number
          updated_at?: string
          urgency_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "care_requests_contact_method_id_fkey"
            columns: ["contact_method_id"]
            isOneToOne: false
            referencedRelation: "contact_method_types"
            referencedColumns: ["contact_method_type_id"]
          },
          {
            foreignKeyName: "care_requests_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_type"
            referencedColumns: ["request_type_id"]
          },
          {
            foreignKeyName: "care_requests_status_type_id_fkey"
            columns: ["status_type_id"]
            isOneToOne: false
            referencedRelation: "status_types"
            referencedColumns: ["status_type_id"]
          },
          {
            foreignKeyName: "care_requests_urgency_type_id_fkey"
            columns: ["urgency_type_id"]
            isOneToOne: false
            referencedRelation: "urgency_type"
            referencedColumns: ["urgency_type_id"]
          },
        ]
      }
      contact_method_types: {
        Row: {
          contact_method: string
          contact_method_type_id: number
        }
        Insert: {
          contact_method: string
          contact_method_type_id?: number
        }
        Update: {
          contact_method?: string
          contact_method_type_id?: number
        }
        Relationships: []
      }
      request_type: {
        Row: {
          request_type: string
          request_type_id: number
        }
        Insert: {
          request_type?: string
          request_type_id?: number
        }
        Update: {
          request_type?: string
          request_type_id?: number
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      status_types: {
        Row: {
          status_type: string
          status_type_id: number
        }
        Insert: {
          status_type: string
          status_type_id?: number
        }
        Update: {
          status_type?: string
          status_type_id?: number
        }
        Relationships: []
      }
      urgency_type: {
        Row: {
          urgency: string
          urgency_type_id: number
        }
        Insert: {
          urgency: string
          urgency_type_id?: number
        }
        Update: {
          urgency?: string
          urgency_type_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_care_request: {
        Args: { p_reference_code: string }
        Returns: {
          created_at: string
          reference_code: string
          request_type: string
          status_type: string
          status_type_id: number
          updated_at: string
        }[]
      }
      get_request_updates: {
        Args: { p_reference_code: string }
        Returns: {
          activity_log_id: number
          member_message: string
          new_status: string
          new_status_id: number
          old_status: string
          old_status_id: number
          reference_code: string
          timestamp: string
        }[]
      }
      submit_care_request: {
        Args: {
          p_anonymous?: boolean
          p_contact_method_id: number
          p_email?: string
          p_first?: string
          p_last?: string
          p_member_notes?: string
          p_no_contact?: boolean
          p_phone?: string
          p_request_type_id: number
          p_urgency_type_id: number
        }
        Returns: string
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
