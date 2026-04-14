export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}
