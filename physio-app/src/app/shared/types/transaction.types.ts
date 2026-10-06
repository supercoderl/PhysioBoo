/** Mirrors server PhysioBoo.Application.ViewModels.Members.PointTransactionViewModel. */
export interface PointTransaction {
  id: string;
  code: string;
  type: 'earned' | 'redeemed';
  /** Always positive; `type` gives the sign. */
  points: number;
  balanceAfter: number;
  description: string;
  rewardId: string | null;
  rewardTitle: string | null;
  date: string;
}
