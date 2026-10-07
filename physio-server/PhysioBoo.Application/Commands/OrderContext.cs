using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands
{
    /// <summary>
    /// Where a new lab or imaging order belongs: the patient's latest (not cancelled) visit gives the
    /// appointment and hospital; the ordering doctor is the signed-in doctor, else that visit's doctor.
    /// </summary>
    internal sealed record OrderContext(Guid AppointmentId, Guid HospitalId, Guid DoctorId)
    {
        public static async Task<OrderContext?> ResolveAsync(
            Guid patientId,
            IAppointmentRepository appointments,
            IDoctorRepository doctors,
            IUser user,
            CancellationToken ct)
        {
            var visit = await appointments
                .GetAllNoTracking(a => a.PatientId == patientId &&
                                       a.AppointmentStatus != AppointmentStatus.Cancelled &&
                                       a.AppointmentStatus != AppointmentStatus.NoShow)
                .OrderByDescending(a => a.ScheduledDate)
                .ThenByDescending(a => a.ScheduledTime)
                .Select(a => new { a.Id, a.HospitalId, a.DoctorId })
                .FirstOrDefaultAsync(ct);

            if (visit == null) return null;

            Domain.Entities.MedicalStaff.Doctor? me = await doctors.GetByUserIdAsync(user.GetUserId(), ct);
            return new OrderContext(visit.Id, visit.HospitalId, me?.Id ?? visit.DoctorId);
        }

        public static LabPriority ParsePriority(string? value) =>
            Enum.TryParse(value, true, out LabPriority p) && Enum.IsDefined(p) ? p : LabPriority.Routine;
    }
}
