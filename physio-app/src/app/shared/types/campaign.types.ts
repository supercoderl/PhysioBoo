import { CampaignStatus, CampaignType } from "../enums/campaign";

export interface Campaign {
  id: string;
  code: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  audienceSegmentId: string | null;
  audienceSegmentName: string | null;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number;
  spent: number;
  reach: number;
  conversions: number;
  description: string | null;
  createdBy: string | null;
  createdDate: string | null;
}

export interface CreateCampaignRequest {
  name: string;
  type: CampaignType;
  audienceSegmentId: string | null;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  description: string | null;
}

export interface UpdateCampaignRequest {
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  audienceSegmentId: string | null;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  spent: number | null;
  description: string | null;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalConversions: number;
}
