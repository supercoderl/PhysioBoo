namespace PhysioBoo.Application.ViewModels.HomeContent
{
    /// <summary>
    /// Body for create (POST) and update (PATCH). On update, null fields are left unchanged.
    /// </summary>
    public sealed record SaveHomeTestimonialViewModel(
        string? PatientName,
        int? Rating,
        string? Comment,
        DateTime? Date,
        bool? Active
    );
}
