namespace PhysioBoo.Application.Queries.MedicineInventories.GetBatchBarcode
{
    /// <summary>
    /// Code 128 label for a batch (encodes the batch number), as an SVG data URL.
    /// </summary>
    public sealed record GetBatchBarcodeQuery(Guid BatchId) : IRequest<string?>;
}
