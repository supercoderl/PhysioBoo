export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  reason: string;
}