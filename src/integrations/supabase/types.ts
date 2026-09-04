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
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_user_id: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_equity_snapshots: {
        Row: {
          created_at: string
          equity: number
          id: string
          invested: number
          open_positions: number
          today_pnl: number
          total_pnl: number
          user_id: string
        }
        Insert: {
          created_at?: string
          equity: number
          id?: string
          invested?: number
          open_positions?: number
          today_pnl?: number
          total_pnl?: number
          user_id: string
        }
        Update: {
          created_at?: string
          equity?: number
          id?: string
          invested?: number
          open_positions?: number
          today_pnl?: number
          total_pnl?: number
          user_id?: string
        }
        Relationships: []
      }
      demo_market_state: {
        Row: {
          asset: string
          id: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          asset: string
          id?: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: string
          id?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          reference: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      operations: {
        Row: {
          asset: string
          closed_at: string | null
          created_at: string
          direction: string
          entry_price: number
          exit_price: number | null
          id: string
          opened_at: string
          pnl: number
          return_pct: number
          size: number
          status: string
          user_id: string
        }
        Insert: {
          asset: string
          closed_at?: string | null
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pnl?: number
          return_pct?: number
          size?: number
          status?: string
          user_id: string
        }
        Update: {
          asset?: string
          closed_at?: string | null
          created_at?: string
          direction?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          opened_at?: string
          pnl?: number
          return_pct?: number
          size?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          ai_robot_access: string
          created_at: string
          features: Json
          id: string
          is_popular: boolean
          min_investment: number
          name: string
          risk_level: string
          slug: string
          sort_order: number
          strategy: string
          support: string
          tagline: string
        }
        Insert: {
          ai_robot_access?: string
          created_at?: string
          features?: Json
          id?: string
          is_popular?: boolean
          min_investment?: number
          name: string
          risk_level?: string
          slug: string
          sort_order?: number
          strategy?: string
          support?: string
          tagline?: string
        }
        Update: {
          ai_robot_access?: string
          created_at?: string
          features?: Json
          id?: string
          is_popular?: boolean
          min_investment?: number
          name?: string
          risk_level?: string
          slug?: string
          sort_order?: number
          strategy?: string
          support?: string
          tagline?: string
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          hint: string
          id: string
          key: string
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          hint?: string
          id?: string
          key: string
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          hint?: string
          id?: string
          key?: string
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          balance: number
          id: string
          invested: number
          performance_pct: number
          today_pnl: number
          total_deposited: number
          total_pnl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          invested?: number
          performance_pct?: number
          today_pnl?: number
          total_deposited?: number
          total_pnl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          invested?: number
          performance_pct?: number
          today_pnl?: number
          total_deposited?: number
          total_pnl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_controls: {
        Row: {
          id: string
          kill_switch: boolean
          max_daily_loss_usd: number
          max_drawdown_pct: number
          max_open_positions: number
          max_position_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          kill_switch?: boolean
          max_daily_loss_usd?: number
          max_drawdown_pct?: number
          max_open_positions?: number
          max_position_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          kill_switch?: boolean
          max_daily_loss_usd?: number
          max_drawdown_pct?: number
          max_open_positions?: number
          max_position_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      robots: {
        Row: {
          capital_allocation: number
          created_at: string
          id: string
          markets: string[]
          mode: string
          risk_level: string
          status: string
          strategy: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capital_allocation?: number
          created_at?: string
          id?: string
          markets?: string[]
          mode?: string
          risk_level?: string
          status?: string
          strategy?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capital_allocation?: number
          created_at?: string
          id?: string
          markets?: string[]
          mode?: string
          risk_level?: string
          status?: string
          strategy?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          currency: string
          email_notifications: boolean
          id: string
          language: string
          push_notifications: boolean
          risk_alerts: boolean
          theme: string
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          currency?: string
          email_notifications?: boolean
          id?: string
          language?: string
          push_notifications?: boolean
          risk_alerts?: boolean
          theme?: string
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          currency?: string
          email_notifications?: boolean
          id?: string
          language?: string
          push_notifications?: boolean
          risk_alerts?: boolean
          theme?: string
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_runtime: {
        Row: {
          global_kill_switch: boolean
          id: boolean
          live_enabled: boolean
          updated_at: string
        }
        Insert: {
          global_kill_switch?: boolean
          id?: boolean
          live_enabled?: boolean
          updated_at?: string
        }
        Update: {
          global_kill_switch?: boolean
          id?: boolean
          live_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          destination: string
          id: string
          method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          destination?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          destination?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      admin_get_chat_messages: {
        Args: { target_user_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }[]
      }
      admin_list_users: {
        Args: never
        Returns: {
          country: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      admin_review_deposit: {
        Args: { decision: string; request_id: string }
        Returns: boolean
      }
      admin_review_withdrawal: {
        Args: { decision: string; request_id: string }
        Returns: boolean
      }
      admin_send_support_message: {
        Args: { message_content: string; target_user_id: string }
        Returns: boolean
      }
      admin_set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      admin_update_portfolio: {
        Args: {
          new_balance: number
          new_invested: number
          new_performance_pct: number
          new_today_pnl: number
          new_total_deposited: number
          new_total_pnl: number
          target_user_id: string
        }
        Returns: boolean
      }
      admin_upsert_risk_controls: {
        Args: {
          new_kill_switch: boolean
          new_max_daily_loss_usd: number
          new_max_drawdown_pct: number
          new_max_open_positions: number
          new_max_position_usd: number
          target_user_id: string
        }
        Returns: boolean
      }
      bootstrap_first_admin: { Args: never; Returns: boolean }
      create_risk_alert_if_needed: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      demo_execute_tick: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
