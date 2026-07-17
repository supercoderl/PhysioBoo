export interface Note {
  id: string;
  time: string;
  type: 'nursing' | 'doctor' | 'general';
  content: string;
  writtenBy: string;
}