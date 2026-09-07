
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.LookupByBarcode
{
    public sealed record LookupByBarcodeQuery(string Code) : IRequest<RetailMedicineCardViewModel?>;
}
