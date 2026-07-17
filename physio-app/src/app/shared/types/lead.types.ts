import { LeadPriority, LeadStatus } from "../enums/lead";

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    service: string;
    status: LeadStatus;
    priority: LeadPriority;
    source: string;
    assignedTo: string | null;
    notes: string | null;
    createdAt: Date;
}

export interface LeadStats {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
}

export interface CreateLeadRequest {
    name: string;
    phone: string;
    email: string;
    service: string;
    status: LeadStatus;
    priority: LeadPriority;
    source: string;
    assignedTo: string | null;
    notes: string | null;
}

export interface UpdateLeadRequest {
    name: string;
    phone: string;
    email: string;
    service: string;
    status: LeadStatus;
    priority: LeadPriority;
    source: string;
    assignedTo: string | null;
    notes: string | null;
}
