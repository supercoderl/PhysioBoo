using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Admissions;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing
{
    // One patient the nurse looks after: the admission (Patient -> Profile, Doctor -> User -> Profile loaded)
    // plus the nurse's assessment for the shift.
    internal sealed record NursingPatientSource(Guid Id, Admission Admission, AcuityLevel Acuity, bool FallRisk);

    // Builds the dashboard rows. Shared by the assignments and single-patient queries.
    internal static class NursingPatientBuilder
    {
        // Doses due within this window (or already overdue) count towards "MAR due".
        private static readonly TimeSpan MarDueWindow = TimeSpan.FromHours(1);

        public static async Task<List<NursingPatientViewModel>> BuildAsync(
            IReadOnlyList<NursingPatientSource> sources,
            IBedAssignmentRepository bedAssignmentRepository,
            INursingTaskRepository taskRepository,
            IMedicationAdministrationRepository medicationRepository,
            IVitalSignRepository vitalSignRepository,
            DateTime now,
            CancellationToken cancellationToken)
        {
            if (sources.Count == 0) return new List<NursingPatientViewModel>();

            List<Guid> patientIds = sources.Select(s => s.Admission.PatientId).Distinct().ToList();
            List<Guid> admissionIds = sources.Select(s => s.Admission.Id).ToList();

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(bedAssignmentRepository, admissionIds, cancellationToken);

            List<NursingTask> pendingTasks = await taskRepository
                .GetAllNoTracking(t => patientIds.Contains(t.PatientId) && t.Status == NursingTaskStatus.Pending)
                .OrderBy(t => t.DueAt)
                .ToListAsync(cancellationToken);

            DateTime dueBefore = now.Add(MarDueWindow);
            var dueCounts = await medicationRepository
                .GetAllNoTracking(m => patientIds.Contains(m.PatientId) && m.Status == AdministrationStatus.Scheduled && m.ScheduledAt <= dueBefore)
                .GroupBy(m => m.PatientId)
                .Select(g => new { PatientId = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var lastVitals = await vitalSignRepository
                .GetAllNoTracking(v => patientIds.Contains(v.PatientId))
                .GroupBy(v => v.PatientId)
                .Select(g => new { PatientId = g.Key, At = g.Max(v => v.RecordedAt) })
                .ToListAsync(cancellationToken);

            List<NursingPatientViewModel> result = new();
            foreach (NursingPatientSource source in sources)
            {
                Admission admission = source.Admission;
                stays.TryGetValue(admission.Id, out BedAssignment? stay);
                NursingTask? nextTask = pendingTasks.FirstOrDefault(t => t.PatientId == admission.PatientId);
                Profile? profile = admission.Patient?.Profile;
                Bed? bed = stay?.Bed;
                bool isolationBed = bed?.BedType == BedType.Isolation;

                result.Add(new NursingPatientViewModel
                {
                    Id = source.Id,
                    PatientId = admission.PatientId,
                    PatientName = profile?.FullName ?? string.Empty,
                    PatientNumber = admission.Patient?.PatientNumber ?? string.Empty,
                    AvatarUrl = null,
                    WardId = bed?.WardId ?? Guid.Empty,
                    WardName = bed?.Ward?.Name ?? string.Empty,
                    BedNumber = bed?.Number ?? string.Empty,
                    Age = profile == null ? 0 : AgeInYears(profile.DateOfBirth, now),
                    Gender = profile?.Gender.ToString() ?? string.Empty,
                    PrimaryDoctorName = admission.Doctor?.User?.Profile?.FullName,
                    Acuity = source.Acuity.ToString(),
                    Risk = new NursingRiskFlagsViewModel
                    {
                        FallRisk = source.FallRisk,
                        IsolationRequired = isolationBed || bed?.IsolationRequired == true,
                        IsolationType = isolationBed ? "Isolation room" : bed?.IsolationRequired == true ? "Precautions required" : null,
                        IsEmergency = admission.AdmissionType == AdmissionType.Emergency,
                        HasAllergies = !string.IsNullOrWhiteSpace(admission.Allergies)
                    },
                    NextTaskLabel = nextTask?.Label,
                    NextTaskDueAt = nextTask?.DueAt,
                    MarDueCount = dueCounts.FirstOrDefault(c => c.PatientId == admission.PatientId)?.Count ?? 0,
                    LastVitalsAt = lastVitals.FirstOrDefault(v => v.PatientId == admission.PatientId)?.At
                });
            }

            return result;
        }

        private static int AgeInYears(DateOnly dateOfBirth, DateTime now)
        {
            DateOnly today = DateOnly.FromDateTime(now);
            int age = today.Year - dateOfBirth.Year;
            if (dateOfBirth > today.AddYears(-age)) age--;
            return Math.Max(age, 0);
        }
    }
}
