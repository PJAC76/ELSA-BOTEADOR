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
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_preset: boolean
          message: string
          round_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_preset?: boolean
          message: string
          round_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_preset?: boolean
          message?: string
          round_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      match_players: {
        Row: {
          current_zone: number
          id: string
          is_alive: boolean
          match_id: string
          role: Database["public"]["Enums"]["player_role"]
          user_id: string
        }
        Insert: {
          current_zone?: number
          id?: string
          is_alive?: boolean
          match_id: string
          role?: Database["public"]["Enums"]["player_role"]
          user_id: string
        }
        Update: {
          current_zone?: number
          id?: string
          is_alive?: boolean
          match_id?: string
          role?: Database["public"]["Enums"]["player_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          current_round: number
          id: string
          room_id: string
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
          winner: Database["public"]["Enums"]["match_winner"] | null
        }
        Insert: {
          created_at?: string
          current_round?: number
          id?: string
          room_id: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          winner?: Database["public"]["Enums"]["match_winner"] | null
        }
        Update: {
          created_at?: string
          current_round?: number
          id?: string
          room_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          winner?: Database["public"]["Enums"]["match_winner"] | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_config: Json
          created_at: string
          display_name: string
          friend_code: string | null
          hand_preference: string
          id: string
          language: string
          level: number
          theme: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_config?: Json
          created_at?: string
          display_name?: string
          friend_code?: string | null
          hand_preference?: string
          id?: string
          language?: string
          level?: number
          theme?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_config?: Json
          created_at?: string
          display_name?: string
          friend_code?: string | null
          hand_preference?: string
          id?: string
          language?: string
          level?: number
          theme?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          reason: string
          reported_id: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          reason: string
          reported_id: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          reason?: string
          reported_id?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      room_players: {
        Row: {
          id: string
          is_ready: boolean
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_ready?: boolean
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_ready?: boolean
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          host_id: string
          id: string
          language: string
          max_players: number
          mode: Database["public"]["Enums"]["room_mode"]
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          host_id: string
          id?: string
          language?: string
          max_players?: number
          mode?: Database["public"]["Enums"]["room_mode"]
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          host_id?: string
          id?: string
          language?: string
          max_players?: number
          mode?: Database["public"]["Enums"]["room_mode"]
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: []
      }
      rounds: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          match_id: string
          phase: Database["public"]["Enums"]["round_phase"]
          round_number: number
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          match_id: string
          phase?: Database["public"]["Enums"]["round_phase"]
          round_number?: number
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          match_id?: string
          phase?: Database["public"]["Enums"]["round_phase"]
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "rounds_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      sanctions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          reason: string | null
          type: Database["public"]["Enums"]["sanction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          type?: Database["public"]["Enums"]["sanction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          type?: Database["public"]["Enums"]["sanction_type"]
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_completed: boolean
          round_id: string
          task_type: string
          zone: number
        }
        Insert: {
          assigned_to?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          round_id: string
          task_type?: string
          zone: number
        }
        Update: {
          assigned_to?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          round_id?: string
          task_type?: string
          zone?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          round_id: string
          target_id: string | null
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_id: string
          target_id?: string | null
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_id?: string
          target_id?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      friendship_status: "pending" | "accepted" | "blocked"
      match_status: "in_progress" | "finished"
      match_winner: "agents" | "saboteur"
      player_role: "agent" | "saboteur"
      room_mode: "quick" | "friends"
      room_status: "waiting" | "playing" | "finished"
      round_phase: "action" | "meeting" | "voting"
      sanction_type: "ban_24h" | "warning"
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
  public: {
    Enums: {
      friendship_status: ["pending", "accepted", "blocked"],
      match_status: ["in_progress", "finished"],
      match_winner: ["agents", "saboteur"],
      player_role: ["agent", "saboteur"],
      room_mode: ["quick", "friends"],
      room_status: ["waiting", "playing", "finished"],
      round_phase: ["action", "meeting", "voting"],
      sanction_type: ["ban_24h", "warning"],
    },
  },
} as const
