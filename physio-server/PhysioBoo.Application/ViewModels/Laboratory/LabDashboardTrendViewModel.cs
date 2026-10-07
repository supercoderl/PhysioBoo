namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabTrendPointViewModel(string Label, double Value);

    public sealed record LabDashboardTrendViewModel(
        List<LabTrendPointViewModel> DailyOrders,
        List<LabTrendPointViewModel> TurnaroundTime,
        List<LabTrendPointViewModel> PendingSamplesByStage,
        List<LabTrendPointViewModel> TestCategories,
        double CriticalResultRate,
        List<LabTrendPointViewModel> TechnicianWorkload
    );
}
