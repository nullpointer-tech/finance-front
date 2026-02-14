// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  is_admin: boolean;
}

// Transaction types (matching your backend)
export interface Transaction {
  _id: string;
  org_id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string;
  product_id: string;
  note?: string;
  quantity?: number;
  created_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  purchase_date?: string;
}

export interface TransactionCreate {
  amount: number;
  type: 'income' | 'expense';
  category_name: string;
  product_name: string;
  purchase_date?: string;
  note?: string;
}

export interface TransactionResponse {
  message: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  org_id: string;
  created_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  updated_at?: string | null;
}

export interface CategoryCreate {
  name: string;
}

export interface CategoryResponse {
  message: string;
  affected_transactions?: number;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  org_id: string;
  created_at: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  updated_at?: string | null;
  category_id?: string;
}

export interface ProductCreate {
  name: string;
  category_id?: string;
}

export interface ProductResponse {
  message: string;
  affected_transactions?: number;
}

// Wallet types
export interface Wallet {
  _id: string;
  org_id: string;
  created_at: string;
  amount: number;
  updated_at: string;
}

// Summary/Report types (calculated from transactions)
export interface Summary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  wallet_balance: number;
  expense_by_category: CategoryExpense[];
}

export interface CategoryExpense {
  category_id: string;
  category_name: string;
  total: number;
  percentage: number;
}

// Date range
export interface DateRange {
  start_date: string;
  end_date: string;
}

// Transaction with names (for display)
export interface TransactionWithNames extends Transaction {
  category_name?: string;
  product_name?: string;
}