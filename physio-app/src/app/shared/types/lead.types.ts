import { LeadPriority, LeadStatus } from "../enums/lead";

export interface Lead {
    id: string;
    name: string;
    phone: string;
    /** Can be empty for leads sent from the public website. */
    email: string;
    /** Free text, e.g. "Physiotherapy" or "Contact form: Billing". */
    service: string;
    status: LeadStatus;
    priority: LeadPriority;
    /** Free text, e.g. "Website". */
    source: string;
    /** Free-text name of the staff member following the lead up. */
    assignedTo: string | null;
    notes: string | null;
    /** ISO timestamp. */
    createdAt: string;
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

/** The update replaces every field. */
export type UpdateLeadRequest = CreateLeadRequest;
