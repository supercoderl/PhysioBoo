export interface LabResult {
  id: number;
  date: string;
  testName: string;
  result: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  orderedBy: string;
}