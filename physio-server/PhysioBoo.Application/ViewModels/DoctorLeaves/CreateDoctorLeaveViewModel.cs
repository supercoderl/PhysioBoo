using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.DoctorLeaves
{
    public sealed record CreateDoctorLeaveViewModel
    (
         Guid Id,
         Guid DoctorId,
         LeaveType LeaveType,
         DateOnly StartDate,
         DateOnly EndDate,
         TimeOnly? StartTime,
         TimeOnly? EndTime,
         decimal TotalDays,
         string? Reason,
         Guid? ApprovedBy,
         DateTime? ApprovedAt,
         Guid? SubstituteDoctorId,
         string? EmergencyContact,
         string? DocumentsUrl
    );
}
