export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          organization_id: string
          role: 'member' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          organization_id: string
          role: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          organization_id?: string
          role?: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      account_titles: {
        Row: {
          id: string
          organization_id: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tax_categories: {
        Row: {
          id: string
          organization_id: string
          name: string
          rate: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          rate?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          organization_id: string
          name: string
          account_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          account_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          account_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          image_url: string
          receipt_date: string
          vendor: string | null
          amount: number
          account_title_id: string | null
          tax_category_id: string | null
          payment_method_id: string | null
          invoice_number: string | null
          tax_rate: number | null
          memo: string | null
          status: 'draft' | 'rejected' | 'approved' | 'exported'
          rejection_comment: string | null
          rejection_fields: string[] | null
          approved_by: string | null
          approved_at: string | null
          ai_raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          image_url: string
          receipt_date: string
          vendor?: string | null
          amount: number
          account_title_id?: string | null
          tax_category_id?: string | null
          payment_method_id?: string | null
          invoice_number?: string | null
          tax_rate?: number | null
          memo?: string | null
          status?: 'draft' | 'rejected' | 'approved' | 'exported'
          rejection_comment?: string | null
          rejection_fields?: string[] | null
          approved_by?: string | null
          approved_at?: string | null
          ai_raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          image_url?: string
          receipt_date?: string
          vendor?: string | null
          amount?: number
          account_title_id?: string | null
          tax_category_id?: string | null
          payment_method_id?: string | null
          invoice_number?: string | null
          tax_rate?: number | null
          memo?: string | null
          status?: 'draft' | 'rejected' | 'approved' | 'exported'
          rejection_comment?: string | null
          rejection_fields?: string[] | null
          approved_by?: string | null
          approved_at?: string | null
          ai_raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      export_history: {
        Row: {
          id: string
          organization_id: string
          export_month: string
          exported_by: string
          exported_at: string
          receipt_count: number
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          export_month: string
          exported_by: string
          exported_at?: string
          receipt_count: number
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          export_month?: string
          exported_by?: string
          exported_at?: string
          receipt_count?: number
          file_url?: string
          created_at?: string
        }
      }
    }
  }
}
