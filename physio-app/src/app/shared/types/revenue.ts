export interface RevenueData {
  date: string;
  cashPayments: number;
  cardPayments: number;
  insurancePayments: number;
  upiPayments: number;
  total: number;
}

export interface DepartmentRevenue {
  name: string;
  revenue: number;
  patients: number;
  percentage: number;
}