using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.HospitalStaffs
{
    public sealed record CreateHospitalStaffViewModel
    (
        Guid Id,
        string EmployeeId,
        Guid HospitalId,
        Guid DepartmentId,
        StaffType StaffType,
        string? Position,
        EmploymentType EmploymentType,
        decimal? Salary,
        decimal? HourlyRate,
        DateOnly? ProbationEndDate,
        DateOnly? TerminationDate,
        string? ShiftPattern,
        Guid? ReportingManger,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? BloodGroup,
        DateOnly? MedicalFitnessExpiry,
        string? BankAccountDetails,
        string? PanNumber,
        string? EsiNumber,
        string? PfNumber
    );
}
