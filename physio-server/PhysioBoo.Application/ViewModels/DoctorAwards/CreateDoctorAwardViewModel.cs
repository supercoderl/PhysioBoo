namespace PhysioBoo.Application.ViewModels.DoctorAwards
{
    public sealed record CreateDoctorAwardViewModel
    (
        Guid Id,
        Guid DoctorId,
        string AwardName,
        string? AwardCategory,
        string AwardingOrganization,
        string? AwardLevel,
        DateOnly? AwardDate,
        int? AwardYear,
        string? Description,
        decimal? MonetaryValue,
        string? CertificateUrl,
        string? MediaCoverageUrl
    );
}
