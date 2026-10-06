using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Application.ViewModels.Members
{
    public sealed class MemberViewModel
    {
        public Guid Id { get; set; }
        public string MemberNumber { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string MembershipType { get; set; } = string.Empty;   // "Gold": UI compares capitalized
        public int Points { get; set; }
        public DateTime JoinDate { get; set; }
        public string Status { get; set; } = string.Empty;           // "active": UI compares lowercase
        public DateTime? LastVisit { get; set; }

        public static MemberViewModel FromEntity(MemberPoint entity)
        {
            return new MemberViewModel
            {
                Id = entity.Id,
                MemberNumber = entity.MemberNumber,
                PatientId = entity.PatientId,
                Name = entity.Patient?.Profile?.FullName ?? string.Empty,
                Email = entity.Patient?.Profile?.Email ?? string.Empty,
                Phone = entity.Patient?.Profile?.Phone ?? string.Empty,
                MembershipType = entity.Tier.ToString(),
                Points = entity.Points,
                JoinDate = entity.JoinedAt,
                Status = entity.Status.ToString().ToLowerInvariant(),
                LastVisit = entity.Patient?.LastVisitDate
            };
        }
    }
}
