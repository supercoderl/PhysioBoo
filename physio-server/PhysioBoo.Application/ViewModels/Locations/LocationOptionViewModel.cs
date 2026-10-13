namespace PhysioBoo.Application.ViewModels.Locations
{
    /// <summary>One entry of a location level (country, city, district or ward) as the address picker consumes it.</summary>
    public sealed record LocationOptionViewModel(
        Guid Id,
        string Name,
        string? Code
    );
}
