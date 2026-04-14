export interface Budget {
  id?: string;
  category_id: string;
  limit: number;
  spent: number;
  month: string;
  year: number;
  created_at?: string;
  updated_at?: string;
}
