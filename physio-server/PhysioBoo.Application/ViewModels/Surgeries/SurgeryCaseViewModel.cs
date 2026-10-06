using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Surgeries
{
    public sealed class SurgicalTeamMemberViewModel
    {
        public Guid Id { get; set; }
        public Guid StaffId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Availability { get; set; } = string.Empty;

        public static SurgicalTeamMemberViewModel FromEntity(SurgeryTeamMember entity)
        {
            return new SurgicalTeamMemberViewModel
            {
                Id = entity.Id,
                StaffId = entity.StaffUserId,
                Name = entity.StaffUser?.Profile?.FullName ?? string.Empty,
                Role = entity.Role.ToString(),
                Availability = entity.Availability.ToString()
            };
        }
    }

    public sealed class SurgeryEquipmentItemViewModel
    {
        public Guid Id { get; set; }
        public Guid EquipmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Quantity { get; set; }

        public static SurgeryEquipmentItemViewModel FromEntity(SurgeryEquipmentItem entity)
        {
            return new SurgeryEquipmentItemViewModel
            {
                Id = entity.Id,
                EquipmentId = entity.Id,          // there is no equipment catalogue yet: the item is its own reference
                Name = entity.Name,
                Category = entity.Category.ToString(),
                Status = entity.Status.ToString(),
                Quantity = entity.Quantity
            };
        }
    }

    public sealed class PreOpChecklistItemViewModel
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? SignedBy { get; set; }
        public DateTime? SignedAt { get; set; }

        public static PreOpChecklistItemViewModel FromEntity(SurgeryChecklistItem entity)
        {
            return new PreOpChecklistItemViewModel
            {
                Id = entity.Id,
                Label = entity.Label,
                Status = entity.Status.ToString(),
                SignedBy = entity.SignedByName,
                SignedAt = entity.SignedAt
            };
        }
    }

    public sealed class SurgeryTimelineEventViewModel
    {
        public string Stage { get; set; } = string.Empty;
        public DateTime? OccurredAt { get; set; }
    }

    // Needs the full graph loaded (see ISurgeryCaseRepository.GetWithLinksAsync).
    public sealed class SurgeryCaseViewModel : SurgeryRowViewModel
    {
        private static readonly char[] ListSeparators = { ',', ';', '\n' };

        public string Diagnosis { get; set; } = string.Empty;
        public List<string> SurgicalHistory { get; set; } = new();
        public List<string> Allergies { get; set; } = new();
        public List<string> CurrentMedications { get; set; } = new();
        public string ConsentStatus { get; set; } = string.Empty;
        public string RiskAssessment { get; set; } = string.Empty;
        public List<SurgicalTeamMemberViewModel> Team { get; set; } = new();
        public List<SurgeryEquipmentItemViewModel> Equipment { get; set; } = new();
        public List<PreOpChecklistItemViewModel> Checklist { get; set; } = new();
        public List<SurgeryTimelineEventViewModel> Timeline { get; set; } = new();
        public string? Notes { get; set; }
        public string? Complications { get; set; }
        public int? BloodLossMl { get; set; }
        public int? EstimatedRemainingMinutes { get; set; }
        public string? PacuBay { get; set; }
        public string? RecoveryStatus { get; set; }
        public string? PostOpNotes { get; set; }
        public string? FollowUpOrders { get; set; }

        public static SurgeryCaseViewModel FromCase(SurgeryCase entity, DateTime now)
        {
            SurgeryCaseViewModel model = new()
            {
                Diagnosis = entity.Diagnosis,
                SurgicalHistory = Split(entity.Patient?.SurgicalHistory),
                Allergies = Split(entity.Patient?.AllergyInformation),
                CurrentMedications = Split(entity.Patient?.CurrentMedications),
                ConsentStatus = entity.ConsentStatus.ToString(),
                RiskAssessment = entity.RiskAssessment,
                Team = entity.Team.Select(SurgicalTeamMemberViewModel.FromEntity).ToList(),
                Equipment = entity.Equipment.Select(SurgeryEquipmentItemViewModel.FromEntity).ToList(),
                Checklist = entity.Checklist.OrderBy(i => i.SortOrder).Select(PreOpChecklistItemViewModel.FromEntity).ToList(),
                Notes = entity.Notes,
                Complications = entity.Complications,
                BloodLossMl = entity.BloodLossMl,
                EstimatedRemainingMinutes = entity.EstimatedRemainingMinutes,
                PacuBay = entity.PacuBay,
                RecoveryStatus = entity.RecoveryStatus,
                PostOpNotes = entity.PostOpNotes,
                FollowUpOrders = entity.FollowUpOrders
            };

            // Every stage is listed in order; stages not reached yet have no time.
            model.Timeline = Enum.GetValues<SurgeryTimelineStage>()
                .Select(stage => new SurgeryTimelineEventViewModel
                {
                    Stage = stage.ToString(),
                    OccurredAt = entity.Timeline.FirstOrDefault(e => e.Stage == stage)?.OccurredAt
                })
                .ToList();

            Populate(model, entity, now);
            return model;
        }

        private static List<string> Split(string? text)
        {
            return (text ?? string.Empty)
                .Split(ListSeparators, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
        }
    }
}
