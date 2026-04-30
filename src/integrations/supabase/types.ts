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
      avaliacoes: {
        Row: {
          avaliador_id: string
          candidatura_id: string
          created_at: string
          estrelas: number
          id: string
          justificativa: string | null
          pontos: number
          servico_id: string
          trabalhador_id: string
          updated_at: string
        }
        Insert: {
          avaliador_id: string
          candidatura_id: string
          created_at?: string
          estrelas: number
          id?: string
          justificativa?: string | null
          pontos?: number
          servico_id: string
          trabalhador_id: string
          updated_at?: string
        }
        Update: {
          avaliador_id?: string
          candidatura_id?: string
          created_at?: string
          estrelas?: number
          id?: string
          justificativa?: string | null
          pontos?: number
          servico_id?: string
          trabalhador_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_candidatura_id_fkey"
            columns: ["candidatura_id"]
            isOneToOne: true
            referencedRelation: "candidaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      candidaturas: {
        Row: {
          bairro: string
          cidade: string
          created_at: string
          disponibilidade: string | null
          documento_url: string
          experiencia: string | null
          id: string
          mensagem: string | null
          numero: string
          rua: string
          servico_id: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro: string
          cidade: string
          created_at?: string
          disponibilidade?: string | null
          documento_url: string
          experiencia?: string | null
          id?: string
          mensagem?: string | null
          numero: string
          rua: string
          servico_id: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string
          cidade?: string
          created_at?: string
          disponibilidade?: string | null
          documento_url?: string
          experiencia?: string | null
          id?: string
          mensagem?: string | null
          numero?: string
          rua?: string
          servico_id?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          chave_pix: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          estado: string | null
          estado_civil: string | null
          id: string
          nome_completo: string | null
          pontuacao: number
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          chave_pix?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          nome_completo?: string | null
          pontuacao?: number
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          chave_pix?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          nome_completo?: string | null
          pontuacao?: number
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean
          categoria: string | null
          cidade: string | null
          created_at: string
          created_by: string | null
          data_servico: string | null
          descricao: string | null
          estado: string | null
          horario: string | null
          id: string
          requisitos: string | null
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          cidade?: string | null
          created_at?: string
          created_by?: string | null
          data_servico?: string | null
          descricao?: string | null
          estado?: string | null
          horario?: string | null
          id?: string
          requisitos?: string | null
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          cidade?: string | null
          created_at?: string
          created_by?: string | null
          data_servico?: string | null
          descricao?: string | null
          estado?: string | null
          horario?: string | null
          id?: string
          requisitos?: string | null
          titulo?: string
          updated_at?: string
          valor?: number | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_pontos_estrelas: { Args: { _estrelas: number }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trabalhador"
      user_type: "trabalhador"
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
      app_role: ["admin", "trabalhador"],
      user_type: ["trabalhador"],
    },
  },
} as const
