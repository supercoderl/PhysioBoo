export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  expiryDate: string;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}