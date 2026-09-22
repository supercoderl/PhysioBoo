using PhysioBoo.Domain.Entities.Operation;
using System.Text.Json;

namespace PhysioBoo.Application.ViewModels.MedicalServices
{
    public sealed class MedicalServiceViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public string? Description { get; set; }
        public string? CoverImage { get; set; }

        public List<Guid> DepartmentIds { get; set; } = new();
        public string? PrimaryDepartmentName { get; set; }
        public Guid? CategoryId { get; set; }
        public List<string> Tags { get; set; } = new();

        public string Status { get; set; } = string.Empty;
        public string Availability { get; set; } = string.Empty;

        public decimal BasePrice { get; set; }
        public string Currency { get; set; } = string.Empty;
        public bool VatIncluded { get; set; }

        public int DurationMinutes { get; set; }
        public bool RequiresAppointment { get; set; }
        public bool RequiresReferral { get; set; }

        public Guid? PrimaryDoctorId { get; set; }
        public string? PrimaryDoctorName { get; set; }
        public List<Guid> DoctorIds { get; set; } = new();
        public int DoctorCount { get; set; }
        public Guid? HospitalId { get; set; }

        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? ArchivedAt { get; set; }

        public MedicalServicePopularityViewModel Popularity { get; set; } = new();

        public static MedicalServiceViewModel FromEntity(MedicalService entity)
        {
            return new MedicalServiceViewModel
            {
                Id = entity.Id,
                Code = entity.Code,
                Name = entity.Name,
                ShortName = entity.ShortName,
                Description = entity.Description,
                CoverImage = entity.CoverImage,
                DepartmentIds = entity.Departments.Select(d => d.DepartmentId).ToList(),
                PrimaryDepartmentName = entity.Departments.FirstOrDefault()?.Department?.Name,
                CategoryId = entity.CategoryId,
                Tags = ParseTags(entity.Tags),
                Status = entity.Status.ToString(),
                Availability = entity.Availability.ToString(),
                BasePrice = entity.BasePrice,
                Currency = entity.Currency,
                VatIncluded = entity.VatIncluded,
                DurationMinutes = entity.DurationMinutes,
                RequiresAppointment = entity.RequiresAppointment,
                RequiresReferral = entity.RequiresReferral,
                PrimaryDoctorId = entity.PrimaryDoctorId,
                PrimaryDoctorName = entity.PrimaryDoctor?.User?.Profile?.FullName,
                DoctorIds = entity.Doctors.Select(d => d.DoctorId).ToList(),
                DoctorCount = entity.Doctors.Count,
                HospitalId = entity.HospitalId,
                CreatedAt = entity.CreatedAt,
                CreatedBy = entity.CreatedBy,
                UpdatedAt = entity.UpdatedAt,
                UpdatedBy = entity.UpdatedBy,
                ArchivedAt = entity.ArchivedAt
            };
        }

        public static string? SerializeTags(IEnumerable<string>? tags)
        {
            List<string> cleaned = (tags ?? Enumerable.Empty<string>())
                .Select(t => t.Trim())
                .Where(t => t.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            return cleaned.Count == 0 ? null : JsonSerializer.Serialize(cleaned);
        }

        private static List<string> ParseTags(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch (JsonException)
            {
                return new List<string>();
            }
        }
    }

    public sealed class MedicalServicePopularityViewModel
    {
        public int TotalAppointments { get; set; }
        public decimal TotalRevenue { get; set; }
        public DateTime? LastBookedAt { get; set; }
    }
}
