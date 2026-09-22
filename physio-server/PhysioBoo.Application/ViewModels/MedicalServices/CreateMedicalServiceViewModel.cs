namespace PhysioBoo.Application.ViewModels.MedicalServices
{
    public sealed record CreateMedicalServiceViewModel
    (
        string Code,
        string Name,
        string? ShortName,
        string? Description,
        List<Guid>? DepartmentIds,
        Guid? CategoryId,
        List<string>? Tags,
        string Status,
        string Availability,
        decimal BasePrice,
        string Currency,
        bool VatIncluded,
        int DurationMinutes,
        bool RequiresAppointment,
        bool RequiresReferral,
        Guid? PrimaryDoctorId,
        List<Guid>? DoctorIds,
        Guid? HospitalId
    );
}
