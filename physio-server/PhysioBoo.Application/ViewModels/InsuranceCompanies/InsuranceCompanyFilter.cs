namespace PhysioBoo.Application.ViewModels.InsuranceCompanies
{
    /// <summary>
    /// Represents filter criteria when querying insurance companies.
    /// </summary>
    public sealed record InsuranceCompanyFilter
    (
        string Start,
        string End
    );
}
