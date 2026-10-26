/** The server sends and accepts lead statuses by name. */
export enum LeadStatus {
    New = 'New',
    Contacted = 'Contacted',
    Qualified = 'Qualified',
    Converted = 'Converted',
    Lost = 'Lost',
}

/** The server sends and accepts lead priorities by name. */
export enum LeadPriority {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}
