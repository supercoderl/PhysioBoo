

namespace PhysioBoo.Application.Queries.RetailCarts.CheckCartWarnings
{
    public sealed record CheckCartWarningsQuery(Guid? PatientId, List<Guid> MedicineIds) : IRequest<List<string>>;
}
