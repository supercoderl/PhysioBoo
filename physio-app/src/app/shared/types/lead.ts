export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'high' | 'medium' | 'low';
  source: string;
  assignedTo: string;
  notes: string;
  createdAt: Date;
}