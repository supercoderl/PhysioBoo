using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Medicines
{
    public sealed record CreateMedicineViewModel
    (
        Guid Id,
        string Name,
        string? GenericName,
        string? BrandName,
        Guid CategoryId,
        Guid ManufacturerId,
        string? Composition,
        string? Strength,
        DosageForm DosageForm,
        string? RouteOfAdministration,
        string? PackSize,
        decimal? Mrp,
        decimal? PurchasePrice,
        decimal? SellingPrice,
        string? HsnCode,
        string? DrugCode,
        string? BatchNumber,
        DateOnly? ManufacturingDate,
        DateOnly? ExpiryDate,
        string? ControlledSubstanceSchedule,
        int? MaximumAge,
        string? PregnancyCategory,
        int? StorageTemperatureMin,
        int? StorageTemperatureMax,
        string? StorageConditions,
        string? SideEffects,
        string? Contraindications,
        string? DrugInteractions,
        string? OverdoseSymptoms,
        string? UsageInstructions,
        string[] WarningLabels,
        string? Barcode,
        string? QrCode,
        string? ImageUrl,
        string? BanReason,
        string? TherapeuticClass,
        string? PharmacologicalClass,
        string? ApprovalNumber,
        DateOnly? ApprovalDate
    );
}
