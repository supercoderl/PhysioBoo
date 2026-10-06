export type MembershipTier = 'Basic' | 'Silver' | 'Gold' | 'Platinum';
export type MemberStatus = 'active' | 'inactive' | 'suspended';

/** Mirrors server PhysioBoo.Application.ViewModels.Members.MemberViewModel. */
export interface Member {
  id: string;
  memberNumber: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  membershipType: MembershipTier;
  points: number;
  joinDate: string;
  status: MemberStatus;
  lastVisit: string | null;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  pointsDistributedThisMonth: number;
  rewardsRedeemedThisMonth: number;
}

export interface EnrollMemberRequest {
  patientId: string;
  tier: MembershipTier;
}

export interface UpdateMemberRequest {
  tier: MembershipTier;
  status: MemberStatus;
}

export interface AddPointsRequest {
  points: number;
  description: string;
}

export interface RedeemPointsRequest {
  rewardId: string;
  description: string | null;
}
