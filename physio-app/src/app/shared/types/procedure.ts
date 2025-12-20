export interface Procedure {
  id: string;
  time: string;
  name: string;
  performedBy: string;
  notes: string;
  status: 'completed' | 'scheduled' | 'cancelled';
}