namespace PhysioBoo.Application.ViewModels.HomeContent
{
    /// <summary>
    /// Body for create (POST) and update (PATCH). On update, null fields are left unchanged.
    /// </summary>
    public sealed record SaveHomeFeatureViewModel(
        string? Icon,
        string? Title,
        string? Description,
        int? Order,
        bool? Active
    );
}
