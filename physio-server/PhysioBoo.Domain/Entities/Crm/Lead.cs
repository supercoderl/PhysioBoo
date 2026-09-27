namespace PhysioBoo.Domain.Entities.Crm
{
    public class Lead : TenantEntity
    {
        #region Core Lead Table (9)
        public string Name { get; private set; }
        public string Phone { get; private set; }
        public string Email { get; private set; }
        public string Service { get; private set; }
        public string Source { get; private set; }
        public LeadStatus Status { get; private set; }
        public LeadPriority Priority { get; private set; }
        public string? AssignedTo { get; private set; }
        public string? Notes { get; private set; }
        #endregion

        #region Constructor (9)
        public Lead(
            Guid id,
            string name,
            string phone,
            string email,
            string service,
            string source,
            LeadStatus status,
            LeadPriority priority,
            string? assignedTo,
            string? notes
        ) : base(id)
        {
            Name = name;
            Phone = phone;
            Email = email;
            Service = service;
            Source = source;
            Status = status;
            Priority = priority;
            AssignedTo = assignedTo;
            Notes = notes;
        }
        #endregion

        #region Setter Methods (9)
        public void SetName(string name) { Name = name; }
        public void SetPhone(string phone) { Phone = phone; }
        public void SetEmail(string email) { Email = email; }
        public void SetService(string service) { Service = service; }
        public void SetSource(string source) { Source = source; }
        public void SetStatus(LeadStatus status) { Status = status; }
        public void SetPriority(LeadPriority priority) { Priority = priority; }
        public void SetAssignedTo(string? assignedTo) { AssignedTo = assignedTo; }
        public void SetNotes(string? notes) { Notes = notes; }
        #endregion
    }
}
