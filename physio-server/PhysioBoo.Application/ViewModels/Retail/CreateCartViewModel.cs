namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed record CreateCartViewModel(
        Guid Id,
        Guid HospitalId,
        string? Name
    );
}
