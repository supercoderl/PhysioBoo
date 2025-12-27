export interface Service {
  id: number;
  name: string;
  description: string;
  department: string;
  price: number;
  duration: string;
  available: boolean;
  doctor?: string;
}