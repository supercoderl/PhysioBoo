export interface Role {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    isSystemRole: boolean;
    isActive: boolean;
    createdAt: Date;
    createdBt: string;
    updatedAt?: Date | null;
    updatedBy?: string | null;
}