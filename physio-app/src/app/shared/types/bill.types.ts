export interface BillItem {
  id: number;
  service: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Billing {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}