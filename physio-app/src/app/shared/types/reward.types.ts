export type RewardCategory = 'discount' | 'service' | 'product' | 'voucher';

/** Mirrors server PhysioBoo.Application.ViewModels.Rewards.RewardViewModel. */
export interface Reward {
  id: string;
  code: string;
  title: string;
  description: string | null;
  pointsRequired: number;
  category: RewardCategory;
  available: boolean;
}

export interface CreateRewardRequest {
  title: string;
  description: string | null;
  pointsRequired: number;
  category: RewardCategory;
}

export interface UpdateRewardRequest extends CreateRewardRequest {
  available: boolean;
}
