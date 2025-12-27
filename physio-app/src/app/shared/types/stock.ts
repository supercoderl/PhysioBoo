export interface StockItem {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  location: string;
  batchNo: string;
  expiryDate: string;
  status: 'pending' | 'counted' | 'verified' | 'discrepancy';
  lastUpdated?: string;
}

export interface StockTakeSession {
  id: string;
  startDate: string;
  completedItems: number;
  totalItems: number;
  status: 'in-progress' | 'completed' | 'paused';
  performedBy: string;
}