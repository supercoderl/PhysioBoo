namespace PhysioBoo.Application.ViewModels.MedicalServices
{
    public sealed record MedicalServiceFilter(
        List<Guid>? DepartmentIds,
        List<Guid>? DoctorIds,
        List<string>? Status,
        List<string>? Availability,
        decimal? PriceMin,
        decimal? PriceMax,
        int? DurationMin,
        int? DurationMax
    );
}
