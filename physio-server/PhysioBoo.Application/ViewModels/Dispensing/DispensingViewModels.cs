namespace PhysioBoo.Application.ViewModels.Dispensing
{
    public sealed class DispenseQueueItemViewModel
    {
        public Guid QueueId { get; set; }
        public int QueueNumber { get; set; }
        public string PrescriptionNumber { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string Mrn { get; set; } = string.Empty;
        public string WardOrClinic { get; set; } = string.Empty;
        public string Priority { get; set; } = "Normal";
        public string PrescribingDoctor { get; set; } = string.Empty;
        public int MedicationCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public sealed class DispenseQueueStatsViewModel
    {
        public int PendingCount { get; set; }
        public int InProgressCount { get; set; }
        public int CompletedTodayCount { get; set; }
        public double AverageDispensingMinutes { get; set; }
    }

    public sealed class DispenseBatchOptionViewModel
    {
        public string BatchNo { get; set; } = string.Empty;
        public DateOnly? ExpiryDate { get; set; }
        public int QuantityAvailable { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool IsNearExpiry { get; set; }
        public bool IsExpired { get; set; }
    }

    public sealed class DispenseMedicineAlternativeViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public int Stock { get; set; }
    }

    public sealed class DispenseClinicalWarningViewModel
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Recommendation { get; set; }
        public bool Acknowledged { get; set; }
    }

    public sealed class DispenseMedicationItemViewModel
    {
        public Guid Id { get; set; }
        public Guid MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string? Strength { get; set; }
        public string? DosageForm { get; set; }
        public string? Route { get; set; }
        public string Dose { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int QtyPrescribed { get; set; }
        public int QtyToDispense { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ShelfLocation { get; set; } = string.Empty;
        public string BatchNo { get; set; } = string.Empty;
        public DateOnly? ExpiryDate { get; set; }
        public List<DispenseBatchOptionViewModel> AvailableBatches { get; set; } = new();
        public bool IsControlledSubstance { get; set; }
        public bool IsHighAlert { get; set; }
        public List<DispenseClinicalWarningViewModel> Warnings { get; set; } = new();
        public List<DispenseMedicineAlternativeViewModel> Alternatives { get; set; } = new();
    }

    public sealed class DispensePatientSummaryViewModel
    {
        public Guid PatientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Mrn { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public int AgeYears { get; set; }
        public List<string> Allergies { get; set; } = new();
        public string? AllergyFreeText { get; set; }
        public List<string> ChronicConditions { get; set; } = new();
        public string? PrimaryDiagnosis { get; set; }
        public string? InsuranceProvider { get; set; }
        public bool InsuranceCovered { get; set; }
        public bool IsPregnant { get; set; }
        public bool IsPediatric { get; set; }
        public bool IsElderly { get; set; }
        public bool IsHighRisk { get; set; }
    }

    public sealed class DispenseWorkspaceViewModel
    {
        public Guid WorkspaceId { get; set; }
        public Guid QueueId { get; set; }
        public string PrescriptionNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CurrentStage { get; set; } = string.Empty;
        public string PrescribingDoctor { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? DispensingStartedAt { get; set; }
        public DispensePatientSummaryViewModel Patient { get; set; } = new();
        public List<DispenseMedicationItemViewModel> Items { get; set; } = new();
        public string PharmacistNotes { get; set; } = string.Empty;
    }

    public sealed class DispenseSummaryViewModel
    {
        public Guid WorkspaceId { get; set; }
        public int ItemsDispensedCount { get; set; }
        public int ItemsRemainingCount { get; set; }
        public int InventoryChangesCount { get; set; }
        public decimal InsuranceCoverageAmount { get; set; }
        public decimal PatientPaymentAmount { get; set; }
        public int DispensingTimeSeconds { get; set; }
        public string PharmacistName { get; set; } = string.Empty;
    }

    public sealed class DispenseMedicineDetailViewModel
    {
        public Guid MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string GenericName { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public List<DispenseStockLocationViewModel> StockByLocation { get; set; } = new();
        public List<DispenseMedicineAlternativeViewModel> Alternatives { get; set; } = new();
        public List<string> InteractionWarnings { get; set; } = new();
        public List<DispenseHistoryEntryViewModel> DispensingHistory { get; set; } = new();
    }

    public sealed class DispenseStockLocationViewModel
    {
        public string Location { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public sealed class DispenseHistoryEntryViewModel
    {
        public DateTime Date { get; set; }
        public int Quantity { get; set; }
        public string Pharmacist { get; set; } = string.Empty;
    }

    public sealed record UpdateDispenseItemViewModel(int? QtyToDispense, string? Status, string? BatchNo);

    public sealed record ReplaceDispenseItemViewModel(Guid AlternativeMedicineId, string? Reason);

    public sealed record DispenseNoteViewModel(string? Note);

    public sealed record ScanDispenseItemViewModel(string Barcode);

    public sealed record DispenseReasonViewModel(string? Reason);

    public sealed record CompleteDispensingViewModel(string? PharmacistNotes);
}
