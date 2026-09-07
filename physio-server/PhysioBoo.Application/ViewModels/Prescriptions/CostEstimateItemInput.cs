namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed record CostEstimateItemInput
    (
        Guid MedicineId,
        int QuantityPrescribed,
        decimal ClientPricePerUnit
    );
}
