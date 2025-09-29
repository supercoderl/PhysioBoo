using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.DoctorWorkExperiences
{
    public sealed record CreateDoctorWorkExperienceViewModel
    (
        Guid Id,
        Guid DoctorId,
        string PositionTitle,
        EmployeeType EmploymentType,
        string OrganizationName,
        string? OrganizationType,
        string? Department,
        string? Location,
        string? Country,
        DateOnly StartDate,
        DateOnly? EndDate,
        string? Responsibilities,
        string? Archievements,
        string? SalaryRange,
        string? ReasonForLeaving,
        string? SupervisorName,
        string? SupervisorContact
    );
}
