export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'multi-channel';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  reach: number;
  conversions: number;
  description: string;
  createdBy: string;
  createdDate: string;
}