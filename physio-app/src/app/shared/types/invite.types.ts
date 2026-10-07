export interface TenantInvite {
  id: string;
  email: string | null;
  intendedRole: string;
  invitedAt: string;
  expiresAt: string;
}

export interface CreateInviteRequest {
  email: string;
  intendedRole: string;
  hospitalId?: string | null;
}
