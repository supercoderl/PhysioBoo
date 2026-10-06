using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetMedicineByBarcode
{
    /// <summary>
    /// Scanner lookup: matches the medicine barcode, QR code, drug code or a batch number.
    /// Returns null (not an error) when nothing matches.
    /// </summary>
    public sealed record GetMedicineByBarcodeQuery(string Code) : IRequest<MedicineStockViewModel?>;
}
