namespace PhysioBoo.Application.ViewModels.Addresses
{
    /// <summary>
    /// Represents filter criteria when querying addresses.
    /// </summary>
    public sealed record AddressFilter
    (
        string? City,
        Guid? UserId
    );
}
