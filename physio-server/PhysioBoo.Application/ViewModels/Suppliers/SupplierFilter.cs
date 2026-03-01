namespace PhysioBoo.Application.ViewModels.Suppliers
{
    /// <summary>
    /// Represents filter criteria when querying suppliers.
    /// </summary>
    public sealed record SupplierFilter
    (
        string Start,
        string End
    );
}
