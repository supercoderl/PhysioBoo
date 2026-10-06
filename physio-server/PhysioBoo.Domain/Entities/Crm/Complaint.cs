namespace PhysioBoo.Domain.Entities.Crm
{
    public class Complaint : TenantEntity
    {
        #region Core Complaint Table (13)
        public string TicketNumber { get; private set; }
        public string PatientName { get; private set; }
        public Guid? PatientId { get; private set; }
        public string Email { get; private set; }
        public string Phone { get; private set; }
        public ComplaintCategory Category { get; private set; }
        public ComplaintPriority Priority { get; private set; }
        public ComplaintStatus Status { get; private set; }
        public string Subject { get; private set; }
        public string Description { get; private set; }
        public string? AssignedTo { get; private set; }
        public DateTime? ResolvedAt { get; private set; }
        #endregion

        #region Constructor (13)
        public Complaint(
            Guid id,
            string ticketNumber,
            string patientName,
            Guid? patientId,
            string email,
            string phone,
            ComplaintCategory category,
            ComplaintPriority priority,
            string subject,
            string description,
            string? assignedTo
        ) : base(id)
        {
            TicketNumber = ticketNumber;
            PatientName = patientName;
            PatientId = patientId;
            Email = email;
            Phone = phone;
            Category = category;
            Priority = priority;
            Status = ComplaintStatus.Pending;
            Subject = subject;
            Description = description;
            AssignedTo = assignedTo;
            ResolvedAt = null;
        }
        #endregion

        #region Setter Methods (13)
        public void SetTicketNumber(string ticketNumber) { TicketNumber = ticketNumber; }
        public void SetPatientName(string patientName) { PatientName = patientName; }
        public void SetPatientId(Guid? patientId) { PatientId = patientId; }
        public void SetEmail(string email) { Email = email; }
        public void SetPhone(string phone) { Phone = phone; }
        public void SetCategory(ComplaintCategory category) { Category = category; }
        public void SetPriority(ComplaintPriority priority) { Priority = priority; }
        public void SetStatus(ComplaintStatus status) { Status = status; }
        public void SetSubject(string subject) { Subject = subject; }
        public void SetDescription(string description) { Description = description; }
        public void SetAssignedTo(string? assignedTo) { AssignedTo = assignedTo; }
        public void SetResolvedAt(DateTime? resolvedAt) { ResolvedAt = resolvedAt; }
        #endregion
    }
}
