using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Application.ViewModels.Leads
{
    public sealed class LeadViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Service { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string? AssignedTo { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }

        public static LeadViewModel FromEntity(Lead entity)
        {
            return new LeadViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Phone = entity.Phone,
                Email = entity.Email,
                Service = entity.Service,
                Source = entity.Source,
                Status = entity.Status.ToString(),
                Priority = entity.Priority.ToString(),
                AssignedTo = entity.AssignedTo,
                Notes = entity.Notes,
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
