using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed class BedViewModel
    {
        public Guid Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public string? RoomNumber { get; set; }
        public Guid WardId { get; set; }
        public string? WardName { get; set; }
        public int Floor { get; set; }
        public string BedType { get; set; } = string.Empty;     // "Standard", "ICU", "Surgical Recovery"
        public string Status { get; set; } = string.Empty;      // "Available", "Occupied", ...
        public bool IsolationRequired { get; set; }
        public Guid? PatientId { get; set; }
        public string? PatientName { get; set; }
        public string? PatientNumber { get; set; }
        public DateTime? AdmissionDate { get; set; }
        public DateTime? ExpectedDischargeDate { get; set; }
        public string? Notes { get; set; }

        public static BedViewModel FromEntity(Bed entity)
        {
            BedAssignment? stay = entity.CurrentAssignment;

            return new BedViewModel
            {
                Id = entity.Id,
                Number = entity.Number,
                RoomNumber = entity.RoomNumber,
                WardId = entity.WardId,
                WardName = entity.Ward?.Name,
                Floor = entity.Floor,
                BedType = BedTypeText.ToText(entity.BedType),
                Status = entity.Status.ToString(),
                IsolationRequired = entity.IsolationRequired,
                PatientId = stay?.PatientId,
                PatientName = stay?.Patient?.Profile?.FullName,
                PatientNumber = stay?.Patient?.PatientNumber,
                AdmissionDate = stay?.AdmittedAt,
                ExpectedDischargeDate = stay?.ExpectedDischargeDate,
                Notes = stay?.Notes ?? entity.Notes
            };
        }
    }
}
