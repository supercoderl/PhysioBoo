import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "../enums/complaint";

export interface Complaint {
    id: string;
    ticketNumber: string;
    patientName: string;
    patientId: string | null;
    email: string;
    phone: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    subject: string;
    description: string;
    assignedTo: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    resolvedAt: Date | null;
}

export interface ComplaintStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
}

export interface CreateComplaintRequest {
    patientName: string;
    patientId: string | null;
    email: string;
    phone: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    subject: string;
    description: string;
    assignedTo: string | null;
}

export interface UpdateComplaintRequest {
    patientName: string;
    patientId: string | null;
    email: string;
    phone: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    subject: string;
    description: string;
    assignedTo: string | null;
}
