namespace PhysioBoo.Application.ViewModels.Admissions
{
    public sealed record AdmissionFilter(
        DateTime? Start,
        DateTime? End,
        string? Status,
        string? Type,
        Guid? DepartmentId
    );
}
