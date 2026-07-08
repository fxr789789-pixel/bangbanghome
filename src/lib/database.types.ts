export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          nickname: string;
          avatar_url: string | null;
          gender: "female" | "male" | "unknown";
          city: string | null;
          role: "user" | "provider" | "admin";
          realname_status: "pending" | "verified" | "rejected";
          provider_enabled: boolean;
          is_accepting_orders: boolean;
          credit_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          nickname?: string;
          avatar_url?: string | null;
          gender?: "female" | "male" | "unknown";
          city?: string | null;
          role?: "user" | "provider" | "admin";
          realname_status?: "pending" | "verified" | "rejected";
          provider_enabled?: boolean;
          is_accepting_orders?: boolean;
          credit_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          description: string;
          category: string;
          city: string;
          price_amount: number;
          price_unit: string;
          qualification_required: boolean;
          qualification_verified: boolean;
          images: string[];
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          description: string;
          category: string;
          city: string;
          price_amount: number;
          price_unit?: string;
          qualification_required?: boolean;
          qualification_verified?: boolean;
          images?: string[];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      requests: {
        Row: {
          id: string;
          customer_id: string;
          title: string;
          description: string;
          images: string[];
          service_address: string;
          city: string;
          appointment_at: string | null;
          budget_amount: number;
          preferred_gender: "female" | "male" | "unknown" | null;
          qualification_required: boolean;
          status: "open" | "matched" | "cancelled" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          title: string;
          description: string;
          images?: string[];
          service_address: string;
          city: string;
          appointment_at?: string | null;
          budget_amount: number;
          preferred_gender?: "female" | "male" | "unknown" | null;
          qualification_required?: boolean;
          status?: "open" | "matched" | "cancelled" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["requests"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "user" | "provider" | "admin";
      realname_status: "pending" | "verified" | "rejected";
      gender_type: "female" | "male" | "unknown";
      request_status: "open" | "matched" | "cancelled" | "closed";
      order_status: "pending" | "accepted" | "processing" | "completed" | "cancelled" | "dispute";
      payment_status: "pending" | "paid" | "refunded" | "failed";
      message_type: "text" | "image" | "system";
    };
    CompositeTypes: Record<string, never>;
  };
};
