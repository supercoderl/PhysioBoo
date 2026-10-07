namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabStatsViewModel(
        int TotalOrders,
        int PendingCollection,
        int CollectedSamples,
        int InProcessing,
        int PendingVerification,
        int CompletedTests,
        int CriticalResults,
        double AverageTatHours
    );
}
