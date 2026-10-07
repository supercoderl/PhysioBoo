namespace PhysioBoo.Application.ViewModels.HomeContent
{
    /// <summary>
    /// Body for create (POST) and update (PATCH). On update, null fields are left unchanged.
    /// </summary>
    public sealed record SaveHomeBannerViewModel(
        string? Title,
        string? Subtitle,
        string? ImageUrl,
        string? ButtonText,
        string? ButtonLink,
        int? Order,
        bool? Active
    );
}
