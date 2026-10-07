namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record RadiologyStatsViewModel(
        int TotalOrders,
        int WaitingForScheduling,
        int ScheduledStudies,
        int InProgress,
        int PendingReporting,
        int PendingVerification,
        int CompletedStudies,
        int CriticalFindings,
        double AverageTatHours
    );

    public sealed record RadiologyTrendPointViewModel(string Label, double Value);

    public sealed record RadiologyDashboardTrendViewModel(
        List<RadiologyTrendPointViewModel> ImagingVolume,
        List<RadiologyTrendPointViewModel> TurnaroundTime,
        List<RadiologyTrendPointViewModel> ModalityUtilization,
        List<RadiologyTrendPointViewModel> PendingReportsByStatus,
        double CriticalFindingRate,
        List<RadiologyTrendPointViewModel> RadiologistWorkload,
        List<RadiologyTrendPointViewModel> EquipmentUtilization
    );

    public sealed record RadiologyPatientStudySummaryViewModel(
        Guid PatientId,
        string FullName,
        string Mrn,
        string VisitNumber,
        string DepartmentName
    );
}
