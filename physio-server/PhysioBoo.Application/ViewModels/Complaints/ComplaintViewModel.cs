using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Complaints
{
    public sealed class ComplaintViewModel
    {
        public Guid Id { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public Guid? PatientId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public ComplaintCategory Category { get; set; }
        public ComplaintPriority Priority { get; set; }
        public ComplaintStatus Status { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? AssignedTo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        public static ComplaintViewModel FromEntity(Complaint entity)
        {
            return new ComplaintViewModel
            {
                Id = entity.Id,
                TicketNumber = entity.TicketNumber,
                PatientName = entity.PatientName,
                PatientId = entity.PatientId,
                Email = entity.Email,
                Phone = entity.Phone,
                Category = entity.Category,
                Priority = entity.Priority,
                Status = entity.Status,
                Subject = entity.Subject,
                Description = entity.Description,
                AssignedTo = entity.AssignedTo,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                ResolvedAt = entity.ResolvedAt
            };
        }
    }
}
