/**
 * Tipos de la base de datos de Astor.
 *
 * ⚠️ Hand-authored hasta que haya un proyecto Supabase vivo. Reemplazar por
 *   `supabase gen types typescript --project-id <ID> --schema public > src/types.gen.ts`
 * y re-exportar desde acá. Mantener sincronizado con .docs/migrations/*.sql.
 *
 * Cubre: Fase 0 (profiles) + Fase 1 (categories, tasks, task_checklist_items,
 * habits, habit_logs). Las tablas de fases siguientes se agregan con su migración.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'owner' | 'user';
export type ThemePref = 'system' | 'light' | 'dark';
export type CategoryKind = 'task' | 'project';
export type TaskStatus = 'todo' | 'doing' | 'done' | 'archived';
export type TaskEisenhower =
  | 'urgent_important'
  | 'urgent_not_important'
  | 'not_urgent_important'
  | 'not_urgent_not_important';
export type TaskSource = 'app' | 'telegram' | 'api' | 'mcp';
export type HabitPeriod = 'day' | 'week' | 'month';
export type HabitLogStatus = 'done' | 'skipped';
export type RoutineKind = 'morning' | 'night' | 'custom';
export type StudyProgramKind = 'curso' | 'carrera' | 'examen' | 'otro';
export type StudyStatus = 'active' | 'paused' | 'done' | 'archived';
export type TopicStatus = 'todo' | 'learning' | 'learned';
export type ResourceKind = 'video' | 'pdf' | 'link' | 'playlist' | 'book' | 'otro';
export type AccountType = 'efectivo' | 'banco' | 'billetera' | 'tarjeta_credito' | 'tarjeta_debito' | 'usd' | 'otro';
export type FxRateType = 'oficial' | 'blue' | 'mep';
export type TransactionKind = 'expense' | 'income' | 'transfer';
export type FinanceCatKind = 'expense' | 'income';
export type TransactionSource = 'app' | 'import' | 'telegram' | 'api' | 'mcp';
export type NetWorthKind = 'asset' | 'liability';
export type InstallmentStatus = 'scheduled' | 'charged' | 'paid';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          timezone: string;
          locale: string;
          theme: ThemePref;
          role: UserRole;
          agent_enabled: boolean;
          entitlements: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          timezone?: string;
          locale?: string;
          theme?: ThemePref;
          role?: UserRole;
          agent_enabled?: boolean;
          entitlements?: Json;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          parent_id: string | null;
          kind: CategoryKind;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_id?: string | null;
          kind?: CategoryKind;
          name: string;
          color?: string | null;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          notes: string | null;
          status: TaskStatus;
          priority: number;
          eisenhower: TaskEisenhower | null;
          due_at: string | null;
          scheduled_at: string | null;
          completed_at: string | null;
          recurrence_rule: string | null;
          source: TaskSource;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          notes?: string | null;
          status?: TaskStatus;
          priority?: number;
          eisenhower?: TaskEisenhower | null;
          due_at?: string | null;
          scheduled_at?: string | null;
          completed_at?: string | null;
          recurrence_rule?: string | null;
          source?: TaskSource;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
        Relationships: [];
      };
      task_checklist_items: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          label: string;
          done: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          label: string;
          done?: boolean;
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['task_checklist_items']['Insert']>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          schedule: Json;
          target: number;
          period: HabitPeriod;
          allow_skip: boolean;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          schedule?: Json;
          target?: number;
          period?: HabitPeriod;
          allow_skip?: boolean;
          archived?: boolean;
        };
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          date: string;
          status: HabitLogStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          date: string;
          status?: HabitLogStatus;
        };
        Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>;
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: RoutineKind;
          position: number;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind?: RoutineKind;
          position?: number;
          archived?: boolean;
        };
        Update: Partial<Database['public']['Tables']['routines']['Insert']>;
        Relationships: [];
      };
      routine_items: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string;
          label: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id: string;
          label: string;
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['routine_items']['Insert']>;
        Relationships: [];
      };
      routine_completions: {
        Row: {
          id: string;
          user_id: string;
          routine_item_id: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_item_id: string;
          date: string;
        };
        Update: Partial<Database['public']['Tables']['routine_completions']['Insert']>;
        Relationships: [];
      };
      todo_sections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: { id?: string; user_id: string; name: string; position?: number };
        Update: Partial<Database['public']['Tables']['todo_sections']['Insert']>;
        Relationships: [];
      };
      todo_items: {
        Row: {
          id: string;
          user_id: string;
          section_id: string;
          label: string;
          done: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          section_id: string;
          label: string;
          done?: boolean;
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['todo_items']['Insert']>;
        Relationships: [];
      };
      study_programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          kind: StudyProgramKind;
          color: string | null;
          institution: string | null;
          status: StudyStatus;
          target_date: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          kind?: StudyProgramKind;
          color?: string | null;
          institution?: string | null;
          status?: StudyStatus;
          target_date?: string | null;
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['study_programs']['Insert']>;
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          program_id: string | null;
          name: string;
          color: string | null;
          status: StudyStatus;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id?: string | null;
          name: string;
          color?: string | null;
          status?: StudyStatus;
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>;
        Relationships: [];
      };
      study_topics: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          title: string;
          status: TopicStatus;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          title: string;
          status?: TopicStatus;
          position?: number;
        };
        Update: Partial<Database['public']['Tables']['study_topics']['Insert']>;
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          topic_id: string | null;
          minutes: number;
          note: string | null;
          occurred_on: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          topic_id?: string | null;
          minutes: number;
          note?: string | null;
          occurred_on?: string;
        };
        Update: Partial<Database['public']['Tables']['study_sessions']['Insert']>;
        Relationships: [];
      };
      study_resources: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          program_id: string | null;
          title: string;
          url: string | null;
          kind: ResourceKind;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          program_id?: string | null;
          title: string;
          url?: string | null;
          kind?: ResourceKind;
        };
        Update: Partial<Database['public']['Tables']['study_resources']['Insert']>;
        Relationships: [];
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          subject_id: string | null;
          started_at: string;
          duration: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          subject_id?: string | null;
          started_at?: string;
          duration: number;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['focus_sessions']['Insert']>;
        Relationships: [];
      };
      currencies: {
        Row: { id: string; user_id: string; code: string; symbol: string | null; decimals: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; code: string; symbol?: string | null; decimals?: number };
        Update: Partial<Database['public']['Tables']['currencies']['Insert']>;
        Relationships: [];
      };
      fx_rates: {
        Row: { id: string; user_id: string; base: string; quote: string; rate: number; rate_type: FxRateType; source: string | null; as_of: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; base: string; quote: string; rate: number; rate_type?: FxRateType; source?: string | null; as_of?: string };
        Update: Partial<Database['public']['Tables']['fx_rates']['Insert']>;
        Relationships: [];
      };
      finance_categories: {
        Row: { id: string; user_id: string; name: string; kind: FinanceCatKind; color: string | null; position: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name: string; kind?: FinanceCatKind; color?: string | null; position?: number };
        Update: Partial<Database['public']['Tables']['finance_categories']['Insert']>;
        Relationships: [];
      };
      accounts: {
        Row: { id: string; user_id: string; name: string; type: AccountType; currency: string; opening_balance: number; position: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name: string; type?: AccountType; currency?: string; opening_balance?: number; position?: number };
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string; user_id: string; description: string; amount: number; currency: string;
          fx_rate: number | null; category_id: string | null; account_id: string | null;
          occurred_on: string; kind: TransactionKind; note: string | null; source: TransactionSource;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; description: string; amount: number; currency?: string;
          fx_rate?: number | null; category_id?: string | null; account_id?: string | null;
          occurred_on?: string; kind?: TransactionKind; note?: string | null; source?: TransactionSource;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
        Relationships: [];
      };
      net_worth_items: {
        Row: {
          id: string; user_id: string; kind: NetWorthKind; group_name: string; name: string;
          amount: number; currency: string; position: number; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; kind: NetWorthKind; group_name?: string; name: string;
          amount?: number; currency?: string; position?: number;
        };
        Update: Partial<Database['public']['Tables']['net_worth_items']['Insert']>;
        Relationships: [];
      };
      credit_cards: {
        Row: { id: string; user_id: string; name: string; brand: string | null; bank: string | null; account_id: string | null; closing_day: number; due_day: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name: string; brand?: string | null; bank?: string | null; account_id?: string | null; closing_day: number; due_day: number };
        Update: Partial<Database['public']['Tables']['credit_cards']['Insert']>;
        Relationships: [];
      };
      card_invoices: {
        Row: { id: string; user_id: string; credit_card_id: string; period: string; closing_date: string; due_date: string; total: number; paid: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; credit_card_id: string; period: string; closing_date: string; due_date: string; total?: number; paid?: boolean };
        Update: Partial<Database['public']['Tables']['card_invoices']['Insert']>;
        Relationships: [];
      };
      installment_plans: {
        Row: { id: string; user_id: string; credit_card_id: string | null; description: string; total_amount: number; currency: string; installments_count: number; first_charge_date: string; interest_rate: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; credit_card_id?: string | null; description: string; total_amount: number; currency?: string; installments_count: number; first_charge_date: string; interest_rate?: number };
        Update: Partial<Database['public']['Tables']['installment_plans']['Insert']>;
        Relationships: [];
      };
      installments: {
        Row: { id: string; user_id: string; plan_id: string; number: number; amount: number; card_invoice_id: string | null; status: InstallmentStatus; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; plan_id: string; number: number; amount: number; card_invoice_id?: string | null; status?: InstallmentStatus };
        Update: Partial<Database['public']['Tables']['installments']['Insert']>;
        Relationships: [];
      };
      economic_rates: {
        Row: { id: string; user_id: string; kind: string; value: number; source: string | null; as_of: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; kind: string; value: number; source?: string | null; as_of?: string };
        Update: Partial<Database['public']['Tables']['economic_rates']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    CompositeTypes: Record<never, never>;
    Enums: {
      user_role: UserRole;
      theme_pref: ThemePref;
      category_kind: CategoryKind;
      task_status: TaskStatus;
      task_eisenhower: TaskEisenhower;
      task_source: TaskSource;
      habit_period: HabitPeriod;
      habit_log_status: HabitLogStatus;
      routine_kind: RoutineKind;
      study_program_kind: StudyProgramKind;
      study_status: StudyStatus;
      topic_status: TopicStatus;
      resource_kind: ResourceKind;
      account_type: AccountType;
      fx_rate_type: FxRateType;
      transaction_kind: TransactionKind;
      finance_cat_kind: FinanceCatKind;
      transaction_source: TransactionSource;
      net_worth_kind: NetWorthKind;
      installment_status: InstallmentStatus;
    };
  };
}

/** Helpers de acceso a filas por tabla. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
