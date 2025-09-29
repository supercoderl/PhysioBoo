using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.DoctorSchedules
{
    public sealed record CreateDoctorScheduleViewModel
    (
        Guid Id,
        Guid DoctorId,
        Guid HospitalId,
        Guid DepartmentId,
        int DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime,
        TimeOnly? BreakStartTime,
        TimeOnly? BreakEndTime,
        ScheduleType ScheduleType,
        DateTime? EffectiveTo,
        decimal ConsultationFee,
        string? Notes
    );
}
