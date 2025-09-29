using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.DoctorPublications
{
    public sealed record CreateDoctorPublicationViewModel
    (
        Guid Id,
        Guid DoctorId,
        string Title,
        PublicationType PublicationType,
        string? JournalName,
        string? ConferenceName,
        string? Publisher,
        DateOnly? PublicationDate,
        string? Volume,
        string? Issue,
        string? Pages,
        string? Doi,
        string? Pmid,
        string? Isbm,
        decimal? ImpactFactor,
        string? CoAuthors,
        string? @Abstract,
        string[] Keywords,
        bool IsPeerReviewed,
        string? PublicationUrl,
        string? PdfUrl
    );
}
