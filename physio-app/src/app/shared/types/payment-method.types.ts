export interface PaymentMethod {
  type: 'cash' | 'card' | 'insurance' | 'upi';
  amount: number;
}