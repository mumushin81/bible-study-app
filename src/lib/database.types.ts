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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          category: string
          category_emoji: string | null
          created_at: string | null
          english_name: string
          id: string
          name: string
          testament: string | null
          total_chapters: number
        }
        Insert: {
          category: string
          category_emoji?: string | null
          created_at?: string | null
          english_name: string
          id: string
          name: string
          testament?: string | null
          total_chapters: number
        }
        Update: {
          category?: string
          category_emoji?: string | null
          created_at?: string | null
          english_name?: string
          id?: string
          name?: string
          testament?: string | null
          total_chapters?: number
        }
        Relationships: []
      }
      commentaries: {
        Row: {
          created_at: string | null
          id: string
          intro: string
          updated_at: string | null
          verse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intro: string
          updated_at?: string | null
          verse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intro?: string
          updated_at?: string | null
          verse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentaries_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: true
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      commentary_conclusions: {
        Row: {
          commentary_id: string | null
          content: string
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          commentary_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          commentary_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "commentary_conclusions_commentary_id_fkey"
            columns: ["commentary_id"]
            isOneToOne: true
            referencedRelation: "commentaries"
            referencedColumns: ["id"]
          },
        ]
      }
      commentary_sections: {
        Row: {
          color: string | null
          commentary_id: string | null
          created_at: string | null
          description: string
          emoji: string
          id: string
          points: Json
          position: number
          title: string
        }
        Insert: {
          color?: string | null
          commentary_id?: string | null
          created_at?: string | null
          description: string
          emoji: string
          id?: string
          points: Json
          position: number
          title: string
        }
        Update: {
          color?: string | null
          commentary_id?: string | null
          created_at?: string | null
          description?: string
          emoji?: string
          id?: string
          points?: Json
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "commentary_sections_commentary_id_fkey"
            columns: ["commentary_id"]
            isOneToOne: false
            referencedRelation: "commentaries"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answered_at: string | null
          correct: boolean
          exp_earned: number | null
          id: string
          points_earned: number | null
          question_id: string
          user_id: string | null
          verse_id: string
        }
        Insert: {
          answered_at?: string | null
          correct: boolean
          exp_earned?: number | null
          id?: string
          points_earned?: number | null
          question_id: string
          user_id?: string | null
          verse_id: string
        }
        Update: {
          answered_at?: string | null
          correct?: boolean
          exp_earned?: number | null
          id?: string
          points_earned?: number | null
          question_id?: string
          user_id?: string | null
          verse_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          note: string | null
          user_id: string | null
          verse_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
          verse_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
          verse_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          verse_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          verse_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          verse_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          level: number | null
          total_exp: number | null
          total_points: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          level?: number | null
          total_exp?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          level?: number | null
          total_exp?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_reviewed_at: string | null
          review_count: number | null
          updated_at: string | null
          user_id: string | null
          verse_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          review_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verse_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          review_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verse_id?: string
        }
        Relationships: []
      }
      user_word_bookmarks: {
        Row: {
          id: string
          user_id: string
          word_hebrew: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          word_hebrew: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          word_hebrew?: string
          created_at?: string | null
        }
        Relationships: []
      }
      user_word_progress: {
        Row: {
          id: string
          user_id: string
          word_hebrew: string
          next_review: string
          interval_days: number
          ease_factor: number
          review_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          word_hebrew: string
          next_review?: string
          interval_days?: number
          ease_factor?: number
          review_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          word_hebrew?: string
          next_review?: string
          interval_days?: number
          ease_factor?: number
          review_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verses: {
        Row: {
          book_id: string | null
          chapter: number
          created_at: string | null
          hebrew: string
          id: string
          ipa: string
          korean_pronunciation: string
          literal: string | null
          modern: string
          reference: string
          translation: string | null
          updated_at: string | null
          verse_number: number
        }
        Insert: {
          book_id?: string | null
          chapter: number
          created_at?: string | null
          hebrew: string
          id: string
          ipa: string
          korean_pronunciation: string
          literal?: string | null
          modern: string
          reference: string
          translation?: string | null
          updated_at?: string | null
          verse_number: number
        }
        Update: {
          book_id?: string | null
          chapter?: number
          created_at?: string | null
          hebrew?: string
          id?: string
          ipa?: string
          korean_pronunciation?: string
          literal?: string | null
          modern?: string
          reference?: string
          translation?: string | null
          updated_at?: string | null
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "verses_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      why_questions: {
        Row: {
          answer: string
          bible_references: Json
          commentary_id: string | null
          created_at: string | null
          id: string
          question: string
        }
        Insert: {
          answer: string
          bible_references: Json
          commentary_id?: string | null
          created_at?: string | null
          id?: string
          question: string
        }
        Update: {
          answer?: string
          bible_references?: Json
          commentary_id?: string | null
          created_at?: string | null
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "why_questions_commentary_id_fkey"
            columns: ["commentary_id"]
            isOneToOne: true
            referencedRelation: "commentaries"
            referencedColumns: ["id"]
          },
        ]
      }
      word_relations: {
        Row: {
          created_at: string | null
          id: string
          related_word: string
          word_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          related_word: string
          word_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          related_word?: string
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_relations_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          category: string | null
          created_at: string | null
          emoji: string | null
          grammar: string
          hebrew: string
          icon_svg: string | null
          icon_url: string | null  // ✨ 추가
          id: string
          ipa: string
          korean: string
          letters: string | null
          meaning: string
          position: number
          root: string
          structure: string | null
          verse_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          emoji?: string | null
          grammar: string
          hebrew: string
          icon_svg?: string | null
          icon_url?: string | null  // ✨ 추가
          id?: string
          ipa: string
          korean: string
          letters?: string | null
          meaning: string
          position: number
          root: string
          structure?: string | null
          verse_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          emoji?: string | null
          grammar?: string
          hebrew?: string
          icon_svg?: string | null
          icon_url?: string | null  // ✨ 추가
          id?: string
          ipa?: string
          korean?: string
          letters?: string | null
          meaning?: string
          position?: number
          root?: string
          structure?: string | null
          verse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "words_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "verses"
            referencedColumns: ["id"]
          },
        ]
      }
      hebrew_roots: {
        Row: {
          id: string
          root: string
          root_hebrew: string
          core_meaning: string
          core_meaning_korean: string
          semantic_field: string | null
          frequency: number | null
          importance: number | null
          mnemonic: string | null
          pronunciation: string | null
          story: string | null
          emoji: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          root: string
          root_hebrew: string
          core_meaning: string
          core_meaning_korean: string
          semantic_field?: string | null
          frequency?: number | null
          importance?: number | null
          mnemonic?: string | null
          pronunciation?: string | null
          story?: string | null
          emoji?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          root?: string
          root_hebrew?: string
          core_meaning?: string
          core_meaning_korean?: string
          semantic_field?: string | null
          frequency?: number | null
          importance?: number | null
          mnemonic?: string | null
          pronunciation?: string | null
          story?: string | null
          emoji?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_book_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          total_words: number | null
          learned_words: number | null
          mastered_words: number | null
          progress_percentage: number | null
          daily_goal: number | null
          current_streak: number | null
          longest_streak: number | null
          started_at: string | null
          last_studied_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          total_words?: number | null
          learned_words?: number | null
          mastered_words?: number | null
          progress_percentage?: number | null
          daily_goal?: number | null
          current_streak?: number | null
          longest_streak?: number | null
          started_at?: string | null
          last_studied_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          total_words?: number | null
          learned_words?: number | null
          mastered_words?: number | null
          progress_percentage?: number | null
          daily_goal?: number | null
          current_streak?: number | null
          longest_streak?: number | null
          started_at?: string | null
          last_studied_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_word_progress_v2: {
        Row: {
          id: string
          user_id: string
          word_hebrew: string
          next_review: string
          interval_days: number
          ease_factor: number
          review_count: number
          difficulty_level: number | null
          initial_difficulty: number | null
          correct_count: number | null
          incorrect_count: number | null
          accuracy_rate: number | null
          last_study_context: string | null
          study_methods: Json | null
          total_study_time_seconds: number | null
          average_response_time_seconds: number | null
          mastery_level: number | null
          last_level_up_at: string | null
          created_at: string | null
          updated_at: string | null
          first_studied_at: string | null
          last_reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          word_hebrew: string
          next_review: string
          interval_days?: number
          ease_factor?: number
          review_count?: number
          difficulty_level?: number | null
          initial_difficulty?: number | null
          correct_count?: number | null
          incorrect_count?: number | null
          accuracy_rate?: number | null
          last_study_context?: string | null
          study_methods?: Json | null
          total_study_time_seconds?: number | null
          average_response_time_seconds?: number | null
          mastery_level?: number | null
          last_level_up_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          first_studied_at?: string | null
          last_reviewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          word_hebrew?: string
          next_review?: string
          interval_days?: number
          ease_factor?: number
          review_count?: number
          difficulty_level?: number | null
          initial_difficulty?: number | null
          correct_count?: number | null
          incorrect_count?: number | null
          accuracy_rate?: number | null
          last_study_context?: string | null
          study_methods?: Json | null
          total_study_time_seconds?: number | null
          average_response_time_seconds?: number | null
          mastery_level?: number | null
          last_level_up_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          first_studied_at?: string | null
          last_reviewed_at?: string | null
        }
        Relationships: []
      }
      word_derivations: {
        Row: {
          id: string
          root_id: string | null
          word_id: string | null
          binyan: string | null
          pattern: string | null
          derivation_note: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          root_id?: string | null
          word_id?: string | null
          binyan?: string | null
          pattern?: string | null
          derivation_note?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          root_id?: string | null
          word_id?: string | null
          binyan?: string | null
          pattern?: string | null
          derivation_note?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_derivations_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "hebrew_roots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_derivations_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      word_metadata: {
        Row: {
          id: string
          word_hebrew: string
          bible_frequency: number | null
          genesis_frequency: number | null
          frequency_rank: number | null
          objective_difficulty: number | null
          difficulty_factors: Json | null
          theological_importance: number | null
          pedagogical_priority: number | null
          is_proper_noun: boolean | null
          is_theological_term: boolean | null
          is_common_word: boolean | null
          recommended_review_count: number | null
          min_exposures: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          word_hebrew: string
          bible_frequency?: number | null
          genesis_frequency?: number | null
          frequency_rank?: number | null
          objective_difficulty?: number | null
          difficulty_factors?: Json | null
          theological_importance?: number | null
          pedagogical_priority?: number | null
          is_proper_noun?: boolean | null
          is_theological_term?: boolean | null
          is_common_word?: boolean | null
          recommended_review_count?: number | null
          min_exposures?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          word_hebrew?: string
          bible_frequency?: number | null
          genesis_frequency?: number | null
          frequency_rank?: number | null
          objective_difficulty?: number | null
          difficulty_factors?: Json | null
          theological_importance?: number | null
          pedagogical_priority?: number | null
          is_proper_noun?: boolean | null
          is_theological_term?: boolean | null
          is_common_word?: boolean | null
          recommended_review_count?: number | null
          min_exposures?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_book_progress_percentage: {
        Args: { p_user_id: string; p_book_id: string }
        Returns: number
      }
      get_derived_word_count: {
        Args: { p_root_id: string }
        Returns: number
      }
      get_user_stats: {
        Args: { user_uuid: string }
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
    Enums: {},
  },
} as const
